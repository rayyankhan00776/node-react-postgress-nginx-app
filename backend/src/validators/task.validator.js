const { body } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be one of: Low, Medium, High, Critical'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Review', 'Completed'])
    .withMessage('Status must be one of: Todo, In Progress, Review, Completed'),
  body('due_date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date'),
  body('user_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt()
    .withMessage('Assigned user_id must be an integer')
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be one of: Low, Medium, High, Critical'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Review', 'Completed'])
    .withMessage('Status must be one of: Todo, In Progress, Review, Completed'),
  body('due_date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date'),
  body('user_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt()
    .withMessage('Assigned user_id must be an integer')
];

module.exports = {
  createTaskValidator,
  updateTaskValidator
};
