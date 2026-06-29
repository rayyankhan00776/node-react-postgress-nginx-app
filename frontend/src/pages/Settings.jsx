import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { ShieldAlert, Trash2, ArrowRight, Check } from 'lucide-react';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Preference Settings (Mock state for frontend control)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [themeMode, setThemeMode] = useState('dark');
  const [autoArchive, setAutoArchive] = useState(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (confirmText !== 'DELETE') return;

    setActionLoading(true);
    setError('');

    try {
      // Call account delete API endpoint
      const response = await api.delete('/users/account');
      if (response.data?.status === 'success') {
        // Logout user session and direct to sign up
        await logout();
        navigate('/register');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Failed to delete account.');
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade grid-cols-2" style={{ alignItems: 'start' }}>
      {/* Preferences Section */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
          App Preferences
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="flex-between">
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Email Notifications</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Receive summaries of overdue and pending tasks</p>
            </div>
            <input 
              type="checkbox" 
              checked={emailAlerts} 
              onChange={() => setEmailAlerts(!emailAlerts)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>

          <div className="flex-between">
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Theme Mode</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Choose theme appearance for workspace</p>
            </div>
            <select 
              className="form-control" 
              value={themeMode} 
              onChange={(e) => setThemeMode(e.target.value)}
              style={{ width: '100px', padding: '6px 12px' }}
            >
              <option value="dark">Dark</option>
              <option value="light" disabled>Light</option>
            </select>
          </div>

          <div className="flex-between">
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Auto-Archive Completed</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Automatically archive completed projects after 30 days</p>
            </div>
            <input 
              type="checkbox" 
              checked={autoArchive} 
              onChange={() => setAutoArchive(!autoArchive)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>

        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="glass-card" style={{ padding: '28px', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '24px', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', paddingBottom: '12px' }}>
          Danger Zone
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-center" style={{ gap: '12px', alignItems: 'flex-start', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <ShieldAlert size={28} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <p>
              Deleting your account is permanent. All your projects, boards, and task history will be immediately and irrevocably deleted.
            </p>
          </div>

          <button 
            type="button" 
            onClick={() => { setConfirmText(''); setError(''); setIsModalOpen(true); }}
            className="btn btn-danger"
            style={{ width: '100%', marginTop: '8px' }}
          >
            <Trash2 size={18} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Account Deletion">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDeleteAccount}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            This will permanently remove all your database records. To confirm deletion, please type <strong style={{ color: 'var(--danger)' }}>DELETE</strong> in the box below:
          </p>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
              disabled={actionLoading}
              style={{ border: confirmText === 'DELETE' ? '1px solid var(--danger)' : '1px solid var(--border-light)' }}
            />
          </div>

          <div style={{ display: 'flex', justifySelf: 'end', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="btn btn-secondary" 
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-danger" 
              disabled={confirmText !== 'DELETE' || actionLoading}
            >
              {actionLoading ? 'Deleting Account...' : 'Delete Permanently'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Settings;
