import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Activity, Clock, CheckCircle, Plus, PieChart, Search, Settings, TrendingUp, DollarSign, Target } from 'lucide-react';
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
    const [portfolioSummary, setPortfolioSummary] = useState([]);
    const [totalStats, setTotalStats] = useState({
        totalValue: 0,
        totalCapital: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0
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
            // Get portfolio summary from new API
            const summary = await apiService.getPortfolioSummary();
            setPortfolioSummary(summary);

            // Calculate totals
            const totals = summary.reduce((acc, portfolio) => ({
                totalValue: acc.totalValue + portfolio.totalValue,
                totalCapital: acc.totalCapital + portfolio.totalCapital,
                totalAvailableCapital: acc.totalAvailableCapital + portfolio.availableCapital
            }), { totalValue: 0, totalCapital: 0, totalAvailableCapital: 0 });

            // Get performance data for all portfolios
            let combinedPerformance = {
                totalInvested: 0,
                totalSold: 0,
                currentValue: 0,
                totalGainLoss: 0
            };

            for (const portfolio of summary) {
                try {
                    const performance = await apiService.getPortfolioPerformance(portfolio.id);
                    combinedPerformance.totalInvested += performance.totalInvested || 0;
                    combinedPerformance.totalSold += performance.totalSold || 0;
                    combinedPerformance.currentValue += performance.currentValue || 0;
                    combinedPerformance.totalGainLoss += performance.totalGainLoss || 0;
                } catch (err) {
                    console.warn(`Failed to load performance for portfolio ${portfolio.id}:`, err);
                }
            }

            const gainLossPercent = combinedPerformance.totalInvested > 0 ? 
                (combinedPerformance.totalGainLoss / combinedPerformance.totalInvested) * 100 : 0;

            setTotalStats({
                totalValue: totals.totalValue,
                totalCapital: totals.totalCapital,
                totalGainLoss: combinedPerformance.totalGainLoss,
                totalGainLossPercent: gainLossPercent
            });

            // Get orders from all portfolios to calculate stats
            let allOrders = [];
            for (const portfolio of summary) {
                try {
                    const orders = await apiService.getTradingHistory(portfolio.id);
                    allOrders = [...allOrders, ...orders];
                } catch (err) {
                    console.warn(`Failed to load orders for portfolio ${portfolio.id}:`, err);
                }
            }

            const pendingOrders = allOrders.filter(order => order.status_code === 0).length;
            const filledOrders = allOrders.filter(order => order.status_code === 1).length;

            setStats({
                totalPortfolios: summary.length,
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const formatPercent = (value) => {
        return `${(value || 0).toFixed(2)}%`;
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Portfolio Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your investment portfolios and track your trading activity</p>
            </div>

            {error && (
                <Card className="p-4 mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex items-center text-red-700 dark:text-red-300">
                        <div className="text-sm">
                            <strong>Error loading dashboard:</strong> {error}
                        </div>
                    </div>
                </Card>
            )}

            {/* Portfolio Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <DollarSign className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalStats.totalValue)}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Target className="text-green-600 dark:text-green-400 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Capital</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalStats.totalCapital)}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${totalStats.totalGainLoss >= 0 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <TrendingUp className={`w-6 h-6 ${totalStats.totalGainLoss >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'}`} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gain/Loss</p>
                            <p className={`text-2xl font-bold ${totalStats.totalGainLoss >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(totalStats.totalGainLoss)}
                            </p>
                            <p className={`text-sm ${totalStats.totalGainLoss >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'}`}>
                                {formatPercent(totalStats.totalGainLossPercent)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                            <Briefcase className="text-primary-600 dark:text-primary-400 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Portfolios</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPortfolios}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Order Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Activity className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalOrders}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <Clock className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingOrders}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <CheckCircle className="text-green-600 dark:text-green-400 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filled Orders</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.filledOrders}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Portfolio Summary */}
            {portfolioSummary.length > 0 && (
                <Card className="p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Portfolio Summary</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Portfolio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Holdings Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Available Capital
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Total Capital
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Holdings Count
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {portfolioSummary.map((portfolio) => (
                                    <tr key={portfolio.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {portfolio.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                ID: {portfolio.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {formatCurrency(portfolio.totalValue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {formatCurrency(portfolio.availableCapital)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {formatCurrency(portfolio.totalCapital)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {portfolio.holdingsCount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link to="/place-order" className="block">
                        <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer group">
                            <Plus className="text-primary-600 dark:text-primary-400 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Place New Order</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Buy or sell stocks in your portfolios</p>
                        </div>
                    </Link>

                    <Link to="/portfolios" className="block">
                        <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer group">
                            <PieChart className="text-primary-600 dark:text-primary-400 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">View Portfolios</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Manage and track your portfolios</p>
                        </div>
                    </Link>

                    <Link to="/order-status" className="block">
                        <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer group">
                            <Search className="text-primary-600 dark:text-primary-400 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Check Order Status</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Track your order progress</p>
                        </div>
                    </Link>

                    <Link to="/manage-orders" className="block">
                        <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer group">
                            <Settings className="text-primary-600 dark:text-primary-400 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Manage Orders</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">View and update all orders</p>
                        </div>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;