import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, Key, User, Mail, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user, updateProfileState, reloadUser } = useAuth();
  
  // Profile info state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password changes state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Alerts states
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Helper for avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
      return `${baseUrl.replace('/api', '')}/uploads/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true&size=128`;
  };

  // Submit Profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const response = await api.put('/users/profile', { name, email });
      if (response.data?.status === 'success') {
        updateProfileState(response.data.data.user);
        setProfileSuccess('Profile details updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile settings:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit Password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      return setPassError('Please fill in all password fields.');
    }

    if (newPassword !== confirmPassword) {
      return setPassError('New password and confirm password do not match.');
    }

    if (newPassword.length < 6) {
      return setPassError('New password must be at least 6 characters long.');
    }

    setPassLoading(true);
    setPassSuccess('');
    setPassError('');

    try {
      const response = await api.put('/users/change-password', {
        oldPassword,
        newPassword
      });

      if (response.data?.status === 'success') {
        setPassSuccess('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error changing user password:', err);
      setPassError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  // Trigger avatar file select
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Upload file handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return setAvatarError('File is too large. Max size limit is 2MB.');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    setAvatarError('');

    try {
      const response = await api.patch('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.status === 'success') {
        await reloadUser(); // Trigger global app state refresh
      }
    } catch (err) {
      console.error('Error uploading avatar image:', err);
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar image.');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="animate-fade grid-cols-2" style={{ alignItems: 'start' }}>
      
      {/* Profile Details Card */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
          Personal Information
        </h2>

        {profileSuccess && (
          <div className="alert alert-success animate-fade">
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="alert alert-error animate-fade">
            <span>{profileError}</span>
          </div>
        )}

        {avatarError && (
          <div className="alert alert-error animate-fade">
            <span>{avatarError}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <div className="avatar-upload-trigger" onClick={triggerFileSelect}>
            <img 
              src={getAvatarUrl()} 
              alt={user?.name} 
              className="avatar avatar-large" 
            />
            <div className="avatar-overlay">
              <Camera size={20} />
              <span>{avatarLoading ? 'Uploading...' : 'Change Avatar'}</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            style={{ display: 'none' }}
            accept="image/*"
            disabled={avatarLoading}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginTop: '8px' }}>
            Supported formats: JPG, JPEG, PNG, WEBP. Max 2MB.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="user-name-input">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dark)' }} />
              <input
                id="user-name-input"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
                disabled={profileLoading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="user-email-input">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dark)' }} />
              <input
                id="user-email-input"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
                disabled={profileLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={profileLoading}
          >
            <Save size={18} />
            <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Password Changes Card */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
          Change Password
        </h2>

        {passSuccess && (
          <div className="alert alert-success animate-fade">
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="alert alert-error animate-fade">
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="user-oldpass-input">Current Password</label>
            <input
              id="user-oldpass-input"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={passLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-newpass-input">New Password</label>
            <input
              id="user-newpass-input"
              type="password"
              className="form-control"
              placeholder="•••••••• (Min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={passLoading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="user-confpass-input">Confirm New Password</label>
            <input
              id="user-confpass-input"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={passLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-secondary" 
            style={{ width: '100%', borderColor: 'var(--primary)', color: '#fff' }}
            disabled={passLoading}
          >
            <Key size={18} />
            <span>{passLoading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};

export default Profile;
