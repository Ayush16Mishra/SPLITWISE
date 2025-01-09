// Load environment variables from the .env file
require('dotenv').config();
// Import the PostgreSQL client from pg package
const { Client } = require('pg');
// Set up the PostgreSQL client using environment variables
const client = new Client({
  host: process.env.DB_HOST,        // Database host (localhost)
  port: process.env.DB_PORT,        // Database port (5432 by default)
  user: process.env.DB_USER,        // Database user (postgres)
  password: process.env.DB_PASSWORD, // Your database password
  database: process.env.DB_NAME,     // The name of your database (split)
  ssl: {
    rejectUnauthorized: false       // Required for some hosted databases
  }
});
// Connect to PostgreSQL
client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Export the client to use in other files
module.exports = client;
