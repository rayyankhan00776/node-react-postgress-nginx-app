const config = require('../config/config');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific database/library errors
  if (err.code === '23505') {
    // Unique violation in PostgreSQL
    err.statusCode = 409;
    err.message = 'A resource with this key already exists.';
    err.status = 'fail';
  }

  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token. Please log in again.';
    err.status = 'fail';
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Your session has expired. Please log in again.';
    err.status = 'fail';
  }

  // Response structure
  const errorResponse = {
    status: err.status,
    message: err.message || 'Internal Server Error'
  };

  // Include validation errors if available (from express-validator formatting)
  if (err.errors) {
    errorResponse.errors = err.errors;
  }

  // Stack trace only in development
  if (config.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(err.statusCode).json(errorResponse);
};
