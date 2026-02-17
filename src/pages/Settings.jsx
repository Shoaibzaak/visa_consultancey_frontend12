import React, { useState } from 'react';
import { Save, Bell, Lock, Globe, Mail, Database, Palette } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        companyName: 'Overseas Study Consultants',
        email: 'info@overseasstudyconsultants.pk',
        phone: '+92 300 1234567',
        address: 'Lahore, Pakistan',
        notifications: true,
        emailAlerts: true,
        autoBackup: true,
        language: 'English'
    });

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    return (
        <div>
            <div className="header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your CRM preferences and configuration</p>
                </div>
                <button onClick={handleSave} className="btn-primary" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center' }}>
                    <Save size={18} style={{ marginRight: '8px' }} /> Save Changes
                </button>
            </div>

            <div style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>

                {/* Company Information */}
                <div className="chart-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '10px', background: '#e0f2fe', borderRadius: '8px' }}>
                            <Globe size={20} color="#0066A1" />
                        </div>
                        <h2 className="section-title">Company Information</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                value={settings.companyName}
                                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="text"
                                value={settings.phone}
                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="chart-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '8px' }}>
                            <Bell size={20} color="#f59e0b" />
                        </div>
                        <h2 className="section-title">Notifications</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Push Notifications</div>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Receive notifications for new applications</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Email Alerts</div>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Get email updates on application status</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.emailAlerts}
                                onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="chart-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '8px' }}>
                            <Database size={20} color="#0066A1" />
                        </div>
                        <h2 className="section-title">System Settings</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Automatic Backup</div>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Daily backup of all data</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.autoBackup}
                                onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Language</label>
                            <select
                                value={settings.language}
                                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                            >
                                <option>English</option>
                                <option>Urdu</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="chart-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '8px' }}>
                            <Lock size={20} color="#ef4444" />
                        </div>
                        <h2 className="section-title">Security</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <button style={{ padding: '12px', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left', fontWeight: '600', cursor: 'pointer' }}>
                            Change Password
                        </button>
                        <button style={{ padding: '12px', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left', fontWeight: '600', cursor: 'pointer' }}>
                            Two-Factor Authentication
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
