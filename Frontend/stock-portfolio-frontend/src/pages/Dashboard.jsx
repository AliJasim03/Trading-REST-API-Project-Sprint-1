import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Activity, Clock, CheckCircle, Plus, PieChart, Search, Settings, TrendingUp, DollarSign, Target } from 'lucide-react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Tooltip from '../components/ui/Tooltip';
import apiService from '../services/apiService';
import Loading from '../components/ui/Loading';
import OrderPerformanceStats from '../components/dashboard/OrderPerformanceStats';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import PortfolioPerformanceStats from '../components/dashboard/PortfolioPerformanceStats';
import QuickActions from '../components/ui/QuickActions';

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

            const pendingOrders = allOrders.filter(order => order.status_code === 1).length;
            const filledOrders = allOrders.filter(order => order.status_code === 2).length;

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

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Loading size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Portfolio Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your investment portfolios and track your trading activity</p>
                </div>
                
                {/* Quick Actions - Icon Buttons with Tooltips */}
                <QuickActions />
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
            <PortfolioPerformanceStats stats={stats} totalStats={totalStats} loading={loading} />

            {/* Order Stats Grid */}
            <OrderPerformanceStats stats={stats} loading={loading} />

            {/* Portfolio Summary */}
            {portfolioSummary.length > 0 && (
                <PortfolioSummary portfolioSummary={portfolioSummary} />
            )}
        </div>
    );
};

export default Dashboard;