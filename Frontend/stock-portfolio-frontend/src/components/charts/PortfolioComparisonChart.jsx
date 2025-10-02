import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../ui/Card';

const PortfolioComparisonChart = ({ portfolioSummary = [] }) => {
    // Early return if no data
    if (!portfolioSummary || portfolioSummary.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Portfolio Comparison
                </h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No portfolio data available
                </div>
            </Card>
        );
    }

    // Prepare data for comparison chart
    const chartData = portfolioSummary.map(portfolio => {
        const portfolioName = portfolio?.name || 'Unnamed Portfolio';
        return {
            name: portfolioName.length > 15 
                ? portfolioName.substring(0, 15) + '...' 
                : portfolioName,
            fullName: portfolioName,
            totalValue: portfolio?.totalValue || 0,
            totalCapital: portfolio?.totalCapital || 0,
            availableCapital: portfolio?.availableCapital || 0,
            gainLoss: (portfolio?.totalValue || 0) - (portfolio?.totalCapital || 0),
            gainLossPercent: (portfolio?.totalCapital || 0) > 0 ? 
                (((portfolio?.totalValue || 0) - (portfolio?.totalCapital || 0)) / (portfolio?.totalCapital || 0)) * 100 : 0
        };
    });

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
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.fullName}</p>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(data.totalValue)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Capital:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(data.totalCapital)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Available:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(data.availableCapital)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-1">
                            <span className="text-gray-600 dark:text-gray-400">Gain/Loss:</span>
                            <span className={`font-medium ${
                                data.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                                {formatCurrency(data.gainLoss)} ({formatPercent(data.gainLossPercent)})
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Portfolio Comparison
            </h3>
            
            <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer>
                    <BarChart 
                        data={chartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                            dataKey="name" 
                            className="text-xs text-gray-600 dark:text-gray-400"
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis 
                            className="text-xs text-gray-600 dark:text-gray-400"
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                            dataKey="totalValue" 
                            name="Total Value"
                            fill="#3b82f6" 
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar 
                            dataKey="totalCapital" 
                            name="Total Capital"
                            fill="#10b981" 
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar 
                            dataKey="availableCapital" 
                            name="Available Capital"
                            fill="#f59e0b" 
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Compare portfolio values, invested capital, and available funds across all portfolios
            </div>
        </Card>
    );
};

export default PortfolioComparisonChart;