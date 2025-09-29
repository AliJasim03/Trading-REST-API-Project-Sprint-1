import React, { useState, useEffect } from 'react';
import { Search, Settings, Check, X, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import apiService from '../services/apiService';
import QuickActions from '../components/ui/QuickActions';

const ManageOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'filled', 'rejected'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAllOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, filter, searchTerm]);

    const loadAllOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getAllOrders();
            setOrders(response);
        } catch (err) {
            console.error('Failed to load orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        // Apply status filter
        if (filter !== 'all') {
            const statusCode = filter === 'pending' ? 0 : filter === 'filled' ? 1 : 2;
            filtered = filtered.filter(order => order.status_code === statusCode);
        }

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(order => 
                order.orderId.toString().includes(searchTerm) ||
                order.stock?.stockTicker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.stock?.stockName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.portfolio?.portfolioName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdating(prev => ({ ...prev, [orderId]: true }));
        setError(null);
        setSuccess(null);
        
        try {
            const updatedOrder = await apiService.updateOrderStatus(orderId, newStatus);
            
            // Update the order in the list
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.orderId === orderId ? updatedOrder : order
                )
            );
            
            const statusText = newStatus === 1 ? 'filled' : 'rejected';
            setSuccess(`Order #${orderId} has been ${statusText}.`);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to update order status:', err);
            setError(err.message);
        } finally {
            setUpdating(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const getStatusIcon = (statusCode) => {
        switch (statusCode) {
            case 0:
                return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
            case 1:
                return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
            case 2:
                return <div className="w-4 h-4 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>;
            default:
                return <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 rounded-full"></div>;
        }
    };

    const getOrderTypeColor = (buyOrSell) => {
        return buyOrSell === 'BUY'
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
            : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    const pendingCount = orders.filter(order => order.status_code === 0).length;
    const filledCount = orders.filter(order => order.status_code === 1).length;
    const rejectedCount = orders.filter(order => order.status_code === 2).length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Manage Orders</h1>
                    <p className="text-gray-600 dark:text-gray-400">View and manage all orders in the system</p>
                </div>
                
                {/* Quick Actions - Icon Buttons with Tooltips */}
                <QuickActions />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard 
                    icon={Settings}
                    title="Total Orders"
                    value={orders.length}
                    iconColor="gray"
                    iconSize="w-8 h-8"
                />

                <StatCard 
                    icon={Clock}
                    title="Pending"
                    value={pendingCount}
                    iconColor="yellow"
                    iconSize="w-8 h-8"
                />

                <StatCard 
                    icon={CheckCircle}
                    title="Filled"
                    value={filledCount}
                    iconColor="green"
                    iconSize="w-8 h-8"
                />

                <StatCard 
                    icon={X}
                    title="Rejected"
                    value={rejectedCount}
                    iconColor="red"
                    iconSize="w-8 h-8"
                />
            </div>

            {/* Filters and Controls */}
            <Card className="p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search orders, stocks, portfolios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending Only</option>
                            <option value="filled">Filled Only</option>
                            <option value="rejected">Rejected Only</option>
                        </select>
                    </div>
                    
                    <Button onClick={loadAllOrders} loading={loading}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </Card>

            {/* Messages */}
            {error && (
                <Card className="p-4 mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex items-center text-red-700 dark:text-red-300">
                        <X className="h-5 w-5 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium">Error</h3>
                            <div className="mt-1 text-sm">{error}</div>
                        </div>
                    </div>
                </Card>
            )}

            {success && (
                <Card className="p-4 mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-center text-green-700 dark:text-green-300">
                        <CheckCircle className="h-5 w-5 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium">Success</h3>
                            <div className="mt-1 text-sm">{success}</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Orders Table */}
            <Card className="overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No orders found</h3>
                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Portfolio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredOrders.map((order) => (
                                    <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(order.status_code)}
                                                <div className="ml-3">
                                                    <button
                                                        onClick={() => navigate(`/order-status?id=${order.orderId}`)}
                                                        className="text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
                                                        title="View order details"
                                                    >
                                                        #{order.orderId}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                <div className="font-medium">{order.stock?.stockTicker || 'N/A'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{order.stock?.stockName || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {order.portfolio?.portfolioName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getOrderTypeColor(order.buy_or_sell)}`}>
                                                {order.buy_or_sell}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            <div>{order.volume} shares</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">@ ${order.price?.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={order.status_code} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {order.status_code === 0 ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.orderId, 1)}
                                                        disabled={updating[order.orderId]}
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                                        title="Mark as Filled"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.orderId, 2)}
                                                        disabled={updating[order.orderId]}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                        title="Mark as Rejected"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Results Summary */}
            {!loading && filteredOrders.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                    Showing {filteredOrders.length} of {orders.length} orders
                </div>
            )}
        </div>
    );
};

export default ManageOrders;