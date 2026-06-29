import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, User, Mail, Lock, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError('Please fill in all input fields.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await register(name, email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting to sign in...');
      setName('');
      setEmail('');
      setPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-logo">
            <Layers size={32} />
            <span>TaskFlow Pro</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Create an account to start managing your projects
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-fade">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success animate-fade">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dark)' }} 
              />
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dark)' }} 
              />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dark)' }} 
              />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="•••••••• (Min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
