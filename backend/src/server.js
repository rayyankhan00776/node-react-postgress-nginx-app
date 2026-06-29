const app = require('./app');
const config = require('./config/config');

const PORT = config.PORT || 5050;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` TaskFlow Pro Server running on port ${PORT}`);
  console.log(` Environment: ${config.NODE_ENV}`);
  console.log(` CORS Allowed Origin: ${config.CORS_ORIGIN}`);
  console.log(`=========================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down server safely...');
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down server immediately...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});
