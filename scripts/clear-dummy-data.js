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

// Clear dummy data function
const clearDummyData = async () => {
  console.log('🧹 Starting dummy data cleanup...\n');
  
  // Create database connections
  const authPool = new Pool(authDbConfig);
  const jobsPool = new Pool(jobsDbConfig);
  
  try {
    // Test connections
    await authPool.query('SELECT NOW()');
    console.log('✅ Connected to auth database');
    
    await jobsPool.query('SELECT NOW()');
    console.log('✅ Connected to jobs database\n');
    
    // Get counts before deletion
    const userCountBefore = await authPool.query('SELECT COUNT(*) FROM users');
    const jobCountBefore = await jobsPool.query('SELECT COUNT(*) FROM jobs');
    
    console.log('📊 Data before cleanup:');
    console.log(`👥 Users: ${userCountBefore.rows[0].count}`);
    console.log(`💼 Jobs: ${jobCountBefore.rows[0].count}\n`);
    
    // Clear jobs first (due to foreign key constraints)
    console.log('🗑️  Clearing jobs...');
    const jobsResult = await jobsPool.query('DELETE FROM jobs');
    console.log(`✅ Deleted ${jobsResult.rowCount} jobs`);
    
    // Clear users
    console.log('🗑️  Clearing users...');
    const usersResult = await authPool.query('DELETE FROM users');
    console.log(`✅ Deleted ${usersResult.rowCount} users`);
    
    // Get counts after deletion
    const userCountAfter = await authPool.query('SELECT COUNT(*) FROM users');
    const jobCountAfter = await jobsPool.query('SELECT COUNT(*) FROM jobs');
    
    console.log('\n📊 Data after cleanup:');
    console.log(`👥 Users: ${userCountAfter.rows[0].count}`);
    console.log(`💼 Jobs: ${jobCountAfter.rows[0].count}`);
    
    console.log('\n🎉 Dummy data cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
  } finally {
    await authPool.end();
    await jobsPool.end();
  }
};

// Run the script
if (require.main === module) {
  clearDummyData();
}

module.exports = { clearDummyData }; 