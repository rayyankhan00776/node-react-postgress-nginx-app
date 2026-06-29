const db = require('../config/db');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

class ProjectService {
  async createProject(userId, name, description) {
    const newProject = await db.query(
      `INSERT INTO projects (user_id, name, description, is_archived) 
       VALUES ($1, $2, $3, false) 
       RETURNING *`,
      [userId, name, description]
    );
    return newProject.rows[0];
  }

  async getProjectById(userId, projectId) {
    const projectRes = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectRes.rows.length === 0) {
      throw new NotFoundError('Project not found.');
    }

    const project = projectRes.rows[0];
    if (project.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to access this project.');
    }

    return project;
  }

  async updateProject(userId, projectId, name, description, is_archived) {
    // Check ownership first
    const project = await this.getProjectById(userId, projectId);

    const updatedProject = await db.query(
      `UPDATE projects 
       SET name = $1, description = $2, is_archived = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [
        name !== undefined ? name : project.name,
        description !== undefined ? description : project.description,
        is_archived !== undefined ? is_archived : project.is_archived,
        projectId
      ]
    );

    return updatedProject.rows[0];
  }

  async deleteProject(userId, projectId) {
    // Check ownership first
    await this.getProjectById(userId, projectId);

    await db.query('DELETE FROM projects WHERE id = $1', [projectId]);
    return true;
  }

  async archiveProject(userId, projectId) {
    // Check ownership first
    await this.getProjectById(userId, projectId);

    const updatedProject = await db.query(
      `UPDATE projects 
       SET is_archived = true, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [projectId]
    );

    return updatedProject.rows[0];
  }

  async listProjects(userId, options = {}) {
    const search = options.search || '';
    const filter = options.filter || 'active'; // active, archived, all
    const sortBy = options.sortBy || 'created_at'; // name, created_at
    const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const limit = parseInt(options.limit) || 10;
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM projects WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;

    // Search condition
    if (search) {
      queryText += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filter condition
    if (filter === 'active') {
      queryText += ` AND is_archived = false`;
    } else if (filter === 'archived') {
      queryText += ` AND is_archived = true`;
    } // 'all' requires no extra conditions

    // Count total rows matching criteria
    let countQueryText = queryText.replace('SELECT *', 'SELECT COUNT(*)');
    const totalRes = await db.query(countQueryText, queryParams);
    const total = parseInt(totalRes.rows[0].count);

    // Sorting and Pagination
    const allowedSortCols = ['name', 'created_at', 'updated_at'];
    const sortCol = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';
    
    queryText += ` ORDER BY ${sortCol} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const projectsRes = await db.query(queryText, queryParams);

    return {
      projects: projectsRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getDashboardStats(userId) {
    // Total Projects
    const totalProjectsRes = await db.query(
      'SELECT COUNT(*) FROM projects WHERE user_id = $1',
      [userId]
    );
    const totalProjects = parseInt(totalProjectsRes.rows[0].count);

    // Active projects count
    const activeProjectsRes = await db.query(
      'SELECT COUNT(*) FROM projects WHERE user_id = $1 AND is_archived = false',
      [userId]
    );
    const activeProjects = parseInt(activeProjectsRes.rows[0].count);

    // Tasks metrics
    // Fetch all tasks for user projects
    const tasksMetricsRes = await db.query(
      `SELECT 
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status != 'Completed' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN t.status = 'Todo' THEN 1 ELSE 0 END) as todo_tasks,
        SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN t.status = 'Review' THEN 1 ELSE 0 END) as review_tasks
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = $1 AND p.is_archived = false`,
      [userId]
    );

    const stats = tasksMetricsRes.rows[0];
    const totalTasks = parseInt(stats.total_tasks) || 0;
    const completedTasks = parseInt(stats.completed_tasks) || 0;
    const pendingTasks = parseInt(stats.pending_tasks) || 0;
    const todoTasks = parseInt(stats.todo_tasks) || 0;
    const inProgressTasks = parseInt(stats.in_progress_tasks) || 0;
    const reviewTasks = parseInt(stats.review_tasks) || 0;

    // Fetch task count grouped by priority
    const priorityStatsRes = await db.query(
      `SELECT t.priority, COUNT(t.id) as count
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = $1 AND p.is_archived = false
       GROUP BY t.priority`,
      [userId]
    );

    const priorities = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };

    priorityStatsRes.rows.forEach(row => {
      if (priorities[row.priority] !== undefined) {
        priorities[row.priority] = parseInt(row.count);
      }
    });

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        archived: totalProjects - activeProjects
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        statusBreakdown: {
          todo: todoTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          completed: completedTasks
        },
        priorityBreakdown: priorities
      }
    };
  }
}

module.exports = new ProjectService();
