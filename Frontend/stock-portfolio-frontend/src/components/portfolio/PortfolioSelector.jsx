import React from 'react';
import { Briefcase } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PortfolioSelector = ({ 
    portfolios, 
    selectedPortfolio, 
    onPortfolioSelect, 
    loading, 
    error,
    onRefresh 
}) => {
    if (loading) {
        return (
            <Card className="p-6 mb-8">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6 mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center justify-between">
                    <div className="text-red-700 dark:text-red-300">
                        <h3 className="text-sm font-medium">Error loading portfolios</h3>
                        <div className="mt-1 text-sm">{error}</div>
                    </div>
                    <Button onClick={onRefresh} variant="outline" size="sm">
                        Retry
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Select Portfolio</h2>
            
            {portfolios.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No portfolios found</h3>
                    <p className="text-sm">Create your first portfolio to get started.</p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 ${portfolios.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                    {portfolios.map((portfolio) => (
                        <button
                            key={portfolio.portfolioId}
                            onClick={() => onPortfolioSelect(portfolio)}
                            className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                                selectedPortfolio?.portfolioId === portfolio.portfolioId
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {portfolio.portfolioName || portfolio.name}
                                </h3>
                                <Briefcase className={`w-5 h-5 ${
                                    selectedPortfolio?.portfolioId === portfolio.portfolioId
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-gray-400 dark:text-gray-500'
                                }`} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {portfolio.portfolioId}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Capital: ${(portfolio.initialCapital || portfolio.capital)?.toFixed(2) || '0.00'}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default PortfolioSelector;