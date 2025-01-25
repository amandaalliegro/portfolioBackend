const { Pool } = require('pg');
require('dotenv').config();

// Create a new connection pool for the PostgreSQL database
const pool = new Pool({
  host: process.env.DB_HOST,       
  port: process.env.DB_PORT,       
  user: process.env.DB_USER,       // Username for database authentication
  password: process.env.DB_PASSWORD, // Password for the database user
  database: process.env.DB_NAME,   // Name of the database to connect to
});

module.exports = pool;
