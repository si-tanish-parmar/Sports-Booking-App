const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost', // e.g., localhost
  database: 'sports_app',
  password: 'postgres',
  port: 5432, // PostgreSQL default port
});

module.exports = pool; // Use dot, not a space, between module and exports
