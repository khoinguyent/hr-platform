const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initializeDatabase() {
  try {
    console.log('Connecting to the database to initialize schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await db.query(schemaSql);
    console.log('Database schema checked/initialized successfully.');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    process.exit(1); // Exit if we can't initialize the DB
  }
}

// We only want to run this if the script is executed directly
if (require.main === module) {
  initializeDatabase();
}