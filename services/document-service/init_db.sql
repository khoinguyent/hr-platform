-- Create document service database
CREATE DATABASE document_db;

-- Create document user
CREATE USER document_user WITH PASSWORD 'document_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE document_db TO document_user;

-- Connect to document_db
\c document_db;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    
    -- Basic document information
    name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(20) NOT NULL,
    
    -- Document classification
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('contract', 'appendix', 'job_description', 'resume', 'invoice', 'proposal', 'agreement', 'template', 'other')),
    status VARCHAR(50) NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'uploaded', 'failed', 'expired')),
    
    -- Storage information
    s3_key VARCHAR(500),
    s3_url VARCHAR(500),
    
    -- Foreign keys for different document contexts (no constraints - handled by respective services)
    client_id VARCHAR(36),
    job_id VARCHAR(36),
    user_id VARCHAR(36),
    
    -- Metadata
    description TEXT,
    tags TEXT, -- JSON string of tags
    document_metadata TEXT, -- JSON string of additional metadata
    
    -- Dates
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expired_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON documents(job_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_documents_expired_date ON documents(expired_date);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Grant privileges on table
GRANT ALL PRIVILEGES ON TABLE documents TO document_user;
GRANT USAGE, SELECT ON SEQUENCE documents_id_seq TO document_user;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 