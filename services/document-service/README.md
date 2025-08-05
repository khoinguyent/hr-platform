# Document Service

A microservice for managing document uploads and storage in the HR Platform.

## Features

- **Document Management**: Upload, store, and manage various types of documents
- **Message Queue Architecture**: Asynchronous processing using RabbitMQ
- **S3/MinIO Integration**: Cloud storage with development mode support
- **Document Types**: Support for contracts, appendices, job descriptions, resumes, and more
- **Status Tracking**: Real-time document status updates (uploading, processing, uploaded, failed)
- **Expiry Management**: Document expiration tracking and management

## Document Types

- `contract` - Client contracts
- `appendix` - Contract appendices
- `job_description` - Job posting documents
- `resume` - Candidate resumes/CVs
- `invoice` - Billing invoices
- `proposal` - Project proposals
- `agreement` - Legal agreements
- `template` - Document templates
- `other` - Miscellaneous documents

## Architecture

### Message Queue Flow

1. **Document Upload**: Client uploads document via API
2. **Record Creation**: Document record created with `UPLOADING` status
3. **Message Publishing**: Message sent to appropriate queue based on document type
4. **Async Processing**: Background worker processes the message
5. **S3 Upload**: File uploaded to S3/MinIO
6. **Status Update**: Document status updated to `UPLOADED` with S3 URL

### Queues

- `client-doc-queue` - Client documents (contracts, appendices)
- `job-description-doc-queue` - Job description documents
- `resume-doc-queue` - Resume/CV documents
- `general-doc-queue` - Other document types

## API Endpoints

### Upload Document
```
POST /documents/upload
```

**Parameters:**
- `file` - Document file
- `document_type` - Type of document
- `name` - Document name/title
- `client_id` - Client ID (optional)
- `job_id` - Job ID (optional)
- `user_id` - User ID (optional)
- `description` - Document description (optional)
- `tags` - JSON string of tags (optional)
- `metadata` - JSON string of metadata (optional)
- `expired_date` - Expiry date in ISO format (optional)

### Get Document
```
GET /documents/{document_id}
```

### Get Client Documents
```
GET /documents/client/{client_id}
```

### Get Job Documents
```
GET /documents/job/{job_id}
```

### Get User Documents
```
GET /documents/user/{user_id}
```

### Get Documents by Status
```
GET /documents/status/{status}
```

### Get Expired Documents
```
GET /documents/expired
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)
- `S3_BUCKET_NAME` - S3/MinIO bucket name
- `S3_ENDPOINT_URL` - S3 endpoint (MinIO in development)
- `AWS_ACCESS_KEY_ID` - AWS/MinIO access key
- `AWS_SECRET_ACCESS_KEY` - AWS/MinIO secret key
- `AWS_REGION` - AWS region
- `RABBITMQ_HOST` - RabbitMQ host
- `RABBITMQ_PORT` - RabbitMQ port
- `RABBITMQ_USER` - RabbitMQ username
- `RABBITMQ_PASS` - RabbitMQ password

## Development Mode

In development mode, the service uses:
- **MinIO** instead of AWS S3
- **Local file storage** for testing
- **No AWS credentials** required
- **Web console** for file management

### Access URLs

- **Document Service**: http://localhost:4004
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## Database Schema

The `documents` table includes:
- Basic document information (name, filename, size, type)
- Document classification (type, status)
- Storage information (S3 key, URL)
- Foreign keys (client_id, job_id, user_id)
- Metadata (description, tags, custom metadata)
- Dates (upload_date, expired_date, timestamps)

## Message Structure

Example message for client document:
```json
{
  "id": "uuid",
  "type": "client-doc",
  "timestamp": "2025-08-05T10:30:00Z",
  "data": {
    "document_id": 123,
    "document_type": "contract",
    "name": "Client Contract 2025",
    "original_filename": "contract.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "file_extension": ".pdf",
    "client_id": "client-123",
    "description": "Annual service contract",
    "tags": "[\"contract\", \"annual\"]",
    "metadata": "{\"contract_year\": 2025}",
    "expired_date": "2026-08-05T10:30:00Z"
  }
}
``` 