import React from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import Card from '../ui/Card';

const HoldingsAllocation = ({ holdingsAllocation, loading }) => {
    if (loading) {
        return (
            <Card className="p-6">
                
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Holdings Allocation</h3>
                </div>
                <div className="animate-pulse space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Holdings Allocation</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            {!holdingsAllocation || holdingsAllocation.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No holdings found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {holdingsAllocation.map((holding, index) => {
                        const percentage = holding.percentage || 0;
                        const currentValue = holding.value || 0;
                        // For gain/loss calculation, we'd need cost basis which isn't provided
                        // Using a simple approximation for now
                        const avgPrice = currentValue / (holding.quantity || 1);
                        const gainLoss = 0; // Would need cost basis to calculate properly
                        const isPositive = gainLoss >= 0;
                        
                        return (
                            <div key={`${holding.stockSymbol}-${index}`} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {holding.stockSymbol}
                                            </h4>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>{holding.quantity} shares</span>
                                            <span>{holding.stockName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Price: ${(holding.currentPrice || 0).toFixed(2)}</span>
                                    <span>Value: ${(holding.value || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

export default HoldingsAllocation;