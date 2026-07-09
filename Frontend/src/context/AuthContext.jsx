import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        toast.success('Logged in successfully!');
        return res.data.user;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        toast.success('Registered successfully!');
        return res.data.user;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile updated successfully!');
        return res.data.data;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Profile update failed';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        return true;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Password update failed';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await api.post('/auth/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile image updated!');
        return res.data.data;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to upload image';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteProfileImage = async () => {
    try {
      const res = await api.delete('/auth/profile-image');
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile image removed!');
        return res.data.data;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to remove image';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      isAuthenticated: !!user,
      updateProfile,
      updatePassword,
      uploadProfileImage,
      deleteProfileImage
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
