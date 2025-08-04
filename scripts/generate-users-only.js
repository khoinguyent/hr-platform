const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Database configuration for auth service
const authDbConfig = {
  user: process.env.DB_USER || 'auth_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'auth_db',
  password: process.env.DB_PASSWORD || 'auth_password',
  port: process.env.DB_PORT || 5432,
};

// Dummy data arrays
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Jessica',
  'Robert', 'Amanda', 'William', 'Ashley', 'Richard', 'Stephanie', 'Joseph',
  'Nicole', 'Thomas', 'Elizabeth', 'Christopher', 'Helen', 'Charles', 'Deborah',
  'Daniel', 'Rachel', 'Matthew', 'Carolyn', 'Anthony', 'Janet', 'Mark', 'Catherine',
  'Donald', 'Maria', 'Steven', 'Heather', 'Paul', 'Diane', 'Andrew', 'Ruth',
  'Joshua', 'Julie', 'Kenneth', 'Joyce', 'Kevin', 'Virginia', 'Brian', 'Victoria',
  'George', 'Kelly', 'Timothy', 'Lauren', 'Ronald', 'Christine', 'Jason', 'Joan'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
];

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// Generate dummy users
const generateUsers = async (authPool, count = 50) => {
  console.log(`Generating ${count} users...`);
  
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const password = 'password123'; // Default password for testing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    users.push({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      is_admin: Math.random() < 0.1 // 10% chance of being admin
    });
  }
  
  // Insert users into database
  let createdCount = 0;
  for (const user of users) {
    try {
      const query = `
        INSERT INTO users(email, password_hash, first_name, last_name, is_admin)
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email, first_name, last_name;
      `;
      
      const result = await authPool.query(query, [
        user.email,
        user.password_hash,
        user.first_name,
        user.last_name,
        user.is_admin
      ]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Created user: ${user.email} (${user.is_admin ? 'Admin' : 'User'})`);
        createdCount++;
      } else {
        console.log(`⏭️  User already exists: ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error.message);
    }
  }
  
  return createdCount;
};

// Main function
const generateUsersOnly = async () => {
  console.log('👥 Starting user generation...\n');
  
  // Create database connection
  const authPool = new Pool(authDbConfig);
  
  try {
    // Test connection
    await authPool.query('SELECT NOW()');
    console.log('✅ Connected to auth database\n');
    
    // Generate users
    const createdCount = await generateUsers(authPool, 50);
    console.log(`\n✅ User generation completed! Created ${createdCount} new users.`);
    
    // Display summary
    const userCount = await authPool.query('SELECT COUNT(*) FROM users');
    const adminCount = await authPool.query("SELECT COUNT(*) FROM users WHERE is_admin = true");
    
    console.log('\n📊 User Summary:');
    console.log(`👥 Total Users: ${userCount.rows[0].count}`);
    console.log(`👑 Admin Users: ${adminCount.rows[0].count}`);
    console.log(`👤 Regular Users: ${userCount.rows[0].count - adminCount.rows[0].count}`);
    
    console.log('\n📝 Test Credentials:');
    console.log('Email: john.smith0@example.com');
    console.log('Password: password123');
    
    // Show some sample users
    const sampleUsers = await authPool.query(`
      SELECT email, first_name, last_name, is_admin 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n🔍 Sample Users:');
    sampleUsers.rows.forEach(user => {
      console.log(`• ${user.email} (${user.first_name} ${user.last_name}) ${user.is_admin ? '👑' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error generating users:', error);
  } finally {
    await authPool.end();
  }
};

// Run the script
if (require.main === module) {
  generateUsersOnly();
}

module.exports = { generateUsersOnly }; 