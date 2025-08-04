# Headhunt Platform - Microservices Project

This repository contains the source code for the Headhunt Platform, a comprehensive system for managing candidates, clients, jobs, and interviews. The platform is built using a microservices architecture, with each service designed to be independently developed, deployed, and scaled.

---

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for running scripts)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hr-platform
```

### 2. Build and Start Services
```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d
```

### 3. Generate Sample Data
```bash
# Navigate to scripts directory
cd scripts

# Install script dependencies
npm install

# Generate users (50 users with 3 admins)
npm run generate-users

# Generate jobs (100 jobs with various statuses)
npm run generate-jobs

# Generate clients (20 clients with contacts and interactions)
npm run generate-clients
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Test Credentials**: 
  - Email: `john.smith0@example.com`
  - Password: `password123`

---

## 🏗️ High-Level Architecture

This project is designed to run on a cloud infrastructure like AWS, using EC2 instances for hosting the services.

* **Frontend:** A React single-page application that provides the user interface for both clients and internal staff.
* **Backend Services:** A collection of Node.js/Express microservices, each responsible for a specific business domain (e.g., authentication, job management).
* **API Gateway:** An Nginx reverse proxy that acts as the single entry point for all frontend requests, routing them to the appropriate backend service.
* **Database:** PostgreSQL databases for each service to store application data.
* **Containerization:** All services, including the frontend, are containerized using Docker for consistent development and deployment environments.

---

## 📁 Project Structure

The project is organized as a monorepo, which simplifies dependency management and cross-service development.

```text
/hr-platform/
|
|-- /frontend/                 # React Single Page Application
|   |-- /src/
|   |   |-- /components/       # React components
|   |   |-- /pages/           # Page components
|   |   |-- /services/        # API services
|   |   |-- /context/         # React context
|   |   |-- App.js            # Main app component
|   |   |-- index.js          # Entry point
|   |   |-- index.css         # Global styles
|   |-- /public/              # Static files
|   |-- package.json
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- tailwind.config.js
|
|-- /services/                 # All backend microservices
|   |
|   |-- /auth-service/         # Authentication Service
|   |   |-- /src/
|   |   |   |-- /config/      # Database and JWT config
|   |   |   |-- /controllers/ # Route controllers
|   |   |   |-- /db/          # Database schema
|   |   |   |-- /middleware/  # Auth middleware
|   |   |   |-- /models/      # Data models
|   |   |   |-- /routes/      # API routes
|   |   |   |-- server.js     # Main server file
|   |   |-- package.json
|   |   |-- Dockerfile
|   |   `-- entrypoint.sh
|   |
|   |-- /job-service/          # Job Management Service
|   |   |-- /src/
|   |   |   |-- /config/      # Database and JWT config
|   |   |   |-- /controllers/ # Route controllers
|   |   |   |-- /db/          # Database schema
|   |   |   |-- /middleware/  # Auth middleware
|   |   |   |-- /models/      # Data models
|   |   |   |-- /routes/      # API routes
|   |   |   |-- server.js     # Main server file
|   |   |-- package.json
|   |   |-- Dockerfile
|   |   `-- entrypoint.sh
|   |
|   |-- /client-service/       # Client Management Service
|   |   |-- /src/
|   |   |   |-- /config/      # Database and JWT config
|   |   |   |-- /controllers/ # Route controllers
|   |   |   |-- /db/          # Database schema
|   |   |   |-- /middleware/  # Auth middleware
|   |   |   |-- /models/      # Data models
|   |   |   |-- /routes/      # API routes
|   |   |   |-- server.js     # Main server file
|   |   |-- package.json
|   |   |-- Dockerfile
|   |   `-- entrypoint.sh
|
|-- /scripts/                  # Data generation scripts
|   |-- generate-users-only.js
|   |-- generate-jobs-only.js
|   |-- generate-clients-only.js
|   |-- package.json
|   `-- README.md
|
|-- docker-compose.yml         # Service orchestration
|-- nginx.conf                 # API Gateway configuration
|-- README.md
`-- .mcp-config.json          # MCP configuration
```

---

## 🔧 Detailed Build Instructions

### Step 1: Environment Setup
Ensure you have the following installed:
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Node.js**: Version 18+
- **Git**: Latest version

### Step 2: Clone and Navigate
```bash
git clone <repository-url>
cd hr-platform
```

### Step 3: Build Docker Images
```bash
# Build all services (this may take 5-10 minutes)
docker-compose build
```

This command will:
- Build the React frontend with production optimizations
- Build all microservices (auth, job, client)
- Create optimized Docker images for each service

### Step 4: Start Services
```bash
# Start all services in detached mode
docker-compose up -d
```

### Step 5: Verify Services
```bash
# Check service status
docker-compose ps

# Check service logs
docker-compose logs -f
```

### Step 6: Initialize Databases
The services will automatically create their database schemas on startup. If you encounter any issues, you can manually run the schemas:

```bash
# Auth service schema
docker exec -i postgres-auth-db psql -U auth_user -d auth_db < services/auth-service/src/db/schema.sql

# Job service schema
docker exec -i postgres-jobs-db psql -U jobs_user -d jobs_db < services/job-service/src/db/schema.sql

# Client service schema
docker exec -i postgres-clients-db psql -U clients_user -d clients_db < services/client-service/src/db/schema.sql
```

---

## 📊 Data Generation Instructions

### Prerequisites
Navigate to the scripts directory and install dependencies:
```bash
cd scripts
npm install
```

### Generate Users
```bash
npm run generate-users
```
This creates:
- **50 users** with realistic names and emails
- **3 admin users** and **47 regular users**
- All users have password: `password123`

### Generate Jobs
```bash
npm run generate-jobs
```
This creates:
- **100 jobs** across various companies
- **25 active jobs**, rest in draft/paused/closed status
- **41 remote positions**
- Mix of full-time, part-time, contract, internship, and freelance roles

### Generate Clients
```bash
npm run generate-clients
```
This creates:
- **20 clients** with company information
- **60 contacts** (3 per client) with different roles
- **100 interactions** (5 per client) for communication history
- Mix of active, prospect, and inactive clients

### Generate All Data at Once
```bash
npm run generate-all
```

### Clear All Data
```bash
npm run clear-data
```

---

## 🌐 Service Endpoints

### Frontend
- **URL**: http://localhost:3000
- **Description**: React application with Client Management dashboard

### API Gateway
- **URL**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### Microservices
- **Auth Service**: http://localhost:8080/api/auth/
- **Job Service**: http://localhost:8080/api/jobs/
- **Client Service**: http://localhost:8080/api/clients/

### Database Ports
- **Auth DB**: localhost:5432
- **Jobs DB**: localhost:5433
- **Clients DB**: localhost:5434

---

## 🔐 Authentication

### Test Credentials
```
Email: john.smith0@example.com
Password: password123
```

### JWT Flow
The platform uses JWT tokens for authentication:
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookies
- **Auto-refresh**: Frontend automatically refreshes expired tokens

---

## 🛠️ Development

### Running in Development Mode
```bash
# Start services with development configurations
docker-compose -f docker-compose.dev.yml up -d
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f frontend
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears all data)
docker-compose down -v
```

---

## 📈 Generated Data Summary

After running the data generation scripts, you'll have:

### Users (50 total)
- **3 Admin users** with elevated permissions
- **47 Regular users** for testing
- All users have realistic names and email addresses

### Jobs (100 total)
- **25 Active jobs** ready for candidates
- **41 Remote positions** available
- **Various job types**: Full-time, Part-time, Contract, Internship, Freelance
- **Multiple companies**: TechCorp, InnovateSoft, ByteBuilders, etc.

### Clients (20 total)
- **4 Active clients** with ongoing relationships
- **3 Prospect clients** for business development
- **60 Contacts** with different roles (primary, secondary, decision makers)
- **100 Interactions** showing communication history

---

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :8080
   ```

2. **Database Connection Issues**
   ```bash
   # Check database containers
   docker-compose ps postgres-auth-db
   docker-compose ps postgres-jobs-db
   docker-compose ps postgres-clients-db
   ```

3. **Service Health Checks**
   ```bash
   # Test API gateway
   curl http://localhost:8080/health
   
   # Test individual services
   curl http://localhost:8080/api/auth/health
   curl http://localhost:8080/api/jobs/health
   curl http://localhost:8080/api/clients/health
   ```

4. **Rebuild Services**
   ```bash
   # Force rebuild
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

## 📝 Additional Resources

- **API Documentation**: See individual service README files
- **Database Schemas**: Located in `/services/*/src/db/schema.sql`
- **Docker Configurations**: See individual service Dockerfiles
- **Scripts Documentation**: See `/scripts/README.md`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
