import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Activity, Clock, CheckCircle, Plus, PieChart, Search } from 'lucide-react';
import Card from '../components/ui/Card';
import apiService from '../services/apiService';
import Loading from '../components/ui/Loading';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPortfolios: 0,
        totalOrders: 0,
        pendingOrders: 0,
        filledOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get portfolios and calculate stats
            const portfolios = await apiService.getAllPortfolios();

            // Get orders from all portfolios to calculate stats
            let allOrders = [];
            for (const portfolio of portfolios) {
                try {
                    const orders = await apiService.getTradingHistory(portfolio.portfolioId);
                    allOrders = [...allOrders, ...orders];
                } catch (err) {
                    console.warn(`Failed to load orders for portfolio ${portfolio.portfolioId}:`, err);
                }
            }

            const pendingOrders = allOrders.filter(order => order.status_code === 0).length;
            const filledOrders = allOrders.filter(order => order.status_code === 1).length;

            setStats({
                totalPortfolios: portfolios.length,
                totalOrders: allOrders.length,
                pendingOrders,
                filledOrders
            });
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Loading size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Dashboard</h1>
                <p className="text-gray-600">Manage your investment portfolios and track your trading activity</p>
            </div>

            {error && (
                <Card className="p-4 mb-6 border-red-200 bg-red-50">
                    <div className="flex items-center text-red-700">
                        <div className="text-sm">
                            <strong>Error loading dashboard:</strong> {error}
                        </div>
                    </div>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-primary-100 rounded-full">
                            <Briefcase className="text-primary-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Portfolios</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPortfolios}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Activity className="text-blue-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <Clock className="text-yellow-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle className="text-green-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Filled Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.filledOrders}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link to="/place-order" className="block">
                        <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer group">
                            <Plus className="text-primary-600 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 mb-1">Place New Order</h3>
                            <p className="text-sm text-gray-600">Buy or sell stocks in your portfolios</p>
                        </div>
                    </Link>

                    <Link to="/portfolios" className="block">
                        <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer group">
                            <PieChart className="text-primary-600 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 mb-1">View Portfolios</h3>
                            <p className="text-sm text-gray-600">Manage and track your portfolios</p>
                        </div>
                    </Link>

                    <Link to="/order-status" className="block">
                        <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer group">
                            <Search className="text-primary-600 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 mb-1">Check Order Status</h3>
                            <p className="text-sm text-gray-600">Track your order progress</p>
                        </div>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;