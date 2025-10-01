import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import WatchlistGrid from '../components/watchlist/WatchlistGrid';
import AddWatchlistDialog from '../components/dialog/AddWatchlistDialog';
import AddStockToWatchlistDialog from '../components/dialog/AddStockToWatchlistDialog';
import ViewAlertsDialog from '../components/watchlist/ViewAlertsDialog';
import { watchlistService } from '../services/apiService';
import { Bell, Plus, AlertTriangle, RotateCcw } from 'lucide-react';

const Watchlist = () => {
    const [watchlistData, setWatchlistData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Load watchlist data
    const loadWatchlist = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await watchlistService.getAllWatchlist();
            console.log('Watchlist data structure:', data);
            // sort data by alert count (so stocks with more alerts appear first)
            data.sort((a, b) => (b.alertCount || 0) - (a.alertCount || 0));
            setWatchlistData(data || []);
        } catch (err) {
            console.error('Failed to load watchlist:', err);
            setError(err.message || 'Failed to load watchlist');
            toast.error('Failed to load watchlist');
        } finally {
            setLoading(false);
        }
    };

    // Refresh watchlist
    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await loadWatchlist();
            toast.success('Watchlist refreshed');
        } catch (err) {
            toast.error('Failed to refresh watchlist');
        } finally {
            setRefreshing(false);
        }
    };

    // Handle adding stock to watchlist (without creating an alert)
    const handleAddStockToWatchlist = async (stock) => {
        try {
            await watchlistService.addStockToWatchlist(stock.stockId);
            toast.success(`${stock.stockTicker} added to your watchlist`);
            setIsAddStockDialogOpen(false);
            await loadWatchlist(); // Refresh the list
        } catch (err) {
            console.error('Failed to add stock to watchlist:', err);
            toast.error(err.message || 'Failed to add stock to watchlist');
        }
    };

    // Handle removing stock from watchlist (removes all alerts for that stock)
    const handleRemoveStockFromWatchlist = async (stock) => {
        try {
            // Find all alerts for this stock and remove them
            const stockAlerts = watchlistData.filter(entry => entry.stock?.stockId === stock.stockId);
            
            for (const alert of stockAlerts) {
                await watchlistService.removeFromWatchlist(alert.id);
            }
            
            toast.success(`${stock.stockTicker} removed from your watchlist`);
            await loadWatchlist(); // Refresh the list
        } catch (err) {
            console.error('Failed to remove stock from watchlist:', err);
            toast.error(err.message || 'Failed to remove stock from watchlist');
        }
    };

    // Handle adding new watchlist entry for specific stock
    const handleAddAlert = (stock) => {
        setSelectedStock(stock);
        setIsAddDialogOpen(true);
    };

    // Handle viewing alerts for specific stock
    const handleViewAlerts = (stock) => {
        setSelectedStock(stock);
        setIsViewDialogOpen(true);
    };

    // Handle opening add stock dialog
    const handleOpenAddStockDialog = () => {
        setIsAddStockDialogOpen(true);
    };

    // Handle adding new watchlist entry
    const handleAddToWatchlist = async (stockId, targetPrice, alertDirection) => {
        try {
            await watchlistService.addToWatchlist(stockId, targetPrice, alertDirection);
            toast.success(`Alert added for ${selectedStock?.stockTicker}`);
            setIsAddDialogOpen(false);
            await loadWatchlist(); // Refresh the list
        } catch (err) {
            console.error('Failed to add to watchlist:', err);
            toast.error(err.message || 'Failed to add to watchlist');
        }
    };

    // Handle removing from watchlist
    const handleRemoveFromWatchlist = async (entryId) => {
        try {
            await watchlistService.removeFromWatchlist(entryId);
            toast.success('Alert removed successfully');
            await loadWatchlist(); // Refresh the list
        } catch (err) {
            console.error('Failed to remove from watchlist:', err);
            toast.error(err.message || 'Failed to remove alert');
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadWatchlist();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Watchlist</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Monitor your favorite stocks and set price alerts
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            disabled={refreshing}
                            className="flex items-center"
                        >
                            <RotateCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center text-red-800 dark:text-red-200">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span>{error}</span>
                        <Button
                            onClick={loadWatchlist}
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                        >
                            Retry
                        </Button>
                    </div>
                </Card>
            )}

            {/* Watchlist Grid */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Your Watchlist
                        </h2>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {watchlistData.length} stocks being watched
                        </div>
                    </div>

                    <WatchlistGrid
                        watchlistData={watchlistData}
                        onAddAlert={handleAddAlert}
                        onViewAlerts={handleViewAlerts}
                        onRemoveStock={handleRemoveStockFromWatchlist}
                        onAddStock={handleOpenAddStockDialog}
                        loading={refreshing}
                    />
                </div>
            </Card>

            {/* Add Watchlist Dialog */}
            {selectedStock && (
                <AddWatchlistDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => {
                        setIsAddDialogOpen(false);
                        setSelectedStock(null);
                    }}
                    onAddToWatchlist={handleAddToWatchlist}
                    selectedStock={selectedStock}
                />
            )}

            {/* Add Stock to Watchlist Dialog */}
            <AddStockToWatchlistDialog
                isOpen={isAddStockDialogOpen}
                onClose={() => setIsAddStockDialogOpen(false)}
                onAddStock={handleAddStockToWatchlist}
            />

            {/* View Alerts Dialog */}
            {selectedStock && (
                <ViewAlertsDialog
                    isOpen={isViewDialogOpen}
                    onClose={() => {
                        setIsViewDialogOpen(false);
                        setSelectedStock(null);
                    }}
                    stock={selectedStock}
                    alerts={watchlistData.filter(entry => entry.stock?.stockId === selectedStock.stockId)}
                    onRemoveAlert={handleRemoveFromWatchlist}
                />
            )}
        </div>
    );
};

export default Watchlist;