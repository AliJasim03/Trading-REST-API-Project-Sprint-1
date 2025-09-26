import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';

const PortfolioAnalytics = ({ performance, loading }) => {
    if (loading) {
        return (
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!performance) {
        return null;
    }

    const gainLossColor = performance.totalGainLoss >= 0 ? 'green' : 'red';
    const returnColor = performance.gainLossPercent >= 0 ? 'green' : 'red';

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Current Value"
                    value={`$${performance.currentValue?.toFixed(2) || '0.00'}`}
                    icon={Activity}
                    iconColor="blue"
                />
                <StatCard
                    title="Total Invested"
                    value={`$${performance.totalInvested?.toFixed(2) || '0.00'}`}
                    icon={TrendingUp}
                    iconColor="purple"
                />
                <StatCard
                    title="Total Gain/Loss"
                    value={`$${performance.totalGainLoss?.toFixed(2) || '0.00'}`}
                    icon={performance.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
                    gainLossValue={performance.totalGainLoss}
                />
                <StatCard
                    title="Return %"
                    value={`${performance.gainLossPercent?.toFixed(2) || '0.00'}%`}
                    icon={performance.gainLossPercent >= 0 ? TrendingUp : TrendingDown}
                    gainLossValue={performance.gainLossPercent}
                />
            </div>
        </div>
    );
};

export default PortfolioAnalytics;