import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Card from '../ui/Card';

const PerformanceTrendChart = ({ totalStats = {}, portfolioSummary = [] }) => {
    // Provide default values for totalStats
    const safeTotalStats = {
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        ...totalStats
    };

    // Generate mock historical data for demonstration
    // In a real app, this would come from your backend
    const generateTrendData = () => {
        const data = [];
        const currentValue = safeTotalStats.totalValue;
        const currentGainLoss = safeTotalStats.totalGainLoss;
        
        // Generate 30 days of mock data
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Create some realistic variation
            const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
            const progressFactor = (30 - i) / 30; // Gradual progression to current values
            
            const dayValue = Math.max(0, currentValue * randomFactor * (0.7 + 0.3 * progressFactor));
            const dayGainLoss = currentGainLoss * progressFactor * randomFactor;
            
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: date.toISOString().split('T')[0],
                portfolioValue: Math.round(dayValue),
                gainLoss: Math.round(dayGainLoss),
                gainLossPercent: dayValue > 0 ? ((dayGainLoss / (dayValue - dayGainLoss)) * 100) : 0
            });
        }
        
        return data;
    };

    const trendData = generateTrendData();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatPercent = (value) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Portfolio Value: {formatCurrency(data.portfolioValue)}
                    </p>
                    <p className={`text-sm font-medium ${
                        data.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                        Gain/Loss: {formatCurrency(data.gainLoss)} ({formatPercent(data.gainLossPercent)})
                    </p>
                </div>
            );
        }
        return null;
    };

    const isPositiveOverall = safeTotalStats.totalGainLoss >= 0;

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Portfolio Performance Trend
                </h3>
                <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Current Total</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(safeTotalStats.totalValue)}
                    </div>
                    <div className={`text-sm font-medium ${
                        isPositiveOverall ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                        {formatPercent(safeTotalStats.totalGainLossPercent)}
                    </div>
                </div>
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                    <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                            dataKey="date" 
                            className="text-xs text-gray-600 dark:text-gray-400"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            className="text-xs text-gray-600 dark:text-gray-400"
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="portfolioValue"
                            stroke={isPositiveOverall ? "#10b981" : "#ef4444"}
                            fill={isPositiveOverall ? "#10b981" : "#ef4444"}
                            fillOpacity={0.1}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                * Historical data is simulated for demonstration purposes
            </div>
        </Card>
    );
};

export default PerformanceTrendChart;