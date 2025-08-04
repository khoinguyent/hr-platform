import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const decoded = jwtDecode(token);
          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            // Token is still valid, fetch profile
            try {
              const response = await api.get('/auth/profile');
              setUser(response.data.user);
            } catch (error) {
              console.error('Profile fetch failed:', error);
              // Try to refresh the token
              await refreshToken();
            }
          } else {
            // Token is expired, try to refresh
            await refreshToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      
      // Fetch user profile with new token
      const profileResponse = await api.get('/auth/profile');
      setUser(profileResponse.data.user);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
      return false;
    }
  };

  const login = async (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    console.log('AuthContext: Setting access token and fetching profile...');
    try {
      const response = await api.get('/auth/profile');
      console.log('AuthContext: Profile fetched successfully:', response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error('AuthContext: Profile fetch failed:', error);
      // Even if profile fetch fails, we can still set user from token
      const decoded = jwtDecode(accessToken);
      setUser({
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      });
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};