// API Service for CRM Frontend
// Place this file in: src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Client API methods
export const clientsAPI = {
    // Get all clients
    getAll: async () => {
        return apiRequest('/clients');
    },

    // Get single client by ID
    getById: async (id) => {
        return apiRequest(`/clients/${id}`);
    },

    // Create new client
    create: async (clientData) => {
        return apiRequest('/clients', {
            method: 'POST',
            body: JSON.stringify(clientData),
        });
    },

    // Update client
    update: async (id, clientData) => {
        return apiRequest(`/clients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(clientData),
        });
    },

    // Delete client
    delete: async (id) => {
        return apiRequest(`/clients/${id}`, {
            method: 'DELETE',
        });
    },

    // Get clients by status
    getByStatus: async (status) => {
        return apiRequest(`/clients/status/${status}`);
    },

    // Get clients by category
    getByCategory: async (category) => {
        return apiRequest(`/clients/category/${encodeURIComponent(category)}`);
    },
};

// Health check
export const healthCheck = async () => {
    return apiRequest('/health');
};

export default clientsAPI;
