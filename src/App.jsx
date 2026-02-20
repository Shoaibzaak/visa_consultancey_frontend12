import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Applications from './pages/Applications';
import Settings from './pages/Settings';
import Login from './pages/Login';
import DocumentVerification from './pages/DocumentVerification';
import { LayoutDashboard, Users, FileText, Settings as SettingsIcon, LogOut, ShieldCheck } from 'lucide-react';

import Maintenance from './pages/Maintenance';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <Clients />;
      case 'applications': return <Maintenance />; // Only Applications page is disabled
      case 'settings': return <Settings />;
      case 'document-verification': return <DocumentVerification />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
          <span>OSC CRM</span>
        </div>
        <div className="sidebar-nav">
          <a
            href="#"
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }}
          >
            <LayoutDashboard /> Dashboard
          </a>
          <a
            href="#"
            className={`nav-item ${currentPage === 'clients' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('clients'); }}
          >
            <Users /> Clients
          </a>
          <a
            href="#"
            className={`nav-item ${currentPage === 'applications' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('applications'); }}
          >
            <FileText /> Applications
          </a>
          <a
            href="#"
            className={`nav-item ${currentPage === 'document-verification' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('document-verification'); }}
          >
            <ShieldCheck /> Doc Verification
          </a>
          <a
            href="#"
            className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('settings'); }}
          >
            <SettingsIcon /> Settings
          </a>
        </div>
        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
            <LogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
