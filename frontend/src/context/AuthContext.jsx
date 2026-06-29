import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          
          // Verify user session with a profile call
          const response = await api.get('/users/profile');
          if (response.data?.status === 'success') {
            const freshUser = response.data.data.user;
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        handleClearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to token refresh failure events
    const handleAuthLogoutEvent = () => {
      handleClearAuth();
    };

    window.addEventListener('auth_logout', handleAuthLogoutEvent);
    return () => {
      window.removeEventListener('auth_logout', handleAuthLogoutEvent);
    };
  }, []);

  const handleClearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data?.status === 'success') {
        const { accessToken, refreshToken, user: loggedUser } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        
        setUser(loggedUser);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data?.status === 'success') {
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('API logout request failed:', error);
    } finally {
      handleClearAuth();
      setLoading(false);
    }
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const reloadUser = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data?.status === 'success') {
        const freshUser = response.data.data.user;
        updateProfileState(freshUser);
        return freshUser;
      }
    } catch (error) {
      console.error('Failed to reload profile details:', error);
    }
    return user;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfileState,
    reloadUser
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
