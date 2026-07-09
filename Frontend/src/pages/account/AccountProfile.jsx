import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AccountProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    gender: user?.gender || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        toast.success('Profile updated successfully! Refresh to see changes globally.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoadingPassword(true);
    try {
      const res = await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-6 text-black dark:text-cream-dark border-b border-gray-200 dark:border-gray-800 pb-4">
          My Profile
        </h2>
        
        <form onSubmit={submitProfile} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">Email (Cannot be changed)</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={profileData.name} 
              onChange={handleProfileChange}
              required
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-black dark:border-white focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">Mobile Number</label>
            <input 
              type="tel" 
              name="phone"
              value={profileData.phone} 
              onChange={handleProfileChange}
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-black dark:border-white focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">Address</label>
            <textarea 
              name="address"
              value={profileData.address} 
              onChange={handleProfileChange}
              rows="3"
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-black dark:border-white focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">Gender</label>
              <select 
                name="gender"
                value={profileData.gender} 
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-black dark:border-white focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">Date of Birth</label>
              <input 
                type="date" 
                name="dob"
                value={profileData.dob} 
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-black dark:border-white focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loadingProfile}
            className="btn-gold px-6 py-2 uppercase text-sm tracking-wider mt-2 disabled:opacity-50"
          >
            {loadingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-serif font-semibold mb-6 text-black dark:text-cream-dark border-b border-gray-200 dark:border-gray-800 pb-4">
          Change Password
        </h2>
        
        <form onSubmit={submitPassword} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">Current Password</label>
            <input 
              type="password" 
              name="currentPassword"
              value={passwordData.currentPassword} 
              onChange={handlePasswordChange}
              required
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-black dark:border-white focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">New Password</label>
            <input 
              type="password" 
              name="newPassword"
              value={passwordData.newPassword} 
              onChange={handlePasswordChange}
              required
              minLength="6"
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-black dark:border-white focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-black dark:text-cream-dark mb-1">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={passwordData.confirmPassword} 
              onChange={handlePasswordChange}
              required
              minLength="6"
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-black dark:border-white focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white"
            />
          </div>
          <button 
            type="submit" 
            disabled={loadingPassword}
            className="btn-gold px-6 py-2 uppercase text-sm tracking-wider mt-2 disabled:opacity-50"
          >
            {loadingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountProfile;
