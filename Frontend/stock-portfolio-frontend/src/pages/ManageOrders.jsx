import React, { useState, useEffect } from 'react';
import { Search, Settings, Check, X, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import ManageOrdersGrid from '../components/orders/ManageOrdersGrid';
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
            <ManageOrdersGrid 
                orders={filteredOrders}
                loading={loading}
                updating={updating}
                onUpdateStatus={handleUpdateStatus}
            />

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