import React, { useState } from 'react';
import { Search, Clock, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import apiService from '../services/apiService';

const OrderStatus = () => {
    const [orderId, setOrderId] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!orderId.trim()) {
            setError('Please enter an order ID');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const order = await apiService.getOrderStatus(parseInt(orderId));
            setOrderData(order);
        } catch (err) {
            console.error('Failed to get order status:', err);
            setError(err.message);
            setOrderData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const getOrderTypeColor = (buyOrSell) => {
        return buyOrSell === 'BUY'
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
            : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    };

    const getStatusIcon = (statusCode) => {
        switch (statusCode) {
            case 0:
                return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
            case 1:
                return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
            case 2:
                return <div className="w-5 h-5 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>;
            default:
                return <div className="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>;
        }
    };

    const getStatusMessage = (statusCode) => {
        switch (statusCode) {
            case 0:
                return 'Your order is pending and will be processed soon.';
            case 1:
                return 'Your order has been successfully filled.';
            case 2:
                return 'Your order has been rejected. Please contact support if you need assistance.';
            default:
                return 'Unknown order status.';
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Order Status</h1>
                <p className="text-gray-600 dark:text-gray-400">Check the status and details of your orders</p>
            </div>

            {/* Search Section */}
            <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Search Order</h2>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            label="Order ID"
                            type="number"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter order ID (e.g., 1, 2, 3...)"
                            className="mb-0"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={handleSearch} loading={loading} size="lg">
                            <Search className="w-5 h-5" />
                            Search
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Error Message */}
            {error && (
                <Card className="p-4 mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex items-center text-red-700 dark:text-red-300">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium">Error</h3>
                            <div className="mt-1 text-sm">{error}</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Order Details */}
            {orderData && (
                <>
                    {/* Status Header */}
                    <Card className="p-6 mb-6 border-l-4 border-l-primary-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                {getStatusIcon(orderData.status_code)}
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-3">
                                    Order #{orderData.orderId}
                                </h2>
                            </div>
                            <StatusBadge status={orderData.status_code} className="text-sm px-3 py-1" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{getStatusMessage(orderData.status_code)}</p>
                    </Card>

                    {/* Detailed Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Basic Information */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mr-2"></div>
                                Basic Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                                    <span className="font-medium text-lg text-gray-900 dark:text-gray-100">#{orderData.orderId}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                    {orderData.stock?.stockTicker ?
                        `${orderData.stock.stockTicker} - ${orderData.stock.stockName}` :
                        'N/A'
                    }
                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Portfolio:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                    {orderData.portfolio?.portfolioName || 'N/A'}
                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Order Type:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getOrderTypeColor(orderData.buy_or_sell)}`}>
                    {orderData.buy_or_sell}
                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 dark:text-gray-400">Order Method:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{orderData.order_type || 'N/A'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Financial Details */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-2"></div>
                                Financial Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Price per Share:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">${orderData.price?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{orderData.volume || 0} shares</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Order Value:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${((orderData.price || 0) * (orderData.volume || 0)).toFixed(2)}
                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Transaction Fees:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">${orderData.fees?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3">
                                    <span className="text-gray-900 dark:text-gray-100 font-semibold">Total Cost:</span>
                                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    ${((orderData.price || 0) * (orderData.volume || 0) + (orderData.fees || 0)).toFixed(2)}
                  </span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Timeline */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-2"></div>
                            Order Timeline
                        </h3>
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-primary-600 dark:bg-primary-500 rounded-full border-2 border-white dark:border-gray-800 shadow"></div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Order Placed</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {orderData.createdAt ?
                                                new Date(orderData.createdAt).toLocaleString() :
                                                'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-4"></div>

                                <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow ${
                                        orderData.status_code >= 1 ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}></div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {orderData.status_code === 1 ? 'Order Filled' :
                                                orderData.status_code === 2 ? 'Order Rejected' : 'Processing'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {orderData.status_code >= 1 ? 'Completed' : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}

            {/* Help Text */}
            {!orderData && !error && !loading && (
                <Card className="p-8">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Search for an Order</h3>
                        <p className="text-sm mb-4">
                            Enter an order ID above to view detailed order information, status, and timeline.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Order IDs are typically numbers like 1, 2, 3, etc.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default OrderStatus;