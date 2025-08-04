const { Pool } = require('pg');

// Database configuration
const authDbConfig = {
  user: process.env.DB_USER || 'auth_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'auth_db',
  password: process.env.DB_PASSWORD || 'auth_password',
  port: process.env.DB_PORT || 5432,
};

const jobsDbConfig = {
  user: process.env.DB_USER || 'jobs_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'jobs_db',
  password: process.env.DB_PASSWORD || 'jobs_password',
  port: process.env.DB_PORT || 5433,
};

const testConnections = async () => {
  console.log('🔍 Testing database connections...\n');
  
  // Test auth database
  const authPool = new Pool(authDbConfig);
  try {
    const authResult = await authPool.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ Auth Database Connected:');
    console.log(`   Database: ${authResult.rows[0].db}`);
    console.log(`   Time: ${authResult.rows[0].time}`);
    
    // Check if users table exists
    const usersTable = await authPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (usersTable.rows[0].exists) {
      const userCount = await authPool.query('SELECT COUNT(*) FROM users');
      console.log(`   Users table: ✅ (${userCount.rows[0].count} users)`);
    } else {
      console.log('   Users table: ❌ (not found)');
    }
    
  } catch (error) {
    console.log('❌ Auth Database Connection Failed:');
    console.log(`   Error: ${error.message}`);
  } finally {
    await authPool.end();
  }
  
  console.log('');
  
  // Test jobs database
  const jobsPool = new Pool(jobsDbConfig);
  try {
    const jobsResult = await jobsPool.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ Jobs Database Connected:');
    console.log(`   Database: ${jobsResult.rows[0].db}`);
    console.log(`   Time: ${jobsResult.rows[0].time}`);
    
    // Check if jobs table exists
    const jobsTable = await jobsPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs'
      );
    `);
    
    if (jobsTable.rows[0].exists) {
      const jobCount = await jobsPool.query('SELECT COUNT(*) FROM jobs');
      console.log(`   Jobs table: ✅ (${jobCount.rows[0].count} jobs)`);
    } else {
      console.log('   Jobs table: ❌ (not found)');
    }
    
  } catch (error) {
    console.log('❌ Jobs Database Connection Failed:');
    console.log(`   Error: ${error.message}`);
  } finally {
    await jobsPool.end();
  }
  
  console.log('\n🎯 Ready to generate dummy data!');
  console.log('💡 Run: npm run generate-data');
};

// Run the test
if (require.main === module) {
  testConnections();
}

module.exports = { testConnections }; 