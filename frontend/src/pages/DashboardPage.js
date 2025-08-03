import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={logout} 
          className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user?.first_name}!</h2>
        <p className="text-gray-600">This is your protected dashboard. Only logged-in users can see this.</p>
        <div className="mt-6 bg-gray-100 p-4 rounded-md">
          <h3 className="font-semibold text-gray-700">Your Profile Data:</h3>
          <pre className="text-sm text-gray-800 overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;