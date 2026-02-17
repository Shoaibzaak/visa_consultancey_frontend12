import React, { useState } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { clientsData } from '../data';

const Applications = () => {
    const [applications, setApplications] = useState(clientsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.country.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={18} color="#10b981" />;
            case 'Rejected': return <XCircle size={18} color="#ef4444" />;
            default: return <Clock size={18} color="#f59e0b" />;
        }
    };

    return (
        <div>
            <div className="header">
                <div>
                    <h1 className="page-title">Applications</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track and manage all visa applications</p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center' }}>
                    <Download size={18} style={{ marginRight: '8px' }} /> Export Report
                </button>
            </div>

            {/* Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Applications</div>
                    <div style={{ fontSize: '28px', fontWeight: '700' }}>{applications.length}</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Pending</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{applications.filter(a => a.status === 'Pending').length}</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Approved</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{applications.filter(a => a.status === 'Approved').length}</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Rejected</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{applications.filter(a => a.status === 'Rejected').length}</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '44px', width: '100%' }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', minWidth: '150px' }}
                >
                    <option>All</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                </select>
            </div>

            {/* Applications Table */}
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Application ID</th>
                            <th>Client Name</th>
                            <th>Destination</th>
                            <th>Visa Type</th>
                            <th>Submission Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApplications.map((app) => (
                            <tr key={app.id}>
                                <td>
                                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>APP-{String(app.id).padStart(4, '0')}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '600' }}>{app.name}</div>
                                </td>
                                <td>{app.country}</td>
                                <td>{app.category}</td>
                                <td>{app.date}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {getStatusIcon(app.status)}
                                        <span className={`status-badge status-${app.status.toLowerCase()}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <button style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                        <Eye size={14} /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Applications;
