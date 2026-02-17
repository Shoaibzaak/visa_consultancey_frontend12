import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, Mail, MapPin, Calendar, Edit, Trash2, UserPlus, RefreshCw, Download } from 'lucide-react';
import { clientsAPI } from '../services/api';
import ClientForm from '../components/ClientForm';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    // Fetch clients from backend
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await clientsAPI.getAll();
            setClients(response.data);
        } catch (err) {
            setError('Failed to fetch clients. Please try again.');
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (clientData) => {
        try {
            await clientsAPI.create(clientData);
            await fetchClients(); // Refresh the list
            setShowForm(false);
        } catch (err) {
            console.error('Error adding client:', err);
            throw err;
        }
    };

    const handleUpdateClient = async (clientData) => {
        try {
            await clientsAPI.update(editingClient._id, clientData);
            await fetchClients(); // Refresh the list
            setEditingClient(null);
        } catch (err) {
            console.error('Error updating client:', err);
            throw err;
        }
    };

    const handleDeleteClient = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await clientsAPI.delete(id);
                await fetchClients(); // Refresh the list
            } catch (err) {
                alert('Failed to delete client. Please try again.');
                console.error('Error deleting client:', err);
            }
        }
    };

    const exportToCSV = () => {
        if (clients.length === 0) {
            alert("No data to export");
            return;
        }

        // CSV Headers
        const headers = ["Name,Country,Category,Status,Phone,Email,Address,Notes,Date Added"];

        // CSV Rows
        const rows = clients.map(client => {
            const date = new Date(client.createdAt).toLocaleDateString();
            // Escape commas in data to prevent CSV breakage
            const cleanStr = (str) => `"${(str || '').replace(/"/g, '""')}"`;

            return [
                cleanStr(client.name),
                cleanStr(client.country),
                cleanStr(client.category),
                cleanStr(client.status),
                cleanStr(client.phone),
                cleanStr(client.email),
                cleanStr(client.address),
                cleanStr(client.notes),
                cleanStr(date)
            ].join(',');
        });

        // Combine headers and rows
        const csvContent = headers.concat(rows).join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.country.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || client.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <RefreshCw size={32} color="#0066A1" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading clients...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
                <button onClick={fetchClients} className="btn-primary">
                    <RefreshCw size={18} />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="header">
                <div>
                    <h1 className="page-title">Client Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Manage all your visa consultancy clients ({clients.length} total)
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={exportToCSV} className="btn-secondary" style={{ display: 'flex', gap: '8px' }}>
                        <Download size={20} />
                        Export CSV
                    </button>
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        <UserPlus size={20} style={{ marginRight: '8px' }} />
                        Add New Client
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or country..."
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
                <button
                    onClick={fetchClients}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Client Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {filteredClients.map((client) => (
                    <div key={client._id} className="chart-container" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{client.name}</h3>
                                <span className={`status-badge status-${client.status.toLowerCase()}`}>
                                    {client.status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setEditingClient(client)}
                                    style={{ padding: '6px', background: '#f1f5f9', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                    title="Edit client"
                                >
                                    <Edit size={16} color="#64748b" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClient(client._id, client.name)}
                                    style={{ padding: '6px', background: '#fee2e2', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                    title="Delete client"
                                >
                                    <Trash2 size={16} color="#ef4444" />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                <MapPin size={16} />
                                <span>{client.country}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                <Phone size={16} />
                                <span>{client.phone}</span>
                            </div>
                            {client.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    <Mail size={16} />
                                    <span>{client.email}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                <Calendar size={16} />
                                <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Visa Type</div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{client.category}</div>
                            </div>
                            {client.notes && (
                                <div style={{ marginTop: '4px', padding: '12px', background: '#fef3c7', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                                    <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Notes</div>
                                    <div style={{ fontSize: '13px', color: '#78350f' }}>{client.notes}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>No clients found</p>
                    <p style={{ fontSize: '14px' }}>
                        {searchTerm || filterStatus !== 'All'
                            ? 'Try adjusting your search or filters'
                            : 'Click "Add New Client" to get started'}
                    </p>
                </div>
            )}

            {/* Add/Edit Client Form Modal */}
            {(showForm || editingClient) && (
                <ClientForm
                    onClose={() => {
                        setShowForm(false);
                        setEditingClient(null);
                    }}
                    onSubmit={editingClient ? handleUpdateClient : handleAddClient}
                    editClient={editingClient}
                />
            )}

            {/* Add CSS animation for loading spinner */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Clients;
