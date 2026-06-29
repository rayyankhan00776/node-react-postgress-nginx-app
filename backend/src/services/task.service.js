const db = require('../config/db');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const ProjectService = require('./project.service');

class TaskService {
  async createTask(userId, projectId, taskData) {
    // 1. Verify project exists and belongs to user
    await ProjectService.getProjectById(userId, projectId);

    const { title, description, priority, status, due_date, user_id } = taskData;
    
    // Assignee defaults to the creator if not specified
    const assigneeId = user_id || userId;

    const newTask = await db.query(
      `INSERT INTO tasks (project_id, user_id, title, description, priority, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        projectId,
        assigneeId,
        title,
        description || '',
        priority || 'Medium',
        status || 'Todo',
        due_date || null
      ]
    );

    return newTask.rows[0];
  }

  async getTaskById(userId, taskId) {
    // Fetch task and join project to verify ownership
    const taskRes = await db.query(
      `SELECT t.*, p.name as project_name, p.user_id as project_owner_id, u.name as assignee_name, u.email as assignee_email
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [taskId]
    );

    if (taskRes.rows.length === 0) {
      throw new NotFoundError('Task not found.');
    }

    const task = taskRes.rows[0];
    if (task.project_owner_id !== userId) {
      throw new ForbiddenError('You do not have permission to access this task.');
    }

    // Clean up response properties
    delete task.project_owner_id;

    return task;
  }

  async updateTask(userId, taskId, updateData) {
    // 1. Check if task exists and belongs to user
    const task = await this.getTaskById(userId, taskId);

    const { title, description, priority, status, due_date, user_id } = updateData;

    const updatedTask = await db.query(
      `UPDATE tasks 
       SET 
         title = $1, 
         description = $2, 
         priority = $3, 
         status = $4, 
         due_date = $5, 
         user_id = $6,
         updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        title !== undefined ? title : task.title,
        description !== undefined ? description : task.description,
        priority !== undefined ? priority : task.priority,
        status !== undefined ? status : task.status,
        due_date !== undefined ? due_date : task.due_date,
        user_id !== undefined ? user_id : task.user_id,
        taskId
      ]
    );

    return updatedTask.rows[0];
  }

  async deleteTask(userId, taskId) {
    // Check ownership
    await this.getTaskById(userId, taskId);

    await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    return true;
  }

  async listTasks(userId, options = {}) {
    const {
      projectId,
      search,
      status,
      priority,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 10,
      page = 1
    } = options;

    const limitVal = parseInt(limit) || 10;
    const pageVal = parseInt(page) || 1;
    const offset = (pageVal - 1) * limitVal;

    // Base query links tasks and projects to filter by user's owned projects
    let queryText = `
      SELECT t.*, p.name as project_name 
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = $1
    `;
    const queryParams = [userId];
    let paramIndex = 2;

    // Filter by specific project
    if (projectId) {
      queryText += ` AND t.project_id = $${paramIndex}`;
      queryParams.push(projectId);
      paramIndex++;
    }

    // Search condition
    if (search) {
      queryText += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (status) {
      queryText += ` AND t.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Priority filter
    if (priority) {
      queryText += ` AND t.priority = $${paramIndex}`;
      queryParams.push(priority);
      paramIndex++;
    }

    // Calculate count query
    const countQueryText = `
      SELECT COUNT(*) 
      FROM (${queryText}) as count_table
    `;
    const countRes = await db.query(countQueryText, queryParams);
    const total = parseInt(countRes.rows[0].count);

    // Apply Sorting
    const allowedSortCols = ['title', 'priority', 'status', 'due_date', 'created_at', 'updated_at'];
    const sortCol = allowedSortCols.includes(sortBy) ? `t.${sortBy}` : 't.created_at';
    const orderDir = sortOrder === 'asc' ? 'ASC' : 'DESC';
    queryText += ` ORDER BY ${sortCol} ${orderDir}`;

    // Apply Pagination
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limitVal, offset);

    const tasksRes = await db.query(queryText, queryParams);

    return {
      tasks: tasksRes.rows,
      pagination: {
        total,
        page: pageVal,
        limit: limitVal,
        totalPages: Math.ceil(total / limitVal)
      }
    };
  }
}

module.exports = new TaskService();
