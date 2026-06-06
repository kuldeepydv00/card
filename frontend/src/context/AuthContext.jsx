import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Always fetch fresh balance on mount to keep localStorage synced
      const token = localStorage.getItem('token');
      if (token) {
        api.get('/balance').then(({ data }) => {
          if (data && data.balance !== undefined) {
            setUser(prev => {
              if (!prev) return prev;
              const updated = { ...prev, wallet_balance: data.balance };
              localStorage.setItem('user', JSON.stringify(updated));
              return updated;
            });
          }
        }).catch(err => console.error('Failed to sync initial balance', err));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requires2FA) {
      return data; // Tell the UI to show the OTP screen
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const verifyLogin = async (email, password, otp) => {
    const { data } = await api.post('/auth/verify-login-otp', { email, password, otp });
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (username, email, password, phone) => {
    const { data } = await api.post('/auth/signup', { username, email, password, phone });
    return data; // Returns success message for OTP sent
  };

  const verifySignup = async (username, email, password, phone, otp) => {
    const { data } = await api.post('/auth/verify-signup', { username, email, password, phone, otp });
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateWallet = (newBalance) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, wallet_balance: newBalance };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/balance');
      if (data && data.balance !== undefined) {
        updateWallet(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyLogin, signup, verifySignup, logout, updateWallet, fetchWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
