// API Service for CRM Frontend
// Place this file in: src/services/api.js

const API_BASE_URL = 'https://visa-consultancey-backend12.vercel.app/api';

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

// Document Fraud Detection API
export const documentFraudAPI = {
    /**
     * Analyze a document for fraud indicators
     * @param {File} file - The document file to analyze
     * @param {string} documentType - e.g. 'passport', 'degree', 'visa', 'bank_statement'
     * @returns {Promise<object>} Analysis result
     */
    analyze: async (file, documentType = 'passport') => {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', documentType);

            const response = await fetch(`${API_BASE_URL}/document-fraud/analyze`, {
                method: 'POST',
                body: formData,
                // ⚠️ Do NOT set Content-Type header — browser sets it automatically with boundary
            });

            let data;
            try {
                data = await response.json();
            } catch {
                const text = await response.text();
                throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                console.error('Backend error response:', { status: response.status, data });
                throw new Error(data.message || data.error || `Server error (${response.status})`);
            }

            return data;
        } catch (error) {
            console.error('Document Fraud API Error:', error);
            throw error;
        }
    },
};

// Health check
export const healthCheck = async () => {
    return apiRequest('/health');
};

export default clientsAPI;
