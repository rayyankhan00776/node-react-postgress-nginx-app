const TaskService = require('../services/task.service');

class TaskController {
  async createTask(req, res, next) {
    try {
      const { projectId, title, description, priority, status, due_date, user_id } = req.body;
      const task = await TaskService.createTask(req.user.id, parseInt(projectId), {
        title,
        description,
        priority,
        status,
        due_date,
        user_id: user_id ? parseInt(user_id) : null
      });

      res.status(201).json({
        status: 'success',
        message: 'Task created successfully!',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await TaskService.getTaskById(req.user.id, parseInt(id));

      res.status(200).json({
        status: 'success',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, priority, status, due_date, user_id } = req.body;
      
      const task = await TaskService.updateTask(req.user.id, parseInt(id), {
        title,
        description,
        priority,
        status,
        due_date,
        user_id: user_id !== undefined ? (user_id ? parseInt(user_id) : null) : undefined
      });

      res.status(200).json({
        status: 'success',
        message: 'Task updated successfully!',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      await TaskService.deleteTask(req.user.id, parseInt(id));

      res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully!'
      });
    } catch (error) {
      next(error);
    }
  }

  async listTasks(req, res, next) {
    try {
      const { projectId, search, status, priority, sortBy, sortOrder, limit, page } = req.query;
      const result = await TaskService.listTasks(req.user.id, {
        projectId: projectId ? parseInt(projectId) : undefined,
        search,
        status,
        priority,
        sortBy,
        sortOrder,
        limit,
        page
      });

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
