const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

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
  port: process.env.DB_PORT || 5433, // Different port for jobs DB
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

const companies = [
  'TechCorp', 'InnovateSoft', 'Digital Solutions', 'Future Systems', 'CloudTech',
  'DataFlow', 'SmartLogic', 'CodeCraft', 'WebWorks', 'AppFactory', 'DevStudio',
  'ByteBuilders', 'PixelPerfect', 'LogicLabs', 'InnovationHub', 'TechTitans',
  'DigitalDynamics', 'FutureForward', 'SmartSolutions', 'CodeCreators',
  'WebWizards', 'AppArchitects', 'DevDynamos', 'ByteBusters', 'PixelPioneers',
  'LogicLeaders', 'InnovationInc', 'TechTrends', 'DigitalDreams', 'FutureFocus'
];

const jobTitles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer', 'Product Manager',
  'UI/UX Designer', 'QA Engineer', 'System Administrator', 'Database Administrator',
  'Network Engineer', 'Security Engineer', 'Mobile Developer', 'Game Developer',
  'Cloud Architect', 'Data Engineer', 'Business Analyst', 'Project Manager',
  'Scrum Master', 'Technical Lead', 'Engineering Manager', 'CTO', 'CEO',
  'Marketing Manager', 'Sales Representative', 'Customer Success Manager',
  'Content Writer', 'SEO Specialist', 'Digital Marketing Specialist'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
  'Denver, CO', 'Chicago, IL', 'Los Angeles, CA', 'Portland, OR', 'Miami, FL',
  'Atlanta, GA', 'Dallas, TX', 'Phoenix, AZ', 'Las Vegas, NV', 'San Diego, CA',
  'Philadelphia, PA', 'Detroit, MI', 'Minneapolis, MN', 'Salt Lake City, UT',
  'Nashville, TN', 'Charlotte, NC', 'Raleigh, NC', 'Orlando, FL', 'Tampa, FL',
  'Houston, TX', 'San Antonio, TX', 'Kansas City, MO', 'St. Louis, MO',
  'Cincinnati, OH', 'Columbus, OH', 'Indianapolis, IN'
];

const skills = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
  'Spring Boot', 'Laravel', 'ASP.NET', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Redis', 'Elasticsearch', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'Terraform', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'GraphQL', 'REST API',
  'Microservices', 'Serverless', 'Machine Learning', 'Data Analysis', 'DevOps'
];

const benefits = [
  'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401(k) Matching',
  'Flexible PTO', 'Remote Work', 'Professional Development', 'Gym Membership',
  'Free Lunch', 'Snacks & Beverages', 'Transportation Allowance', 'Home Office Setup',
  'Conference Budget', 'Stock Options', 'Performance Bonus', 'Annual Bonus',
  'Life Insurance', 'Disability Insurance', 'Pet Insurance', 'Childcare Support',
  'Mental Health Support', 'Wellness Programs', 'Team Building Events', 'Holiday Pay'
];

const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];
const remoteOptions = ['on-site', 'remote', 'hybrid'];
const statuses = ['active', 'paused', 'closed', 'draft'];

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomElements = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomSalary = () => {
  const baseSalaries = [40000, 50000, 60000, 70000, 80000, 90000, 100000, 120000, 140000, 160000, 180000, 200000];
  const baseSalary = getRandomElement(baseSalaries);
  const minSalary = baseSalary;
  const maxSalary = baseSalary + Math.floor(Math.random() * 50000) + 10000;
  return { min: minSalary, max: maxSalary };
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

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
        console.log(`Created user: ${user.email}`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
    }
  }
  
  return users;
};

// Generate dummy jobs
const generateJobs = async (jobsPool, authPool, count = 100) => {
  console.log(`Generating ${count} jobs...`);
  
  // First, get all user IDs from auth database
  const userResult = await authPool.query('SELECT id FROM users LIMIT 50');
  const userIds = userResult.rows.map(row => row.id);
  
  if (userIds.length === 0) {
    console.error('No users found. Please generate users first.');
    return;
  }
  
  const jobs = [];
  
  for (let i = 0; i < count; i++) {
    const title = getRandomElement(jobTitles);
    const company = getRandomElement(companies);
    const location = getRandomElement(locations);
    const jobType = getRandomElement(jobTypes);
    const experienceLevel = getRandomElement(experienceLevels);
    const remoteOption = getRandomElement(remoteOptions);
    const status = getRandomElement(statuses);
    const salary = getRandomSalary();
    
    const jobSkills = getRandomElements(skills, Math.floor(Math.random() * 5) + 3);
    const jobBenefits = getRandomElements(benefits, Math.floor(Math.random() * 6) + 2);
    const postedBy = getRandomElement(userIds);
    
    const description = `We are looking for a talented ${title} to join our team at ${company}. This is an exciting opportunity to work on cutting-edge projects and grow your career.`;
    
    const requirements = `Requirements:
• ${Math.floor(Math.random() * 5) + 2}+ years of experience in ${jobSkills.slice(0, 2).join(', ')}
• Strong problem-solving skills
• Excellent communication abilities
• Team player with collaborative mindset
• Bachelor's degree in Computer Science or related field preferred`;
    
    const responsibilities = `Responsibilities:
• Develop and maintain high-quality software applications
• Collaborate with cross-functional teams
• Participate in code reviews and technical discussions
• Contribute to architectural decisions
• Mentor junior developers`;
    
    const applicationDeadline = generateRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    jobs.push({
      title,
      description,
      company_name: company,
      location,
      salary_min: salary.min,
      salary_max: salary.max,
      salary_currency: 'USD',
      job_type: jobType,
      experience_level: experienceLevel,
      remote_option: remoteOption,
      skills: jobSkills,
      benefits: jobBenefits,
      requirements,
      responsibilities,
      contact_email: `jobs@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      contact_phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      application_deadline: applicationDeadline.toISOString().split('T')[0],
      status,
      posted_by: postedBy
    });
  }
  
  // Insert jobs into database
  for (const job of jobs) {
    try {
      const query = `
        INSERT INTO jobs (
          title, description, company_name, location, salary_min, salary_max,
          salary_currency, job_type, experience_level, remote_option, skills,
          benefits, requirements, responsibilities, contact_email, contact_phone,
          application_deadline, status, posted_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id, title, company_name;
      `;
      
      const result = await jobsPool.query(query, [
        job.title,
        job.description,
        job.company_name,
        job.location,
        job.salary_min,
        job.salary_max,
        job.salary_currency,
        job.job_type,
        job.experience_level,
        job.remote_option,
        job.skills,
        job.benefits,
        job.requirements,
        job.responsibilities,
        job.contact_email,
        job.contact_phone,
        job.application_deadline,
        job.status,
        job.posted_by
      ]);
      
      if (result.rows.length > 0) {
        console.log(`Created job: ${job.title} at ${job.company_name}`);
      }
    } catch (error) {
      console.error(`Error creating job ${job.title}:`, error.message);
    }
  }
  
  return jobs;
};

// Main function
const generateDummyData = async () => {
  console.log('🚀 Starting dummy data generation...\n');
  
  // Create database connections
  const authPool = new Pool(authDbConfig);
  const jobsPool = new Pool(jobsDbConfig);
  
  try {
    // Test connections
    await authPool.query('SELECT NOW()');
    console.log('✅ Connected to auth database');
    
    await jobsPool.query('SELECT NOW()');
    console.log('✅ Connected to jobs database\n');
    
    // Generate users first
    await generateUsers(authPool, 50);
    console.log('\n✅ Users generation completed\n');
    
    // Generate jobs
    await generateJobs(jobsPool, authPool, 100);
    console.log('\n✅ Jobs generation completed\n');
    
    // Display summary
    const userCount = await authPool.query('SELECT COUNT(*) FROM users');
    const jobCount = await jobsPool.query('SELECT COUNT(*) FROM jobs');
    
    console.log('📊 Data Generation Summary:');
    console.log(`👥 Users: ${userCount.rows[0].count}`);
    console.log(`💼 Jobs: ${jobCount.rows[0].count}`);
    console.log('\n🎉 Dummy data generation completed successfully!');
    
    console.log('\n📝 Test Credentials:');
    console.log('Email: john.smith0@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error generating dummy data:', error);
  } finally {
    await authPool.end();
    await jobsPool.end();
  }
};

// Run the script
if (require.main === module) {
  generateDummyData();
}

module.exports = { generateDummyData, generateUsers, generateJobs }; 