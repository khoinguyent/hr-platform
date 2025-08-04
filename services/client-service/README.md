# Client Service

A comprehensive microservice for managing client information in a headhunting agency system. This service handles client details, accountability contacts, and communication history.

## 🎯 Features

### Client Management
- **Complete Client Profiles**: Store comprehensive client information including company details, business information, and service tiers
- **Status Tracking**: Track client status (active, inactive, prospect, suspended)
- **Priority Management**: Assign priority levels to clients
- **Search & Filtering**: Advanced search and filtering capabilities
- **Soft Delete**: Safe deletion with data preservation

### Accountability Contacts
- **Multiple Contact Types**: Primary, secondary, decision makers, technical contacts, HR contacts, finance contacts
- **Primary Contact Management**: Automatic handling of primary contact assignments
- **Communication Preferences**: Track preferred contact methods and availability
- **Contact History**: Maintain complete contact information and roles

### Interaction Tracking
- **Communication History**: Track all client interactions (calls, emails, meetings, proposals)
- **Scheduling**: Schedule and manage upcoming interactions
- **Status Management**: Track interaction status (scheduled, completed, cancelled, rescheduled)
- **Outcome Tracking**: Record interaction outcomes and follow-ups
- **Dashboard Integration**: Provide data for client dashboards

## 🏗️ Architecture

### Database Schema

#### Clients Table
```sql
- id (UUID, Primary Key)
- company_name (VARCHAR, Required)
- industry (VARCHAR)
- company_size (ENUM: startup, small, medium, large, enterprise)
- website (VARCHAR)
- founded_year (INTEGER)
- description (TEXT)
- primary_email (VARCHAR)
- primary_phone (VARCHAR)
- address (TEXT)
- city, state, country, postal_code (VARCHAR)
- annual_revenue (VARCHAR)
- employee_count (INTEGER)
- business_type (ENUM: private, public, non-profit, government)
- service_tier (ENUM: basic, standard, premium, enterprise)
- contract_start_date, contract_end_date (DATE)
- payment_terms (VARCHAR)
- status (ENUM: active, inactive, prospect, suspended)
- priority_level (ENUM: low, medium, high, urgent)
- notes (TEXT)
- created_by (UUID, Foreign Key to users)
- created_at, updated_at (TIMESTAMP)
```

#### Client Contacts Table
```sql
- id (UUID, Primary Key)
- client_id (UUID, Foreign Key to clients)
- first_name, last_name (VARCHAR, Required)
- email (VARCHAR, Required)
- phone (VARCHAR)
- position, department (VARCHAR)
- contact_type (ENUM: primary, secondary, decision_maker, technical_contact, hr_contact, finance_contact)
- is_primary_contact (BOOLEAN)
- can_make_decisions (BOOLEAN)
- preferred_contact_method (ENUM: email, phone, linkedin, other)
- timezone (VARCHAR)
- availability_notes (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### Client Interactions Table
```sql
- id (UUID, Primary Key)
- client_id (UUID, Foreign Key to clients)
- contact_id (UUID, Foreign Key to client_contacts)
- interaction_type (ENUM: call, email, meeting, proposal, contract_review, follow_up)
- subject, description (TEXT)
- outcome (VARCHAR)
- scheduled_date, completed_date (TIMESTAMP)
- status (ENUM: scheduled, completed, cancelled, rescheduled)
- created_by (UUID, Foreign Key to users)
- created_at, updated_at (TIMESTAMP)
```

## 🚀 API Endpoints

### Client Management

#### GET `/api/clients`
Get all clients with filtering and pagination
- Query params: `status`, `industry`, `service_tier`, `company_size`, `search`, `limit`, `offset`

#### GET `/api/clients/stats`
Get client statistics

#### GET `/api/clients/search`
Search clients by term
- Query params: `q` (search term)

#### POST `/api/clients`
Create a new client
- Body: Client data object

#### GET `/api/clients/:clientId`
Get client by ID with related data

#### GET `/api/clients/:clientId/dashboard`
Get client dashboard data

#### PUT `/api/clients/:clientId`
Update client
- Body: Update data object

#### DELETE `/api/clients/:clientId`
Soft delete client

#### DELETE `/api/clients/:clientId/hard`
Hard delete client (admin only)

### Contact Management

#### GET `/api/clients/:clientId/contacts`
Get all contacts for a client

#### GET `/api/clients/:clientId/contacts/primary`
Get primary contact for a client

#### GET `/api/clients/:clientId/contacts/search`
Search contacts for a client
- Query params: `q` (search term)

#### GET `/api/clients/:clientId/contacts/type`
Get contacts by type for a client
- Query params: `type` (contact type)

#### POST `/api/clients/:clientId/contacts`
Create new contact for a client
- Body: Contact data object

#### PUT `/api/clients/:clientId/contacts/:contactId/primary`
Set a contact as primary
- Body: `{ clientId }`

#### GET `/api/clients/contacts/:contactId`
Get contact by ID

#### PUT `/api/clients/contacts/:contactId`
Update contact
- Body: Update data object

#### DELETE `/api/clients/contacts/:contactId`
Delete contact

### Interaction Management

#### GET `/api/clients/:clientId/interactions`
Get all interactions for a client
- Query params: `type`, `status`, `date_from`, `date_to`, `limit`, `offset`

#### GET `/api/clients/:clientId/interactions/upcoming`
Get upcoming interactions for a client
- Query params: `limit`

#### GET `/api/clients/:clientId/interactions/overdue`
Get overdue interactions for a client

#### GET `/api/clients/:clientId/interactions/stats`
Get interaction statistics for a client

#### POST `/api/clients/:clientId/interactions`
Create new interaction for a client
- Body: Interaction data object

#### GET `/api/clients/interactions/upcoming`
Get global upcoming interactions (for dashboard)
- Query params: `limit`

#### GET `/api/clients/interactions/overdue`
Get global overdue interactions (for dashboard)

#### GET `/api/clients/interactions/:interactionId`
Get interaction by ID

#### PUT `/api/clients/interactions/:interactionId`
Update interaction
- Body: Update data object

#### PUT `/api/clients/interactions/:interactionId/complete`
Mark interaction as completed
- Body: `{ outcome }`

#### DELETE `/api/clients/interactions/:interactionId`
Delete interaction

## 🔧 Environment Variables

```env
# Server Configuration
PORT=4003
NODE_ENV=development

# Database Configuration
DB_HOST=postgres-clients
DB_PORT=5432
DB_USER=clients_user
DB_PASSWORD=clients_password
DB_DATABASE=clients_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 🐳 Docker

### Build Image
```bash
docker build -t client-service .
```

### Run Container
```bash
docker run -p 4003:4003 \
  -e DB_HOST=postgres-clients \
  -e DB_USER=clients_user \
  -e DB_PASSWORD=clients_password \
  -e DB_DATABASE=clients_db \
  -e JWT_SECRET=your_jwt_secret_here \
  client-service
```

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd services/client-service

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
psql -h localhost -U clients_user -d clients_db -f src/db/schema.sql

# Start development server
npm run dev
```

### Production
```bash
# Install dependencies
npm ci --only=production

# Start production server
npm start
```

## 🔐 Authentication

All API endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Admin-only endpoints require admin privileges in the JWT payload.

## 📊 Data Models

### Client Data Structure
```javascript
{
  id: "uuid",
  company_name: "TechCorp Inc.",
  industry: "Technology",
  company_size: "medium",
  website: "https://techcorp.com",
  founded_year: 2015,
  description: "Leading technology company...",
  primary_email: "contact@techcorp.com",
  primary_phone: "+1-555-0123",
  address: "123 Tech Street",
  city: "San Francisco",
  state: "CA",
  country: "USA",
  postal_code: "94105",
  annual_revenue: "$10M-$50M",
  employee_count: 250,
  business_type: "private",
  service_tier: "premium",
  contract_start_date: "2024-01-01",
  contract_end_date: "2024-12-31",
  payment_terms: "Net 30",
  status: "active",
  priority_level: "high",
  notes: "Key client notes...",
  created_by: "user-uuid",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

### Contact Data Structure
```javascript
{
  id: "uuid",
  client_id: "client-uuid",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@techcorp.com",
  phone: "+1-555-0124",
  position: "HR Director",
  department: "Human Resources",
  contact_type: "primary",
  is_primary_contact: true,
  can_make_decisions: true,
  preferred_contact_method: "email",
  timezone: "America/Los_Angeles",
  availability_notes: "Available 9 AM - 5 PM PST",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

### Interaction Data Structure
```javascript
{
  id: "uuid",
  client_id: "client-uuid",
  contact_id: "contact-uuid",
  interaction_type: "meeting",
  subject: "Quarterly Review",
  description: "Discuss Q1 performance and Q2 goals",
  outcome: "Positive discussion, follow-up scheduled",
  scheduled_date: "2024-01-15T10:00:00Z",
  completed_date: "2024-01-15T11:00:00Z",
  status: "completed",
  created_by: "user-uuid",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T11:00:00Z"
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:4003/health
```

### Metrics
The service provides basic metrics through the health endpoint and can be extended with Prometheus metrics.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details. 