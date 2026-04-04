import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Dev: CRA proxy sends /api → localhost:5000
// Prod: set REACT_APP_API_URL=https://your-render-backend.onrender.com in Vercel env vars
const BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api';

const API = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rinl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rinl_token');
      localStorage.removeItem('rinl_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate user from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('rinl_token');
    const savedUser = localStorage.getItem('rinl_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        API.get('/auth/me')
          .then(res => {
            setUser(res.data.user);
            localStorage.setItem('rinl_user', JSON.stringify(res.data.user));
          })
          .catch(() => {
            localStorage.removeItem('rinl_token');
            localStorage.removeItem('rinl_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // LOGIN — works for ANY registered user
  const login = useCallback(async (employeeId, password) => {
    try {
      const { data } = await API.post('/auth/login', { employeeId, password });
      localStorage.setItem('rinl_token', data.token);
      localStorage.setItem('rinl_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return { success: true, role: data.user.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  // REGISTER — open for anyone to sign up as contractor
  const register = useCallback(async (formData) => {
    try {
      const { data } = await API.post('/auth/register', formData);
      localStorage.setItem('rinl_token', data.token);
      localStorage.setItem('rinl_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Account created! Welcome to RINL CMS.');
      return { success: true, role: data.user.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rinl_token');
    localStorage.removeItem('rinl_user');
    setUser(null);
    toast.success('Logged out successfully.');
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('rinl_user', JSON.stringify(updated));
  }, []);

  const isAdmin = user?.role === 'admin';
  const isEIC = user?.role === 'eic' || user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator' || isEIC;
  const isContractor = user?.role === 'contractor';

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser,
      isAdmin, isEIC, isCoordinator, isContractor, API
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { API };
