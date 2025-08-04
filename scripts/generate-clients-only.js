#!/usr/bin/env node

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Client Service Database Configuration
const clientPool = new Pool({
  host: process.env.CLIENT_DB_HOST || 'localhost',
  port: process.env.CLIENT_DB_PORT || 5434,
  user: process.env.CLIENT_DB_USER || 'clients_user',
  password: process.env.CLIENT_DB_PASSWORD || 'clients_password',
  database: process.env.CLIENT_DB_DATABASE || 'clients_db',
});

// Auth Service Database Configuration (to get user IDs)
const authPool = new Pool({
  host: process.env.AUTH_DB_HOST || 'localhost',
  port: process.env.AUTH_DB_PORT || 5432,
  user: process.env.AUTH_DB_USER || 'auth_user',
  password: process.env.AUTH_DB_PASSWORD || 'auth_password',
  database: process.env.AUTH_DB_DATABASE || 'auth_db',
});

// Sample data
const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Real Estate', 'Media', 'Transportation',
  'Energy', 'Telecommunications', 'Aerospace', 'Biotechnology', 'E-commerce'
];

const companySizes = ['startup', 'small', 'medium', 'large', 'enterprise'];
const businessTypes = ['private', 'public', 'non-profit', 'government'];
const serviceTiers = ['basic', 'standard', 'premium', 'enterprise'];
const statuses = ['active', 'inactive', 'prospect', 'suspended'];
const priorityLevels = ['low', 'medium', 'high', 'urgent'];

const contactTypes = ['primary', 'secondary', 'decision_maker', 'technical_contact', 'hr_contact', 'finance_contact'];
const contactMethods = ['email', 'phone', 'linkedin', 'other'];

const interactionTypes = ['call', 'email', 'meeting', 'proposal', 'contract_review', 'follow_up'];
const interactionStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];

// Generate random company name
function generateCompanyName() {
  const prefixes = ['Tech', 'Global', 'Innovative', 'Advanced', 'Smart', 'Digital', 'Future', 'Next', 'Prime', 'Elite'];
  const suffixes = ['Corp', 'Inc', 'Labs', 'Solutions', 'Systems', 'Technologies', 'Enterprises', 'Group', 'Partners', 'Consulting'];
  const industries = ['Tech', 'Health', 'Finance', 'Data', 'Cloud', 'AI', 'Mobile', 'Web', 'Security', 'Analytics'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const industry = industries[Math.floor(Math.random() * industries.length)];
  
  return `${prefix} ${industry} ${suffix}`;
}

// Generate random client data
function generateClientData(userId) {
  const companyName = generateCompanyName();
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const companySize = companySizes[Math.floor(Math.random() * companySizes.length)];
  const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
  const serviceTier = serviceTiers[Math.floor(Math.random() * serviceTiers.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const priorityLevel = priorityLevels[Math.floor(Math.random() * priorityLevels.length)];
  
  return {
    id: uuidv4(),
    company_name: companyName,
    industry: industry,
    company_size: companySize,
    website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    founded_year: Math.floor(Math.random() * 30) + 1990,
    description: `${companyName} is a leading ${industry} company specializing in innovative solutions.`,
    primary_email: `contact@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    primary_phone: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Cedar'].random()} St`,
    city: ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Boston', 'Seattle', 'Austin', 'Denver'].random(),
    state: ['CA', 'NY', 'TX', 'IL', 'MA', 'WA', 'CO', 'FL'].random(),
    country: 'USA',
    postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
    annual_revenue: ['$1M-$5M', '$5M-$10M', '$10M-$50M', '$50M-$100M', '$100M+'].random(),
    employee_count: Math.floor(Math.random() * 1000) + 10,
    business_type: businessType,
    service_tier: serviceTier,
    contract_start_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contract_end_date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_terms: ['Net 30', 'Net 60', 'Net 90', 'Immediate'].random(),
    status: status,
    priority_level: priorityLevel,
    notes: `Key client notes for ${companyName}. Priority: ${priorityLevel}.`,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Generate random contact data
function generateContactData(clientId) {
  const firstName = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Maria'].random();
  const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'].random();
  const position = ['CEO', 'CTO', 'HR Director', 'VP Engineering', 'CFO', 'COO', 'Director', 'Manager', 'Lead', 'Coordinator'].random();
  const department = ['Executive', 'Engineering', 'Human Resources', 'Finance', 'Operations', 'Sales', 'Marketing', 'Product'].random();
  const contactType = contactTypes[Math.floor(Math.random() * contactTypes.length)];
  const contactMethod = contactMethods[Math.floor(Math.random() * contactMethods.length)];
  
  return {
    id: uuidv4(),
    client_id: clientId,
    first_name: firstName,
    last_name: lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    phone: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    position: position,
    department: department,
    contact_type: contactType,
    is_primary_contact: contactType === 'primary',
    can_make_decisions: ['CEO', 'CTO', 'CFO', 'COO', 'VP'].includes(position),
    preferred_contact_method: contactMethod,
    timezone: ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver'].random(),
    availability_notes: `Available ${['9 AM - 5 PM', '8 AM - 6 PM', '10 AM - 4 PM'].random()} ${['EST', 'PST', 'CST', 'MST'].random()}`,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Generate random interaction data
function generateInteractionData(clientId, contactId, userId) {
  const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
  const status = interactionStatuses[Math.floor(Math.random() * interactionStatuses.length)];
  const subjects = [
    'Initial Consultation', 'Project Discussion', 'Contract Review', 'Follow-up Meeting',
    'Proposal Presentation', 'Technical Discussion', 'Budget Review', 'Timeline Planning'
  ];
  
  const scheduledDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
  const completedDate = status === 'completed' ? new Date(scheduledDate.getTime() + Math.random() * 2 * 60 * 60 * 1000) : null;
  
  return {
    id: uuidv4(),
    client_id: clientId,
    contact_id: contactId,
    interaction_type: interactionType,
    subject: subjects[Math.floor(Math.random() * subjects.length)],
    description: `${interactionType} regarding ${subjects[Math.floor(Math.random() * subjects.length)].toLowerCase()}`,
    outcome: status === 'completed' ? ['Positive', 'Neutral', 'Follow-up required', 'Contract signed'].random() : null,
    scheduled_date: scheduledDate.toISOString(),
    completed_date: completedDate ? completedDate.toISOString() : null,
    status: status,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Add random method to arrays
Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};

async function generateDummyClients() {
  const numClients = parseInt(process.argv[2]) || 20;
  const numContactsPerClient = parseInt(process.argv[3]) || 3;
  const numInteractionsPerClient = parseInt(process.argv[4]) || 5;
  
  console.log(`🚀 Generating ${numClients} dummy clients...`);
  console.log(`📞 ${numContactsPerClient} contacts per client`);
  console.log(`💬 ${numInteractionsPerClient} interactions per client\n`);

  try {
    // Get a user ID from auth service
    const userResult = await authPool.query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.error('❌ No users found in auth database. Please generate users first.');
      return;
    }
    const userId = userResult.rows[0].id;
    console.log(`👤 Using user ID: ${userId}`);

    let totalClients = 0;
    let totalContacts = 0;
    let totalInteractions = 0;

    for (let i = 0; i < numClients; i++) {
      // Generate client
      const clientData = generateClientData(userId);
      const clientResult = await clientPool.query(`
        INSERT INTO clients (
          id, company_name, industry, company_size, website, founded_year, description,
          primary_email, primary_phone, address, city, state, country, postal_code,
          annual_revenue, employee_count, business_type, service_tier,
          contract_start_date, contract_end_date, payment_terms,
          status, priority_level, notes, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
        RETURNING id
      `, [
        clientData.id, clientData.company_name, clientData.industry, clientData.company_size,
        clientData.website, clientData.founded_year, clientData.description,
        clientData.primary_email, clientData.primary_phone, clientData.address,
        clientData.city, clientData.state, clientData.country, clientData.postal_code,
        clientData.annual_revenue, clientData.employee_count, clientData.business_type,
        clientData.service_tier, clientData.contract_start_date, clientData.contract_end_date,
        clientData.payment_terms, clientData.status, clientData.priority_level,
        clientData.notes, clientData.created_by, clientData.created_at, clientData.updated_at
      ]);

      const clientId = clientResult.rows[0].id;
      totalClients++;

      // Generate contacts for this client
      const contacts = [];
      for (let j = 0; j < numContactsPerClient; j++) {
        const contactData = generateContactData(clientId);
        const contactResult = await clientPool.query(`
          INSERT INTO client_contacts (
            id, client_id, first_name, last_name, email, phone, position, department,
            contact_type, is_primary_contact, can_make_decisions,
            preferred_contact_method, timezone, availability_notes, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING id
        `, [
          contactData.id, contactData.client_id, contactData.first_name, contactData.last_name,
          contactData.email, contactData.phone, contactData.position, contactData.department,
          contactData.contact_type, contactData.is_primary_contact, contactData.can_make_decisions,
          contactData.preferred_contact_method, contactData.timezone, contactData.availability_notes,
          contactData.is_active, contactData.created_at, contactData.updated_at
        ]);

        contacts.push(contactResult.rows[0].id);
        totalContacts++;
      }

      // Generate interactions for this client
      for (let k = 0; k < numInteractionsPerClient; k++) {
        const contactId = contacts[Math.floor(Math.random() * contacts.length)];
        const interactionData = generateInteractionData(clientId, contactId, userId);
        
        await clientPool.query(`
          INSERT INTO client_interactions (
            id, client_id, contact_id, interaction_type, subject, description, outcome,
            scheduled_date, completed_date, status, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          interactionData.id, interactionData.client_id, interactionData.contact_id,
          interactionData.interaction_type, interactionData.subject, interactionData.description,
          interactionData.outcome, interactionData.scheduled_date, interactionData.completed_date,
          interactionData.status, interactionData.created_by, interactionData.created_at, interactionData.updated_at
        ]);

        totalInteractions++;
      }

      if ((i + 1) % 5 === 0) {
        console.log(`✅ Generated ${i + 1}/${numClients} clients...`);
      }
    }

    console.log('\n🎉 Dummy client data generation completed!');
    console.log(`📊 Summary:`);
    console.log(`   Clients: ${totalClients}`);
    console.log(`   Contacts: ${totalContacts}`);
    console.log(`   Interactions: ${totalInteractions}`);

    // Get some statistics
    const statsResult = await clientPool.query(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clients,
        COUNT(CASE WHEN status = 'prospect' THEN 1 END) as prospect_clients
      FROM clients
    `);
    
    const contactStatsResult = await clientPool.query(`
      SELECT COUNT(*) as total_contacts FROM client_contacts WHERE is_active = true
    `);
    
    const interactionStatsResult = await clientPool.query(`
      SELECT COUNT(*) as total_interactions FROM client_interactions
    `);

    console.log(`\n📈 Database Statistics:`);
    console.log(`   Total Clients: ${statsResult.rows[0].total_clients}`);
    console.log(`   Active Clients: ${statsResult.rows[0].active_clients}`);
    console.log(`   Prospect Clients: ${statsResult.rows[0].prospect_clients}`);
    console.log(`   Total Contacts: ${contactStatsResult.rows[0].total_contacts}`);
    console.log(`   Total Interactions: ${interactionStatsResult.rows[0].total_interactions}`);

  } catch (error) {
    console.error('❌ Error generating dummy client data:', error);
  } finally {
    await clientPool.end();
    await authPool.end();
  }
}

// Run the script
if (require.main === module) {
  generateDummyClients();
} 