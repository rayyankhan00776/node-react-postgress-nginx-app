import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="auth-page animate-fade"
      style={{
        flexDirection: 'column',
        gap: '24px',
        textAlign: 'center'
      }}
    >
      <div 
        className="glass-card" 
        style={{
          maxWidth: '480px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
        }}
      >
        <HelpCircle size={64} style={{ color: 'var(--primary)' }} />
        
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>404</h1>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Workspace Not Found</h2>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
          The page you are looking for might have been moved, renamed, archived, or does not exist.
        </p>

        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px' }}
        >
          <ArrowLeft size={18} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
