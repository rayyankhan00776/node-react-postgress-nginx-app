const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: false // DevOps components like SSL are handled externally, so local PG connection is non-SSL.
});

// Database connection test helper
pool.on('connect', () => {
  if (config.NODE_ENV !== 'test') {
    console.log('Database connected successfully');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
