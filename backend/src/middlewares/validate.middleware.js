const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format validation errors for API consumers
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    // Create an error object with validation details attached
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.status = 'fail';
    error.errors = formattedErrors;

    return next(error);
  }
  next();
};
