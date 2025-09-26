import React from 'react'
import StatCard from '../ui/StatCard';
import { DollarSign, Target, TrendingUp, Briefcase } from 'lucide-react';


export default function PortfolioPerformanceStats({ stats, totalStats, loading }) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={DollarSign}
                    title="Total Portfolio Value"
                    value={formatCurrency(totalStats.totalValue)}
                    iconColor="blue"
                />

                <StatCard 
                    icon={Target}
                    title="Total Capital"
                    value={formatCurrency(totalStats.totalCapital)}
                    iconColor="green"
                />

                <StatCard 
                    icon={TrendingUp}
                    title="Total Gain/Loss"
                    value={formatCurrency(totalStats.totalGainLoss)}
                    subtitle={formatPercent(totalStats.totalGainLossPercent)}
                    gainLossValue={totalStats.totalGainLoss}
                />

                <StatCard 
                    icon={Briefcase}
                    title="Total Portfolios"
                    value={stats.totalPortfolios}
                    iconColor="primary"
                />
            </div>
  )
}
