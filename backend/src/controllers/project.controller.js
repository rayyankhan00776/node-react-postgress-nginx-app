const ProjectService = require('../services/project.service');

class ProjectController {
  async createProject(req, res, next) {
    try {
      const { name, description } = req.body;
      const project = await ProjectService.createProject(req.user.id, name, description);

      res.status(201).json({
        status: 'success',
        message: 'Project created successfully!',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  async getProject(req, res, next) {
    try {
      const { id } = req.params;
      const project = await ProjectService.getProjectById(req.user.id, parseInt(id));

      res.status(200).json({
        status: 'success',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, is_archived } = req.body;
      const project = await ProjectService.updateProject(req.user.id, parseInt(id), name, description, is_archived);

      res.status(200).json({
        status: 'success',
        message: 'Project updated successfully!',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      await ProjectService.deleteProject(req.user.id, parseInt(id));

      res.status(200).json({
        status: 'success',
        message: 'Project deleted successfully!'
      });
    } catch (error) {
      next(error);
    }
  }

  async archiveProject(req, res, next) {
    try {
      const { id } = req.params;
      const project = await ProjectService.archiveProject(req.user.id, parseInt(id));

      res.status(200).json({
        status: 'success',
        message: 'Project archived successfully!',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  async listProjects(req, res, next) {
    try {
      const { search, filter, sortBy, sortOrder, limit, page } = req.query;
      const result = await ProjectService.listProjects(req.user.id, {
        search,
        filter,
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

  async getDashboardStats(req, res, next) {
    try {
      const stats = await ProjectService.getDashboardStats(req.user.id);
      
      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();
