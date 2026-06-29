const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const taskRoutes = require('./task.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

// Simple healthcheck route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TaskFlow Pro API is running smoothly',
    timestamp: new Date()
  });
});

module.exports = router;
