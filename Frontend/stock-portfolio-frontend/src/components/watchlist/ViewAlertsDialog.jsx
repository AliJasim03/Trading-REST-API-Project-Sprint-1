import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Trash2, X, CheckCircle } from 'lucide-react';
import Dialog from '../dialog/Dialog';
import Button from '../ui/Button';
import Loading from '../ui/Loading';

const ViewAlertsDialog = ({ isOpen, onClose, stock, alerts = [], onRemoveAlert }) => {
    const [removing, setRemoving] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Format currency
    const formatCurrency = (value) => {
        if (value == null) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    // Filter alerts for this stock
    const stockAlerts = alerts.filter(alert => alert.stock?.stockId === stock?.stockId);
    
    // Debug logging
    console.log('ViewAlertsDialog - Selected stock:', stock);
    console.log('ViewAlertsDialog - All alerts received:', alerts);
    console.log('ViewAlertsDialog - Filtered stockAlerts:', stockAlerts);

    const handleRemoveAlert = async (alertId) => {
        try {
            setRemoving(alertId);
            setError(null);
            await onRemoveAlert(alertId);
            setSuccess('Alert removed successfully!');
            
            // Clear success message after 2 seconds
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError(err.message || 'Failed to remove alert');
        } finally {
            setRemoving(null);
        }
    };

    if (!stock) return null;

    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Price Alerts for ${stock.stockTicker}`}
            size="lg"
        >
            <div className="p-6">
                {/* Stock Info Header */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {stock.stockTicker}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {stock.stockName}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(stock.currentPrice)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Current Price
                            </div>
                        </div>
                    </div>
                </div>

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
                                <h3 className="text-sm font-medium">Success</h3>
                                <div className="mt-1 text-sm">{success}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerts List */}
                {stockAlerts.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No alerts set for this stock
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Click "Add Alert" to create your first price alert for {stock.stockTicker}.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Active Alerts ({stockAlerts.length})
                        </h4>
                        
                        {stockAlerts.map((alert) => (
                            <div 
                                key={alert.id} 
                                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {/* Alert Direction */}
                                        <div className="flex items-center">
                                            {alert.alertDirection === 'ABOVE' ? (
                                                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                                            )}
                                            <span className={`font-medium ${
                                                alert.alertDirection === 'ABOVE' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {alert.alertDirection}
                                            </span>
                                        </div>

                                        {/* Target Price */}
                                        <div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(alert.targetPrice)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Target Price
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                alert.notified 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                                {alert.notified ? (
                                                    <>
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Triggered
                                                    </>
                                                ) : (
                                                    'Active'
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRemoveAlert(alert.id)}
                                        disabled={removing === alert.id}
                                        className="flex items-center text-red-600 hover:text-red-700 hover:border-red-300"
                                        title="Remove alert"
                                    >
                                        {removing === alert.id ? (
                                            <Loading size="sm" className="mr-1" />
                                        ) : (
                                            <Trash2 className="w-3 h-3 mr-1" />
                                        )}
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600 mt-6">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default ViewAlertsDialog;