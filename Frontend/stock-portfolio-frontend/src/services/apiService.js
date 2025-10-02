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

    // Portfolios API
    getAllPortfolios: async () => {
        try {
            const response = await apiClient.get('/portfolios');
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

    // ADD: holdings under apiService (used by PlaceOrderDialog)
    getPortfolioHoldings: async (portfolioId) => {
        try {
            const response = await apiClient.get(`/portfolios/${portfolioId}/holdings`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createPortfolio: async (portfolioData) => {
        try {
            const response = await apiClient.post('/portfolios/create', portfolioData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updatePortfolio: async (portfolioId, portfolioData) => {
        try {
            const response = await apiClient.put(`/portfolios/${portfolioId}`, portfolioData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Portfolio Analytics APIs
    getPortfolioSummary: async () => {
        try {
            const response = await apiClient.get('/portfolios/summary');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getPortfolioDashboard: async (portfolioId) => {
        try {
            const response = await apiClient.get(`/portfolios/${portfolioId}/dashboard`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getPortfolioPerformance: async (portfolioId) => {
        try {
            const response = await apiClient.get(`/portfolios/${portfolioId}/performance`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getPortfolioAllocation: async (portfolioId) => {
        try {
            const response = await apiClient.get(`/portfolios/${portfolioId}/allocation`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Stocks API
    getAllStocks: async () => {
        try {
            // Ask for many records; if backend paginates, unwrap content
            const response = await apiClient.get('/stocks', { params: { page: 0, size: 1000, limit: 1000 } });
            const data = response.data;
            return Array.isArray(data) ? data : (data?.content || []);
        } catch (error) {
            throw error;
        }
    },

    addStock: async (stockData) => {
        try {
            const response = await apiClient.post('/stocks', stockData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchStocks: async (query) => {
        try {
            const response = await apiClient.get(`/stocks/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // LivePrices page specific methods
    addStockToDatabase: async (stockData) => {
        try {
            const response = await apiClient.post('/stocks', stockData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchStockSuggestions: async (query) => {
        try {
            const response = await apiClient.get(`/stocks/search?q=${encodeURIComponent(query)}`);
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
    },

    // Finnhub Live Prices API (NEW)
    getLivePrice: async (stockId) => {
        try {
            const response = await apiClient.get(`/stocks/${stockId}/live-price`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getLivePriceBySymbol: async (symbol) => {
        try {
            const response = await apiClient.get(`/stocks/ticker/${symbol}/live-price`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getCompanyProfile: async (symbol) => {
        try {
            const response = await apiClient.get(`/stocks/ticker/${symbol}/profile`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// Live Prices API Service
const livePriceService = {
    getCurrentPrice: async (symbol) => {
        try {
            const response = await apiClient.get(`/api/live-prices/${symbol}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getMultiplePrices: async (symbols) => {
        try {
            const response = await apiClient.post('/api/live-prices/batch', symbols);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getPopularStocks: async () => {
        try {
            const response = await apiClient.get('/api/live-prices/popular');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHistoricalData: async (symbol, period = 'daily') => {
        try {
            const response = await apiClient.get(`/api/live-prices/${symbol}/history?period=${period}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getIntradayData: async (symbol) => {
        try {
            const response = await apiClient.get(`/api/live-prices/${symbol}/intraday`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchStocks: async (query) => {
        try {
            const response = await apiClient.get(`/api/live-prices/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

const watchlistService = {
    // Add stock to watchlist with alert
    addToWatchlist: async (stockId, targetPrice, alertDirection) => {
        try {
            const response = await apiClient.post('/api/watchlist', null, {
                params: {
                    id: 1, // Placeholder user ID since you don't have user auth yet
                    stockId,
                    targetPrice,
                    direction: alertDirection
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Add stock to watchlist without alert
    addStockToWatchlist: async (stockId) => {
        try {
            const response = await apiClient.post('/api/watchlist/stock', null, {
                params: {
                    id: 1, // Placeholder user ID since you don't have user auth yet
                    stockId
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Remove stock from watchlist
    removeFromWatchlist: async (entryId) => {
        try {
            const response = await apiClient.delete(`/api/watchlist/${entryId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all watchlist entries
    getAllWatchlist: async () => {
        try {
            const response = await apiClient.get('/api/watchlist/all');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update watchlist entry
    updateWatchlistEntry: async (entryId, targetPrice, alertDirection) => {
        try {
            const response = await apiClient.put(`/api/watchlist/${entryId}`, {
                targetPrice,
                alertDirection
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Search for stocks using Finnhub symbol lookup
    searchStocks: async (query) => {
        try {
            const response = await apiClient.get(`/api/stocks/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// Export both services
export default apiService;
export {livePriceService as livePrices, watchlistService};