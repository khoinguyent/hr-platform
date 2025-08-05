import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import clientService from '../services/clientService';

const ClientDetailPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientData, contactsData, interactionsData] = await Promise.all([
        clientService.getClientById(clientId),
        clientService.getClientContacts(clientId),
        clientService.getClientInteractions(clientId)
      ]);

      setClient(clientData.client);
      setContacts(contactsData.contacts || []);
      setInteractions(interactionsData.interactions || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'enterprise': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white"
            >
              ← Back to Clients
            </button>
            <div className="text-2xl font-bold">VØ /</div>
          </div>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.firstName} {user?.lastName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 font-semibold text-2xl">
                  {client.company_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{client.company_name}</h1>
                <p className="text-gray-600 text-lg">{client.industry}</p>
                <p className="text-gray-500">{client.city}, {client.state}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(client.service_tier)}`}>
                {client.service_tier}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'contacts', name: 'Contacts' },
                { id: 'interactions', name: 'Interactions' },
                { id: 'jobs', name: 'Jobs' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-gray-800 text-gray-800'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Company Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Industry:</span> {client.industry}</div>
                    <div><span className="font-medium">Employees:</span> {client.employee_count}</div>
                    <div><span className="font-medium">Founded:</span> {client.founded_year || 'N/A'}</div>
                    <div><span className="font-medium">Website:</span> {client.website || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Address:</span> {client.address}</div>
                    <div><span className="font-medium">City:</span> {client.city}</div>
                    <div><span className="font-medium">State:</span> {client.state}</div>
                    <div><span className="font-medium">ZIP:</span> {client.zip_code}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Service Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {client.status}</div>
                    <div><span className="font-medium">Tier:</span> {client.service_tier}</div>
                    <div><span className="font-medium">Contract Value:</span> ${client.contract_value?.toLocaleString() || 'N/A'}</div>
                    <div><span className="font-medium">Start Date:</span> {formatDate(client.contract_start_date)}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Client Contacts</h3>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
                    Add Contact
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{contact.first_name} {contact.last_name}</h4>
                        {contact.is_primary && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Primary</span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>{contact.title}</div>
                        <div>{contact.email}</div>
                        <div>{contact.phone}</div>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No contacts found for this client.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'interactions' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Client Interactions</h3>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
                    Add Interaction
                  </button>
                </div>
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{interaction.type}</h4>
                          <p className="text-gray-600 text-sm">{interaction.notes}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{formatDate(interaction.scheduled_date)}</div>
                          <div>{interaction.status}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {interactions.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No interactions found for this client.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
                    View All Jobs
                  </button>
                </div>
                <div className="text-center text-gray-500 py-8">
                  Job integration coming soon. This will show active job postings for this client.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage; 