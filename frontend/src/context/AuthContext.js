import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp * 1000 > Date.now()) {
        api.get('/auth/profile')
          .then(response => setUser(response.data.user))
          .catch(() => {
            // Token might be invalid, clear it
            localStorage.removeItem('accessToken');
            setUser(null);
          });
      } else {
        // Token is expired
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    console.log('AuthContext: Setting access token and fetching profile...');
    return api.get('/auth/profile').then(response => {
      console.log('AuthContext: Profile fetched successfully:', response.data.user);
      setUser(response.data.user);
    }).catch(error => {
      console.error('AuthContext: Profile fetch failed:', error);
      // Even if profile fetch fails, we can still set user from token
      const decoded = jwtDecode(accessToken);
      setUser({
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      });
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    // Optional: Call a /logout endpoint on the backend to invalidate refresh token
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};