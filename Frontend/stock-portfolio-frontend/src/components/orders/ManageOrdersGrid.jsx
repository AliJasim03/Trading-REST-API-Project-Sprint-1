import React from 'react';
import { Search, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';

const ManageOrdersGrid = ({ 
    orders, 
    loading
}) => {
    const navigate = useNavigate();

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

    return (
        <Card className="overflow-hidden">
            {loading ? (
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
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
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {orders.map((order) => (
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default ManageOrdersGrid;
