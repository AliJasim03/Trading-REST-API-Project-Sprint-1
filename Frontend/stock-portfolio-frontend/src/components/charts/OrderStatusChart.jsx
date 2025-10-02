import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';

const OrderStatusChart = ({ stats = {} }) => {
    // Provide default values for stats
    const safeStats = {
        totalOrders: 0,
        pendingOrders: 0,
        filledOrders: 0,
        ...stats
    };

    const orderData = [
        {
            status: 'Initialized',
            count: safeStats.totalOrders - safeStats.pendingOrders - safeStats.filledOrders,
            color: '#f59e0b',
            icon: AlertCircle,
            statusCode: 0
        },
        {
            status: 'Processing',
            count: safeStats.pendingOrders,
            color: '#3b82f6',
            icon: Clock,
            statusCode: 1
        },
        {
            status: 'Filled',
            count: safeStats.filledOrders,
            color: '#10b981',
            icon: CheckCircle,
            statusCode: 2
        },
        {
            status: 'Rejected',
            count: Math.max(0, safeStats.totalOrders - (safeStats.totalOrders - safeStats.pendingOrders - safeStats.filledOrders) - safeStats.pendingOrders - safeStats.filledOrders),
            color: '#ef4444',
            icon: XCircle,
            statusCode: 3
        }
    ].filter(item => item.count > 0); // Only show statuses with orders

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const IconComponent = data.icon;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="w-4 h-4" style={{ color: data.color }} />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{data.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Orders: {data.count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Percentage: {safeStats.totalOrders > 0 ? ((data.count / safeStats.totalOrders) * 100).toFixed(1) : 0}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomBar = (props) => {
        const { fill, ...rest } = props;
        return <Bar {...rest} fill={props.payload.color} />;
    };

    if (safeStats.totalOrders === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Order Status Distribution
                </h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No orders found</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Order Status Distribution
                </h3>
                <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Orders</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {safeStats.totalOrders}
                    </div>
                </div>
            </div>
            
            <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                    <BarChart data={orderData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                            dataKey="status" 
                            className="text-xs text-gray-600 dark:text-gray-400"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            className="text-xs text-gray-600 dark:text-gray-400"
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {orderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {orderData.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <div key={index} className="flex items-center text-sm">
                            <IconComponent 
                                className="w-4 h-4 mr-2" 
                                style={{ color: item.color }}
                            />
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.count}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.status}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default OrderStatusChart;