# Dummy Data Generation Scripts

This directory contains scripts to generate and manage dummy data for testing the HR Platform.

## 📁 **Scripts Overview**

| Script | Description | Usage |
|--------|-------------|-------|
| `generate-dummy-data.js` | Generate both users and jobs | `npm run generate-data` |
| `generate-users-only.js` | Generate only users | `npm run generate-users` |
| `generate-jobs-only.js` | Generate only jobs | `npm run generate-jobs` |
| `clear-dummy-data.js` | Clear all dummy data | `npm run clear-data` |

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
cd scripts
npm install
```

### **2. Set Environment Variables**
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

### **3. Generate Data**
```bash
# Generate everything (users + jobs)
npm run generate-data

# Or generate separately
npm run generate-users
npm run generate-jobs
```

## 📊 **Generated Data**

### **Users (50 by default)**
- **Names**: 50 first names + 50 last names combinations
- **Emails**: `firstname.lastname{index}@example.com`
- **Password**: `password123` (for all users)
- **Admin Users**: 10% chance (random)
- **Sample**: `john.smith0@example.com`

### **Jobs (100 by default)**
- **Companies**: 30 tech companies
- **Job Titles**: 30 different roles
- **Locations**: 30 US cities
- **Skills**: 40+ technical skills
- **Benefits**: 24 different benefits
- **Salary Range**: $40k - $250k
- **Job Types**: full-time, part-time, contract, internship, freelance
- **Experience Levels**: entry, junior, mid, senior, lead, executive
- **Remote Options**: on-site, remote, hybrid
- **Status**: active, paused, closed, draft

## 🔧 **Available Commands**

### **Generate All Data**
```bash
npm run generate-data
```
Generates 50 users and 100 jobs with realistic data.

### **Generate Users Only**
```bash
npm run generate-users
```
Generates 50 users with:
- Random names and emails
- Hashed passwords
- 10% admin users
- Detailed summary output

### **Generate Jobs Only**
```bash
npm run generate-jobs
```
Generates 100 jobs with:
- Random assignment to existing users
- Realistic job descriptions
- Varied salary ranges
- Multiple statuses and types

### **Clear All Data**
```bash
npm run clear-data
```
Removes all dummy data from both databases.

## 📈 **Data Statistics**

After running the scripts, you'll see statistics like:

```
📊 Data Generation Summary:
👥 Users: 50
💼 Jobs: 100

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

After generating users, you can test with:

```
Email: john.smith0@example.com
Password: password123
```

## 🔍 **Sample Generated Data**

### **Sample Users**
```
• john.smith0@example.com (John Smith)
• jane.johnson1@example.com (Jane Johnson) 👑
• michael.williams2@example.com (Michael Williams)
```

### **Sample Jobs**
```
• Software Engineer at TechCorp
  📍 San Francisco, CA | 💰 $120,000-180,000 | full-time | active

• Frontend Developer at InnovateSoft
  📍 New York, NY | 💰 $90,000-140,000 | remote | active

• DevOps Engineer at CloudTech
  📍 Seattle, WA | 💰 $130,000-190,000 | hybrid | active
```

## 🛠️ **Customization**

### **Modify Data Amounts**
Edit the script files to change the number of records:

```javascript
// In generate-dummy-data.js
await generateUsers(authPool, 100); // Generate 100 users
await generateJobs(jobsPool, authPool, 200); // Generate 200 jobs
```

### **Add Custom Data**
Add new entries to the data arrays:

```javascript
// Add new companies
const companies = [
  'YourCompany', 'AnotherCorp', // ... existing companies
];

// Add new job titles
const jobTitles = [
  'Your Custom Role', 'Another Position', // ... existing titles
];
```

## 🐳 **Docker Integration**

If running with Docker, use these commands:

```bash
# Generate data in Docker environment
docker-compose exec auth-service node /app/scripts/generate-dummy-data.js

# Or run from host (if ports are exposed)
cd scripts
DB_HOST=localhost DB_PORT=5432 npm run generate-data
```

## 🔧 **Troubleshooting**

### **Database Connection Issues**
```bash
# Check if databases are running
docker-compose ps

# Check database connectivity
docker-compose exec postgres-auth psql -U auth_user -d auth_db -c "SELECT NOW();"
docker-compose exec postgres-jobs psql -U jobs_user -d jobs_db -c "SELECT NOW();"
```

### **Permission Issues**
```bash
# Make scripts executable
chmod +x *.js
```

### **Missing Dependencies**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 **Notes**

- **Idempotent**: Scripts use `ON CONFLICT DO NOTHING` to avoid duplicates
- **Realistic Data**: All data is realistic and suitable for testing
- **Performance**: Scripts are optimized for quick execution
- **Safety**: Clear script removes all data - use with caution

## 🎉 **Success Indicators**

When scripts run successfully, you'll see:
- ✅ Connection confirmations
- 📊 Data generation progress
- 🎯 Sample data output
- 📈 Statistics summary
- 🎉 Completion message

These scripts make it easy to populate your HR Platform with realistic test data for development and testing! 