# Frontend Integration Guide

## 🔗 Connecting Frontend to Backend

### Step 1: API Service Setup

The API service has been created at `src/services/api.js`. This provides all the methods needed to interact with the backend.

### Step 2: Update Clients.jsx to Use Real API

Here's how to integrate the API into your Clients page:

```javascript
import React, { useState, useEffect } from 'react';
import { clientsAPI } from '../services/api';
import { UserPlus, Search, Filter } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getAll();
      setClients(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientsAPI.delete(id);
        // Refresh the list
        fetchClients();
      } catch (err) {
        alert('Failed to delete client');
        console.error(err);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await clientsAPI.update(id, { status: newStatus });
      // Refresh the list
      fetchClients();
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  // Filter clients based on search and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  if (error) {
    return <div className="page-container">Error: {error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client database</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={20} />
          Add Client
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Clients Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Country</th>
              <th>Category</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client._id}>
                <td style={{ fontWeight: 500 }}>{client.name}</td>
                <td>{client.country}</td>
                <td>{client.category}</td>
                <td>
                  <span className={`status-badge status-${client.status.toLowerCase()}`}>
                    {client.status}
                  </span>
                </td>
                <td>{client.phone}</td>
                <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleUpdateStatus(client._id, 'Approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleDeleteClient(client._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', color: '#64748b' }}>
        Showing {filteredClients.length} of {clients.length} clients
      </div>
    </div>
  );
};

export default Clients;
```

### Step 3: Example - Adding a New Client

```javascript
const handleAddClient = async (clientData) => {
  try {
    const response = await clientsAPI.create({
      name: "New Client",
      country: "Canada",
      category: "Study Visa",
      status: "Pending",
      phone: "+92 300 0000000",
      email: "newclient@example.com",
      address: "Address here",
      notes: "Notes here"
    });
    
    console.log('Client created:', response.data);
    // Refresh the clients list
    fetchClients();
  } catch (error) {
    console.error('Error creating client:', error);
  }
};
```

### Step 4: Running Both Frontend and Backend

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173` (or similar)

### Step 5: CORS Configuration

The backend is already configured with CORS enabled, so your frontend can make requests without issues.

### Step 6: Error Handling

The API service includes error handling. You can catch errors like this:

```javascript
try {
  const response = await clientsAPI.getAll();
  setClients(response.data);
} catch (error) {
  console.error('Failed to fetch clients:', error.message);
  // Show error message to user
}
```

## 🎯 Quick Reference

### Available API Methods

```javascript
import { clientsAPI } from './services/api';

// Get all clients
const clients = await clientsAPI.getAll();

// Get single client
const client = await clientsAPI.getById(id);

// Create client
const newClient = await clientsAPI.create(clientData);

// Update client
const updated = await clientsAPI.update(id, clientData);

// Delete client
await clientsAPI.delete(id);

// Filter by status
const pending = await clientsAPI.getByStatus('Pending');

// Filter by category
const studyVisa = await clientsAPI.getByCategory('Study Visa');
```

## 📊 Response Format

All API responses follow this format:

```javascript
{
  success: true,
  data: [...], // or single object
  count: 10,   // for list endpoints
  message: "..." // for create/update/delete
}
```

## 🔧 Environment Variables (Optional)

You can create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5000/api
```

Then update `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```
