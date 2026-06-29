const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const routes = require('./routes');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const { NotFoundError } = require('./utils/errors');

const app = express();

// Set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false // Allows loading uploaded avatars from local static server
  })
);

// Enable CORS
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (avatars)
app.use('/uploads', express.static(config.UPLOAD_PATH));

// Apply global rate limiting to API endpoints
app.use('/api', globalLimiter);

// Mount main routing index
app.use('/api', routes);

// Handle 404 errors for undefined endpoints
app.use((req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server.`));
});

// Centralized error handling middleware
app.use(errorMiddleware);

module.exports = app;
