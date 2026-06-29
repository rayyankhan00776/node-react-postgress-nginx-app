const express = require('express');
const ProjectController = require('../controllers/project.controller');
const auth = require('../middlewares/auth.middleware');
const { createProjectValidator, updateProjectValidator } = require('../validators/project.validator');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All project routes require authentication
router.use(auth);

router.post('/', createProjectValidator, validate, ProjectController.createProject);
router.get('/', ProjectController.listProjects);
router.get('/stats', ProjectController.getDashboardStats); // Place before :id to prevent collision
router.get('/:id', ProjectController.getProject);
router.put('/:id', updateProjectValidator, validate, ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
router.patch('/:id/archive', ProjectController.archiveProject);

module.exports = router;
