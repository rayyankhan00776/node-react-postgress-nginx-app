import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-deep)',
          gap: '16px'
        }}
      >
        <div 
          className="skeleton" 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
          }}
        />
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Loading workspace context...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
