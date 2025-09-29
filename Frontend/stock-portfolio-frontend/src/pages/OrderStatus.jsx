import React, { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import QuickActions from '../components/ui/QuickActions';
import OrderStatusDetails from '../components/orders/OrderStatusDetails';
import { useOrderStatus } from '../hooks/useOrderStatus';

const OrderStatus = () => {
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState('');
    const [hasAutoSearched, setHasAutoSearched] = useState(false);
    const {
        orderData,
        loading,
        updating,
        error,
        success,
        searchOrder,
        updateOrderStatus
    } = useOrderStatus();

    // Handle URL parameters on component mount
    useEffect(() => {
        const id = searchParams.get('id');
        if (id && !hasAutoSearched) {
            setOrderId(id);
            searchOrder(id);
            setHasAutoSearched(true);
        }
    }, [searchParams, searchOrder, hasAutoSearched]);

    const handleSearch = () => searchOrder(orderId);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            
              <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Order Status</h1>
                                <p className="text-gray-600 dark:text-gray-400">Check the status and details of your orders</p>
                            </div>
                            
                            {/* Quick Actions - Icon Buttons with Tooltips */}
                            <QuickActions />
                        </div>
            

            {/* Search Section */}
            <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Search Order</h2>
                    {searchParams.get('id') && (
                        <span className="text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                            Linked from Manage Orders
                        </span>
                    )}
                </div>
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

            {/* Success Message */}
            {success && (
                <Card className="p-4 mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-center text-green-700 dark:text-green-300">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium">Success</h3>
                            <div className="mt-1 text-sm">{success}</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Order Details */}
            {orderData && (
                <OrderStatusDetails 
                    orderData={orderData}
                    onOrderUpdate={updateOrderStatus}
                    updating={updating}
                    error={error}
                    success={success}
                />
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