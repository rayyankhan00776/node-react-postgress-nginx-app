const { body } = require('express-validator');

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 150 })
    .withMessage('Project name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

const updateProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 150 })
    .withMessage('Project name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('is_archived')
    .optional()
    .isBoolean()
    .withMessage('is_archived must be a boolean')
];

module.exports = {
  createProjectValidator,
  updateProjectValidator
};
