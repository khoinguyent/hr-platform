# Job Service

A microservice for handling job postings in the Headhunt Platform.

## Features

- Create, read, update, and delete job postings
- Search jobs by title, description, or company name
- Filter jobs by location, job type, experience level, remote option, and skills
- User-specific job management
- Soft delete functionality
- Admin hard delete capability

## API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /api/jobs` - Get all active jobs with optional filters
- `GET /api/jobs/search?q=searchTerm` - Search jobs
- `GET /api/jobs/:id` - Get job by ID

### Protected Endpoints (Authentication Required)

- `POST /api/jobs` - Create a new job posting
- `GET /api/jobs/user/my-jobs` - Get jobs posted by the authenticated user
- `PUT /api/jobs/:id` - Update a job posting
- `DELETE /api/jobs/:id` - Soft delete a job posting

### Admin Endpoints

- `DELETE /api/jobs/:id/hard` - Hard delete a job posting (admin only)

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_DATABASE=hr_platform

# JWT
JWT_SECRET=your_jwt_secret_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Server
PORT=4002
NODE_ENV=development
```

## Database Schema

The service uses PostgreSQL with the following main table:

### Jobs Table

- `id` (UUID) - Primary key
- `title` (VARCHAR) - Job title
- `description` (TEXT) - Job description
- `company_name` (VARCHAR) - Company name
- `location` (VARCHAR) - Job location
- `salary_min` (DECIMAL) - Minimum salary
- `salary_max` (DECIMAL) - Maximum salary
- `salary_currency` (VARCHAR) - Currency (default: USD)
- `job_type` (VARCHAR) - full-time, part-time, contract, internship, freelance
- `experience_level` (VARCHAR) - entry, junior, mid, senior, lead, executive
- `remote_option` (VARCHAR) - on-site, remote, hybrid
- `skills` (TEXT[]) - Array of required skills
- `benefits` (TEXT[]) - Array of benefits
- `requirements` (TEXT) - Job requirements
- `responsibilities` (TEXT) - Job responsibilities
- `contact_email` (VARCHAR) - Contact email
- `contact_phone` (VARCHAR) - Contact phone
- `application_deadline` (DATE) - Application deadline
- `status` (VARCHAR) - active, paused, closed, draft
- `posted_by` (UUID) - User ID who posted the job
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables

3. Run database migrations:
   ```bash
   psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE -f src/db/schema.sql
   ```

4. Start the service:
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

## Docker

Build and run with Docker:

```bash
docker build -t job-service .
docker run -p 4002:4002 --env-file .env job-service
```

## Example Usage

### Create a Job Posting

```bash
curl -X POST http://localhost:4002/api/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer",
    "description": "We are looking for a senior software engineer...",
    "company_name": "Tech Corp",
    "location": "San Francisco, CA",
    "salary_min": 120000,
    "salary_max": 180000,
    "job_type": "full-time",
    "experience_level": "senior",
    "remote_option": "hybrid",
    "skills": ["JavaScript", "React", "Node.js"],
    "requirements": "5+ years of experience...",
    "contact_email": "jobs@techcorp.com"
  }'
```

### Get All Jobs with Filters

```bash
curl "http://localhost:4002/api/jobs?location=San%20Francisco&job_type=full-time&limit=10"
```

### Search Jobs

```bash
curl "http://localhost:4002/api/jobs/search?q=software%20engineer&location=remote"
``` 