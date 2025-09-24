import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Response error:', error);

        if (error.code === 'ECONNREFUSED') {
            throw new Error('Unable to connect to the server. Please ensure the backend is running on port 8080.');
        }

        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || `Server Error: ${error.response.status}`;
            throw new Error(message);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('No response from server. Please check your connection.');
        } else {
            // Something else happened
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
);

const apiService = {
    // Orders API
    placeOrder: async (portfolioId, stockId, orderData) => {
        try {
            const response = await apiClient.post(
                `/orders/place?portfolio_id=${portfolioId}&stock_id=${stockId}`,
                orderData
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTradingHistory: async (portfolioId) => {
        try {
            const response = await apiClient.get(`/orders/history?portfolio_id=${portfolioId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getOrderStatus: async (orderId) => {
        try {
            const response = await apiClient.get(`/orders/${orderId}/status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await apiClient.put(`/orders/${orderId}/status?status=${status}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllOrders: async () => {
        try {
            const response = await apiClient.get('/orders');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Additional endpoints for portfolios and stocks (we'll add these to backend)
    getAllPortfolios: async () => {
        try {
            const response = await apiClient.get('/portfolios');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllStocks: async () => {
        try {
            const response = await apiClient.get('/stocks');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getPortfolioById: async (portfolioId) => {
        try {
            const response = await apiClient.get(`/portfolios/${portfolioId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Price history
    getPriceHistory: async (stockId) => {
        try {
            const response = await apiClient.get(`/stocks/${stockId}/price-history`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default apiService;