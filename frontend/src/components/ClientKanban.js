import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClientKanban = ({ clients }) => {
  const navigate = useNavigate();
  
  const columns = [
    { id: 'prospect', title: 'Prospects', color: 'bg-blue-50' },
    { id: 'active', title: 'Active', color: 'bg-green-50' },
    { id: 'inactive', title: 'Inactive', color: 'bg-gray-50' },
    { id: 'suspended', title: 'Suspended', color: 'bg-red-50' }
  ];

  const getClientsByStatus = (status) => {
    return clients.filter(client => client.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <div key={column.id} className={`${column.color} rounded-lg p-4`}>
          <h3 className="font-semibold text-gray-900 mb-4">{column.title}</h3>
          <div className="space-y-3">
            {getClientsByStatus(column.id).map((client) => (
              <div
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-gray-900 mb-1">{client.company_name}</h4>
                <p className="text-sm text-gray-600">{client.industry}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{client.city}, {client.state}</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {client.service_tier}
                  </span>
                </div>
              </div>
            ))}
            {getClientsByStatus(column.id).length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                No clients in this status
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientKanban; 