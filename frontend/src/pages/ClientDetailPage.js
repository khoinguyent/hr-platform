import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DocumentManagement from '../components/DocumentManagement';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import ContactForm from '../components/ContactForm';
import clientService from '../services/clientService';
import contactService from '../services/contactService';

const ClientDetailPage = () => {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isAddingPrimary, setIsAddingPrimary] = useState(false);

  // Fetch real client data from API
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await clientService.getClientById(clientId);
        setClient(response.client);
      } catch (error) {
        console.error('Error fetching client:', error);
        setError('Failed to load client details');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  // Fetch contacts when contacts tab is active
  useEffect(() => {
    if (activeTab === 'contacts' && clientId) {
      fetchContacts();
    }
  }, [activeTab, clientId, refreshTrigger]);

  const fetchContacts = async () => {
    try {
      const response = await contactService.getClientContacts(clientId);
      setContacts(response.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'contract', label: 'Contract', icon: '📋' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'notes', label: 'Notes', icon: '📝' }
  ];

  const handleUploadSuccess = () => {
    // Refresh the document list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
  };

  const handleContactSubmit = async (contactData) => {
    try {
      if (editingContact) {
        await contactService.updateContact(editingContact.id, contactData);
      } else {
        await contactService.createContact(clientId, contactData);
      }
      
      setShowContactForm(false);
      setEditingContact(null);
      setIsAddingPrimary(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving contact:', error);
      throw error;
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
    setIsAddingPrimary(false);
  };

  const handleAddPrimaryContact = () => {
    setEditingContact(null);
    setShowContactForm(true);
    setIsAddingPrimary(true);
  };

  const handleAddAlternateContact = () => {
    setEditingContact(null);
    setShowContactForm(true);
    setIsAddingPrimary(false);
  };

  const handleSetPrimaryContact = async (contactId) => {
    try {
      await contactService.setPrimaryContact(clientId, contactId);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error setting primary contact:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTierColor = (tier) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-indigo-100 text-indigo-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const primaryContact = contacts.find(contact => contact.is_primary_contact);
  const alternateContacts = contacts.filter(contact => !contact.is_primary_contact);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading client details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
          <div className="flex">
            <div className="text-red-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 max-w-md">
          <div className="flex">
            <div className="text-yellow-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">Client Not Found</h3>
              <p className="text-yellow-700 mt-1">The requested client could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Company Logo Placeholder */}
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                
                {/* Company Information */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{client.company_name}</h1>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                    {client.service_tier && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getServiceTierColor(client.service_tier)}`}>
                        {client.service_tier}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{client.industry || 'Technology'}</p>
                  
                  {/* Company Details with Icons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {client.city && client.state && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {client.city}, {client.state}
                      </div>
                    )}
                    {client.founded_year && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Founded {client.founded_year}
                      </div>
                    )}
                    {client.employee_count && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {client.employee_count} employees
                      </div>
                    )}
                    {client.website && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {client.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  View Jobs (3)
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Client
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-sm text-gray-600">Active Jobs</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-600">Total Placements</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">85%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">$240,000</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h3>
              <p className="text-gray-700">
                {client.description || `${client.company_name} is a leading company in the ${client.industry || 'technology'} industry. They specialize in providing innovative solutions and services to their clients.`}
              </p>
            </div>

            {/* Main Contact Point */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Contact Point</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Primary Contact</p>
                    <p className="font-medium text-gray-900">{client.primary_email || 'No email provided'}</p>
                  </div>
                </div>
                {client.primary_phone && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{client.primary_phone}</p>
                    </div>
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">
                        {client.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Address</h3>
              <div className="text-gray-700 space-y-1">
                {client.address && <p>{client.address}</p>}
                {client.city && client.state && (
                  <p>{client.city}, {client.state} {client.postal_code}</p>
                )}
                {client.country && <p>{client.country}</p>}
                {!client.address && !client.city && (
                  <p className="text-gray-500 italic">Address information not provided</p>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Industry</span>
                  <span className="font-medium">{client.industry || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Company Size</span>
                  <span className="font-medium">{client.company_size || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Tier</span>
                  <span className="font-medium">{client.service_tier || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(client.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Main Contact Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Main Contact</h3>
                  </div>
                  {!primaryContact && (
                    <button
                      onClick={handleAddPrimaryContact}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Add Primary Contact
                    </button>
                  )}
                </div>
              </div>
              
              {primaryContact ? (
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg font-semibold text-gray-600">
                          {primaryContact.first_name.charAt(0)}{primaryContact.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {primaryContact.first_name} {primaryContact.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{primaryContact.position || 'No position specified'}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href={`mailto:${primaryContact.email}`} className="text-blue-600 hover:text-blue-800">
                              {primaryContact.email}
                            </a>
                          </div>
                          {primaryContact.phone && (
                            <div className="flex items-center text-sm">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${primaryContact.phone}`} className="text-blue-600 hover:text-blue-800">
                                {primaryContact.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditContact(primaryContact)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No primary contact assigned
                </div>
              )}
            </div>

            {/* Alternate Contacts Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Alternate Contacts</h3>
                  <button
                    onClick={handleAddAlternateContact}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    Add Contact
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {alternateContacts.length > 0 ? (
                  alternateContacts.map((contact) => (
                    <div key={contact.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                            <span className="text-lg font-semibold text-gray-600">
                              {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {contact.first_name} {contact.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{contact.position || 'No position specified'}</p>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center text-sm">
                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                                  {contact.email}
                                </a>
                              </div>
                              {contact.phone && (
                                <div className="flex items-center text-sm">
                                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                                    {contact.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!primaryContact && (
                            <button
                              onClick={() => handleSetPrimaryContact(contact.id)}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No alternate contacts
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingContact ? 'Edit Contact' : (isAddingPrimary ? 'Add Primary Contact' : 'Add Contact')}
                      </h3>
                      <button
                        onClick={() => {
                          setShowContactForm(false);
                          setEditingContact(null);
                          setIsAddingPrimary(false);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <ContactForm
                      contact={editingContact}
                      clientId={clientId}
                      isPrimary={isAddingPrimary}
                      onSubmit={handleContactSubmit}
                      onCancel={() => {
                        setShowContactForm(false);
                        setEditingContact(null);
                        setIsAddingPrimary(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contract' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Information</h3>
            <p className="text-gray-600">Contract management features coming soon...</p>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Listings</h3>
            <p className="text-gray-600">Job management features coming soon...</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Documents & Contracts</h2>
              <button
                onClick={() => setActiveTab('documents-upload')}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Document
              </button>
            </div>

            {/* Document List */}
            <DocumentList
              clientId={client.id}
              excludeTypes={['job_description', 'resume']}
              onRefresh={refreshTrigger}
            />
          </div>
        )}

        {activeTab === 'documents-upload' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                ← Back to Documents
              </button>
            </div>

            {/* Upload Form */}
            <DocumentUpload
              clientId={client.id}
              allowedTypes={['contract', 'appendix', 'invoice', 'proposal', 'agreement', 'template', 'other']}
              onUploadSuccess={() => {
                setActiveTab('documents');
                setRefreshTrigger(prev => prev + 1);
              }}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Notes</h3>
            <p className="text-gray-600">Note management features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailPage; 