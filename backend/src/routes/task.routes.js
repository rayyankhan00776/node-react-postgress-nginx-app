const express = require('express');
const TaskController = require('../controllers/task.controller');
const auth = require('../middlewares/auth.middleware');
const { createTaskValidator, updateTaskValidator } = require('../validators/task.validator');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All task routes require authentication
router.use(auth);

router.post('/', createTaskValidator, validate, TaskController.createTask);
router.get('/', TaskController.listTasks);
router.get('/:id', TaskController.getTask);
router.put('/:id', updateTaskValidator, validate, TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
