import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { GoogleIcon, FacebookIcon } from '../components/Icons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      await login(response.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto p-8 border rounded-xl shadow-lg bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
        {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-2 rounded-md">{error}</p>}
        
        <div className="space-y-4 mb-6">
          <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-100 transition-colors">
            <GoogleIcon className="h-6 w-6 mr-3" />
            <span className="font-semibold text-gray-700">Continue with Google</span>
          </button>
          <button onClick={() => handleSocialLogin('facebook')} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <FacebookIcon className="h-6 w-6 mr-3" />
            <span className="font-semibold">Continue with Facebook</span>
          </button>
        </div>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleLocalLogin} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-600 block">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors">Sign In</button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;