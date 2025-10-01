import React, { useState, useEffect } from 'react';
import { Search, Star, X, CheckCircle } from 'lucide-react';
import Dialog from './Dialog';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import apiService from '../../services/apiService';

const AddStockToWatchlistDialog = ({ isOpen, onClose, onAddStock, watchlistData = [] }) => {
    const [stocks, setStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Load stocks when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadStocks();
            resetForm();
        }
    }, [isOpen]);

    const loadStocks = async () => {
        try {
            setLoading(true);
            const stockData = await apiService.getAllStocks();
            setStocks(stockData || []);
        } catch (err) {
            console.error('Failed to load stocks:', err);
            setError('Failed to load stocks');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSearchQuery('');
        setError(null);
        setSuccess(null);
    };

    const handleStockSelect = async (stock) => {
        try {
            setSubmitting(true);
            setError(null);
            
            await onAddStock(stock);
            setSuccess(`${stock.stockTicker} added to your watchlist!`);
            
            // Close dialog after 1.5 seconds
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Failed to add stock to watchlist:', err);
            setError(err.message || 'Failed to add stock to watchlist. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter stocks based on search query and exclude stocks already in watchlist
    const getWatchlistedStockIds = () => {
        return new Set(watchlistData.map(entry => entry.stock?.stockId).filter(Boolean));
    };

    const filteredStocks = stocks.filter(stock => {
        const watchlistedIds = getWatchlistedStockIds();
        const isNotInWatchlist = !watchlistedIds.has(stock.stockId);
        const matchesSearch = stock.stockTicker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            stock.stockName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return isNotInWatchlist && matchesSearch;
    });

    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Add Stock to Watchlist" 
            size="md"
            closeOnOverlayClick={!submitting}
        >
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center text-red-700 dark:text-red-300">
                            <X className="h-5 w-5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium">Error</h3>
                                <div className="mt-1 text-sm">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center text-green-700 dark:text-green-300">
                            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium">Stock added to watchlist!</h3>
                                <div className="mt-1 text-sm">{success}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Search for a stock to add to your watchlist
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ticker or company name (e.g., AAPL, Apple)..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            disabled={submitting}
                        />
                    </div>
                    {getWatchlistedStockIds().size > 0 && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {getWatchlistedStockIds().size} stocks already in your watchlist are hidden from this list.
                        </p>
                    )}
                </div>

                {/* Stock List */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loading size="lg" />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading stocks...</p>
                        </div>
                    ) : filteredStocks.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredStocks.map((stock) => (
                                <button
                                    key={stock.stockId}
                                    type="button"
                                    onClick={() => handleStockSelect(stock)}
                                    disabled={submitting}
                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {stock.stockTicker}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {stock.stockName}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {submitting ? (
                                                <Loading size="sm" />
                                            ) : (
                                                <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="p-8 text-center">
                            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No available stocks found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {stocks.filter(stock => 
                                    stock.stockTicker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    stock.stockName?.toLowerCase().includes(searchQuery.toLowerCase())
                                ).length === 0 
                                    ? "Try searching with a different ticker symbol or company name."
                                    : "All matching stocks are already in your watchlist. Try a different search term."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Search for stocks
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Type in the search box above to find stocks to add to your watchlist.
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600 mt-6">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default AddStockToWatchlistDialog;