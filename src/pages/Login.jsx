import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'login') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/logo.jpeg" alt="Overseas Study Consultants" style={{ width: '80px', height: '80px' }} />
          </div>
          <h1 className="auth-title">Overseas Study Consultants</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>CRM Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="login"
              required
            />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn-primary btn-block">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
