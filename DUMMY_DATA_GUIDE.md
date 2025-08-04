# 🎯 Dummy Data Generation Guide

This guide explains how to use the dummy data generation scripts to populate your HR Platform with realistic test data.

## 📋 **What's Generated**

### **👥 Users (50 by default)**
- Realistic names and email addresses
- Hashed passwords (all use `password123`)
- 10% admin users (random selection)
- Sample: `john.smith0@example.com`

### **💼 Jobs (100 by default)**
- 30 different tech companies
- 30 job titles (Software Engineer, DevOps, etc.)
- 30 US locations (San Francisco, New York, etc.)
- 40+ technical skills
- 24 different benefits
- Salary ranges: $40k - $250k
- Various job types, experience levels, and remote options

## 🚀 **Quick Start**

### **1. Navigate to Scripts Directory**
```bash
cd hr-platform/scripts
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Test Database Connections**
```bash
npm test
```

### **4. Generate Data**
```bash
# Generate everything
npm run generate-data

# Or generate separately
npm run generate-users
npm run generate-jobs
```

## 🔧 **Available Commands**

| Command | Description | Output |
|---------|-------------|--------|
| `npm test` | Test database connections | Connection status |
| `npm run generate-data` | Generate users + jobs | 50 users, 100 jobs |
| `npm run generate-users` | Generate users only | 50 users |
| `npm run generate-jobs` | Generate jobs only | 100 jobs |
| `npm run clear-data` | Clear all dummy data | Empty databases |

## 📊 **Sample Output**

### **After Generating Users**
```
✅ Created user: john.smith0@example.com (User)
✅ Created user: jane.johnson1@example.com (Admin) 👑
✅ Created user: michael.williams2@example.com (User)

📊 User Summary:
👥 Total Users: 50
👑 Admin Users: 5
👤 Regular Users: 45
```

### **After Generating Jobs**
```
✅ Created job: Software Engineer at TechCorp (active)
✅ Created job: Frontend Developer at InnovateSoft (active)
✅ Created job: DevOps Engineer at CloudTech (active)

📊 Job Summary:
💼 Total Jobs: 100
🟢 Active Jobs: 75
🏠 Remote Jobs: 30

📈 Jobs by Type:
• full-time: 45
• contract: 25
• part-time: 15
• internship: 10
• freelance: 5
```

## 🎯 **Test Credentials**

After generating users, you can test the system with:

```
Email: john.smith0@example.com
Password: password123
```

## 🐳 **Docker Environment**

If you're running the platform with Docker:

### **Option 1: Run from Host**
```bash
cd scripts
DB_HOST=localhost DB_PORT=5432 npm run generate-data
```

### **Option 2: Run in Container**
```bash
# Copy scripts to container
docker cp scripts/ auth-service:/app/scripts/

# Run in container
docker-compose exec auth-service node /app/scripts/generate-dummy-data.js
```

## 🔍 **Verifying Generated Data**

### **Check Users in Database**
```sql
-- Connect to auth database
SELECT email, first_name, last_name, is_admin, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Check Jobs in Database**
```sql
-- Connect to jobs database
SELECT title, company_name, location, salary_min, salary_max, status 
FROM jobs 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Check Job Distribution**
```sql
-- Jobs by status
SELECT status, COUNT(*) FROM jobs GROUP BY status;

-- Jobs by location
SELECT location, COUNT(*) FROM jobs GROUP BY location ORDER BY COUNT(*) DESC LIMIT 10;

-- Jobs by company
SELECT company_name, COUNT(*) FROM jobs GROUP BY company_name ORDER BY COUNT(*) DESC LIMIT 10;
```

## 🛠️ **Customization**

### **Change Data Amounts**
Edit the script files:

```javascript
// In generate-dummy-data.js
await generateUsers(authPool, 100);  // Generate 100 users
await generateJobs(jobsPool, authPool, 200);  // Generate 200 jobs
```

### **Add Custom Companies**
```javascript
// In generate-dummy-data.js
const companies = [
  'YourCompany', 'AnotherCorp', // Add your companies
  'TechCorp', 'InnovateSoft', // ... existing companies
];
```

### **Add Custom Job Titles**
```javascript
// In generate-dummy-data.js
const jobTitles = [
  'Your Custom Role', 'Another Position', // Add your roles
  'Software Engineer', 'Frontend Developer', // ... existing titles
];
```

## 🔧 **Troubleshooting**

### **Database Connection Issues**
```bash
# Check if databases are running
docker-compose ps

# Test connections manually
docker-compose exec postgres-auth psql -U auth_user -d auth_db -c "SELECT NOW();"
docker-compose exec postgres-jobs psql -U jobs_user -d jobs_db -c "SELECT NOW();"
```

### **Permission Issues**
```bash
# Make scripts executable
chmod +x *.js
```

### **Missing Tables**
If tables don't exist, run the database migrations first:
```bash
# For auth service
docker-compose exec auth-service psql -h postgres-auth -U auth_user -d auth_db -f src/db/schema.sql

# For job service
docker-compose exec job-service psql -h postgres-jobs -U jobs_user -d jobs_db -f src/db/schema.sql
```

### **Environment Variables**
Create a `.env` file in the scripts directory:
```env
# Auth Database
DB_USER=auth_user
DB_HOST=localhost
DB_DATABASE=auth_db
DB_PASSWORD=auth_password
DB_PORT=5432

# Jobs Database
DB_USER=jobs_user
DB_HOST=localhost
DB_DATABASE=jobs_db
DB_PASSWORD=jobs_password
DB_PORT=5433
```

## 📈 **Data Statistics**

The scripts generate realistic distributions:

### **Users**
- **Total**: 50 users
- **Admins**: ~5 users (10%)
- **Regular**: ~45 users (90%)

### **Jobs**
- **Total**: 100 jobs
- **Active**: ~75 jobs (75%)
- **Remote**: ~30 jobs (30%)
- **Full-time**: ~45 jobs (45%)
- **Contract**: ~25 jobs (25%)
- **Part-time**: ~15 jobs (15%)
- **Internship**: ~10 jobs (10%)
- **Freelance**: ~5 jobs (5%)

## 🎉 **Success Indicators**

When everything works correctly, you'll see:
- ✅ Database connection confirmations
- 📊 Progress indicators for data generation
- 🎯 Sample data output
- 📈 Statistics summary
- 🎉 Completion message

## 🔄 **Workflow**

1. **Start Services**: `docker-compose up -d`
2. **Test Connections**: `npm test`
3. **Generate Data**: `npm run generate-data`
4. **Test Login**: Use `john.smith0@example.com` / `password123`
5. **Explore Jobs**: Browse the generated job listings
6. **Clear Data** (optional): `npm run clear-data`

This dummy data system provides a complete testing environment for your HR Platform! 🚀 