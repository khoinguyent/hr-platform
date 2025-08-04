import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import clientService from '../services/clientService';
import ClientSummaryCards from '../components/ClientSummaryCards';
import ClientViewOptions from '../components/ClientViewOptions';
import ClientGrid from '../components/ClientGrid';
import ClientKanban from '../components/ClientKanban';
import ClientList from '../components/ClientList';
import AddClientModal from '../components/AddClientModal';

const ClientManagementPage = () => {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeContracts: 0,
    activeJobs: 0,
    monthlyRevenue: 0
  });

  // Fetch clients data
  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await clientService.getClientStats();
      setStats({
        totalClients: data.stats?.total_clients || 0,
        activeContracts: data.stats?.active_clients || 0,
        activeJobs: data.stats?.premium_clients || 0, // Using premium clients as active jobs for demo
        monthlyRevenue: 85000 // Mock data for demo
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      const newClient = await clientService.createClient(clientData);
      setClients(prev => [newClient.client, ...prev]);
      setStats(prev => ({
        ...prev,
        totalClients: prev.totalClients + 1,
        activeContracts: prev.activeContracts + 1
      }));
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const renderView = () => {
    switch (viewMode) {
      case 'grid':
        return <ClientGrid clients={clients} onClientClick={(client) => console.log('Client clicked:', client)} />;
      case 'kanban':
        return <ClientKanban clients={clients} />;
      case 'list':
        return <ClientList clients={clients} />;
      default:
        return <ClientGrid clients={clients} onClientClick={(client) => console.log('Client clicked:', client)} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
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
            <div className="text-2xl font-bold">VØ /</div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {user?.first_name}</span>
            <button 
              onClick={logout}
              className="text-sm text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-2">Manage your headhunting clients and contracts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Client</span>
          </button>
        </div>

        {/* Summary Cards */}
        <ClientSummaryCards stats={stats} />

        {/* View Options */}
        <ClientViewOptions viewMode={viewMode} onViewChange={setViewMode} />

        {/* Client Content */}
        <div className="mt-8">
          {renderView()}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddClient}
        />
      )}
    </div>
  );
};

export default ClientManagementPage; 