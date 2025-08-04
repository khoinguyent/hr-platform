-- Client Service Database Schema

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50) CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    website VARCHAR(255),
    founded_year INTEGER,
    description TEXT,
    
    -- Contact Information
    primary_email VARCHAR(255),
    primary_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Business Information
    annual_revenue VARCHAR(50),
    employee_count INTEGER,
    business_type VARCHAR(50) CHECK (business_type IN ('private', 'public', 'non-profit', 'government')),
    
    -- Service Information
    service_tier VARCHAR(20) DEFAULT 'standard' CHECK (service_tier IN ('basic', 'standard', 'premium', 'enterprise')),
    contract_start_date DATE,
    contract_end_date DATE,
    payment_terms VARCHAR(100),
    
    -- Status and Metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'suspended')),
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    
    -- Audit fields
    created_by UUID NOT NULL, -- Reference to user who created the client
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create client contacts table (for accountability contacts)
CREATE TABLE IF NOT EXISTS client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(100),
    
    -- Role Information
    contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('primary', 'secondary', 'decision_maker', 'technical_contact', 'hr_contact', 'finance_contact')),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    can_make_decisions BOOLEAN DEFAULT FALSE,
    
    -- Communication Preferences
    preferred_contact_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'linkedin', 'other')),
    timezone VARCHAR(50),
    availability_notes TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create client requirements table
CREATE TABLE IF NOT EXISTS client_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Requirement Details
    requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN ('hiring_process', 'candidate_criteria', 'technical_requirements', 'cultural_fit', 'compensation', 'timeline')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create client interactions table (for tracking communication history)
CREATE TABLE IF NOT EXISTS client_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES client_contacts(id) ON DELETE SET NULL,
    
    -- Interaction Details
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('call', 'email', 'meeting', 'proposal', 'contract_review', 'follow_up')),
    subject VARCHAR(255),
    description TEXT,
    outcome VARCHAR(100),
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    
    -- Audit fields
    created_by UUID NOT NULL, -- Reference to user who created the interaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(industry);
CREATE INDEX IF NOT EXISTS idx_clients_service_tier ON clients(service_tier);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_contact_type ON client_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_client_contacts_is_primary ON client_contacts(is_primary_contact);
CREATE INDEX IF NOT EXISTS idx_client_contacts_email ON client_contacts(email);

CREATE INDEX IF NOT EXISTS idx_client_requirements_client_id ON client_requirements(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requirements_type ON client_requirements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_client_requirements_priority ON client_requirements(priority);

CREATE INDEX IF NOT EXISTS idx_client_interactions_client_id ON client_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_contact_id ON client_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_type ON client_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_client_interactions_status ON client_interactions(status);
CREATE INDEX IF NOT EXISTS idx_client_interactions_scheduled_date ON client_interactions(scheduled_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_contacts_updated_at 
    BEFORE UPDATE ON client_contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_requirements_updated_at 
    BEFORE UPDATE ON client_requirements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_interactions_updated_at 
    BEFORE UPDATE ON client_interactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 