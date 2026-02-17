import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { clientsAPI } from '../services/api';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);

    const COLORS = ['#0066A1', '#0088CC', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await clientsAPI.getAll();
            const clientsData = response.data;
            setClients(clientsData);
            processChartData(clientsData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (data) => {
        // Process data for AreaChart (Applications over time)
        // Group by date (using createdAt)
        const dateGroups = data.reduce((acc, client) => {
            const date = new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Convert to array and sort (taking last 7 days or entries)
        const areaData = Object.keys(dateGroups).map(date => ({
            name: date,
            applications: dateGroups[date]
        })).slice(-7); // Keep last 7 entries for cleaner chart

        // If no data, show at least empty state or placeholder
        if (areaData.length === 0) {
            setChartData([{ name: 'No Data', applications: 0 }]);
        } else {
            setChartData(areaData);
        }

        // Process data for PieChart (Visa Categories)
        const catGroups = data.reduce((acc, client) => {
            acc[client.category] = (acc[client.category] || 0) + 1;
            return acc;
        }, {});

        const pieData = Object.keys(catGroups).map(cat => ({
            name: cat,
            value: catGroups[cat]
        }));

        setCategoryStats(pieData);
    };

    // Calculate Statistics
    const totalApplications = clients.length;
    const pendingReviews = clients.filter(c => c.status === 'Pending').length;
    const approvedCount = clients.filter(c => c.status === 'Approved').length;
    const successRate = totalApplications > 0 ? ((approvedCount / totalApplications) * 100).toFixed(1) : 0;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <RefreshCw size={32} color="#0066A1" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading dashboard...</p>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>
                <p>{error}</p>
                <button onClick={fetchDashboardData} className="btn-primary" style={{ marginTop: '16px' }}>Retry</button>
            </div>
        );
    }

    return (
        <div>
            <header className="header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, Admin</p>
                </div>
                {/* Add Client button removed as requested */}
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Applications</span>
                    <span className="stat-value">{totalApplications}</span>
                    <span style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Total registered clients</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Pending Reviews</span>
                    <span className="stat-value">{pendingReviews}</span>
                    <span style={{ fontSize: '12px', color: '#f59e0b', marginTop: '8px' }}>Action required</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Success Rate</span>
                    <span className="stat-value">{successRate}%</span>
                    <span style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>Approval rate</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Approved</span>
                    <span className="stat-value">{approvedCount}</span>
                    <span style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>Successful applications</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-container">
                    <div className="section-header">
                        <h2 className="section-title">Application Trends (Last 7 Days)</h2>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0066A1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0066A1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="applications" stroke="#0066A1" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="chart-container">
                    <div className="section-header">
                        <h2 className="section-title">Visa Categories</h2>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                            {categoryStats.map((entry, index) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: COLORS[index % COLORS.length], borderRadius: '50%', marginRight: '6px' }}></div>
                                    <span>{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Clients Table */}
            <div className="chart-container" style={{ marginBottom: '40px' }}>
                <div className="section-header">
                    <h2 className="section-title">Recent Clients</h2>
                </div>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Destination</th>
                                <th>Visa Type</th>
                                <th>Phone No.</th>
                                <th>Date Added</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length > 0 ? (
                                clients.slice(0, 6).map((client) => (
                                    <tr key={client._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{client.name}</div>
                                        </td>
                                        <td>{client.country}</td>
                                        <td>{client.category}</td>
                                        <td>{client.phone}</td>
                                        <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge status-${client.status.toLowerCase()}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        No recent clients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
