import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Eye, TrendingUp, TrendingDown, Clock, Bell, Trash2, Star } from 'lucide-react';
import apiService, { watchlistService } from '../../services/apiService';

const WatchlistGrid = ({ watchlistData = [], loading = false, onAddAlert, onViewAlerts, onRemoveStock, onAddStock }) => {
    const { isDarkMode } = useTheme();
    const [showAddStockDialog, setShowAddStockDialog] = useState(false);

    // Get unique stocks from watchlist data
    const getUniqueWatchlistStocks = () => {
        const stockMap = new Map();
        
        watchlistData.forEach(entry => {
            if (entry.stock) {
                const stockId = entry.stock.stockId;
                if (!stockMap.has(stockId)) {
                    stockMap.set(stockId, {
                        ...entry.stock,
                        alertCount: 0,
                        activeAlertCount: 0,
                        // Mock current price and change for now (will be from live prices later)
                        currentPrice: Math.random() * 200 + 50,
                        priceChange: (Math.random() - 0.5) * 10
                    });
                }
                
                // Update alert counts (only count entries with actual alerts)
                const stock = stockMap.get(stockId);
                if (entry.targetPrice !== null && entry.alertDirection !== null) {
                    stock.alertCount++;
                    if (!entry.notified) {
                        stock.activeAlertCount++;
                    }
                }
            }
        });
        
        return Array.from(stockMap.values());
    };

    const watchlistStocks = getUniqueWatchlistStocks();

    // Format currency
    const formatCurrency = (value) => {
        if (value == null) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    // Format percentage
    const formatPercentage = (value) => {
        if (value == null) return '0.00%';
        const color = value >= 0 ? 'text-green-600' : 'text-red-600';
        return (
            <span className={color}>
                {value >= 0 ? '+' : ''}{value.toFixed(2)}%
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading watchlist...</span>
            </div>
        );
    }

    if (!watchlistStocks || watchlistStocks.length === 0) {
        return (
            <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Your watchlist is empty
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Add stocks to your watchlist to monitor their prices and set alerts.
                </p>
                <Button
                    onClick={onAddStock}
                    className="flex items-center mx-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock to Watchlist
                </Button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Your Watchlist ({watchlistStocks.length} stocks)
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {watchlistData.filter(alert => alert.targetPrice !== null && !alert.notified).length} active alerts across all stocks
                    </p>
                </div>
                <Button
                    onClick={onAddStock}
                    className="flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                </Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Current Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Change
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Alerts
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {watchlistStocks.map((stock, index) => (
                            <tr key={`${stock.stockId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="font-bold text-lg">{stock.stockTicker}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {stock.stockName}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(stock.currentPrice)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {formatPercentage(stock.priceChange)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        {stock.alertCount > 0 ? (
                                            <>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Bell className="w-3 h-3 mr-1" />
                                                    {stock.alertCount} total
                                                </span>
                                                {stock.activeAlertCount > 0 && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        {stock.activeAlertCount} active
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400">No alerts</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            onClick={() => onAddAlert(stock)}
                                            className="flex items-center"
                                            title="Add price alert"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Alert
                                        </Button>
                                        {stock.alertCount > 0 && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onViewAlerts(stock)}
                                                className="flex items-center"
                                                title="View existing alerts"
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View ({stock.alertCount})
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onRemoveStock(stock)}
                                            className="flex items-center text-red-600 hover:text-red-700 hover:border-red-300"
                                            title="Remove from watchlist"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Remove
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WatchlistGrid;