import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../ui/Card';

const PortfolioAllocationChart = ({ portfolioSummary = [] }) => {
    // Early return if no data
    if (!portfolioSummary || portfolioSummary.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Portfolio Allocation
                </h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No portfolio data available
                </div>
            </Card>
        );
    }

    // Prepare data for the pie chart
    const chartData = portfolioSummary.map((portfolio, index) => ({
        name: portfolio?.name || 'Unnamed Portfolio',
        value: portfolio?.totalValue || 0,
        percentage: 0, // Will be calculated
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate distinct colors
    }));

    // Calculate percentages
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
        item.percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Value: {formatCurrency(data.value)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Share: {data.percentage}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        return (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center text-sm">
                        <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-gray-700 dark:text-gray-300 truncate">
                            {entry.value} ({chartData[index]?.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Portfolio Allocation
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <CustomLegend payload={chartData.map(item => ({ value: item.name, color: item.color }))} />
        </Card>
    );
};

export default PortfolioAllocationChart;