import React from 'react';

const ClientGrid = ({ clients, onClientClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'enterprise':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEmployeeCount = (count) => {
    if (count < 50) return '1-50 employees';
    if (count < 100) return '50-100 employees';
    if (count < 500) return '100-500 employees';
    if (count < 1000) return '500-1000 employees';
    return '1000+ employees';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No activity';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Transform real API data to match component expectations
  const transformClientData = (client) => ({
    ...client,
    // Use interaction_count as active_jobs for demo purposes
    active_jobs: parseInt(client.interaction_count) || 0,
    // Use contact_count as placements for demo purposes  
    placements: parseInt(client.contact_count) || 0,
    // Use updated_at as last_activity
    last_activity: client.updated_at
  });

  const displayClients = clients.map(transformClientData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayClients.map((client) => (
        <div
          key={client.id}
          onClick={() => onClientClick(client)}
          className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          {/* Company Logo Placeholder */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 font-semibold text-lg">
                {client.company_name.charAt(0)}
              </span>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(client.service_tier)}`}>
                {client.service_tier}
              </span>
            </div>
          </div>

          {/* Company Name and Industry */}
          <h3 className="font-bold text-gray-900 text-lg mb-1">{client.company_name}</h3>
          <p className="text-gray-600 text-sm mb-4">{client.industry}</p>

          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{client.city}, {client.state}</span>
          </div>

          {/* Employee Count */}
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{formatEmployeeCount(client.employee_count)}</span>
          </div>

          {/* Job/Placement Metrics */}
          <div className="flex justify-between text-sm mb-4">
            <div className="text-gray-600">
              <span className="font-medium">{client.active_jobs}</span> Active Jobs
            </div>
            <div className="text-gray-600">
              <span className="font-medium">{client.placements}</span> Placements
            </div>
          </div>

          {/* Last Activity */}
          <div className="text-gray-500 text-sm">
            Last activity: {formatDate(client.last_activity)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientGrid; 