import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      const storedToken = window.localStorage.getItem('authToken');
      const storedUser = window.localStorage.getItem('authUser');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authToken', data.token);
        window.localStorage.setItem('authUser', JSON.stringify(data.user));
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('authUser');
      window.localStorage.removeItem('key');
    }
  };

  const updateProfile = async (updates) => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw {key: data.key, error: data.error || 'Update failed'};
      }

      setUser(data.user);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authUser', JSON.stringify(data.user));
      }

      return { success: true, user: data.user };
    } catch (error) {      
      return { success: false, error: error.error, key: error.key};
    }
  };

  const fetchProfile = async () => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setUser(data.user);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authUser', JSON.stringify(data.user));
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    fetchProfile,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
