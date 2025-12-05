import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.data);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  };

  const signup = async (name, email, password, role = 'patient') => {
    try {
      const response = await api.post('/auth/signup', { name, email, password, role });
      if (response.data.success) {
        setUser(response.data.data);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    city,
    setCity,
    selectedDoctor,
    setSelectedDoctor,
    login,
    signup,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
