import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import StatusBadge from '../components/ui/StatusBadge';
import apiService from '../services/apiService';

const Portfolios = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [tradingHistory, setTradingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState(null);
    const [historyError, setHistoryError] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedPortfolio) {
            loadTradingHistory();
        }
    }, [selectedPortfolio]);

    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [portfoliosData, stocksData] = await Promise.all([
                apiService.getAllPortfolios(),
                apiService.getAllStocks()
            ]);

            setPortfolios(portfoliosData);
            setStocks(stocksData);

            // Select first portfolio by default
            if (portfoliosData.length > 0) {
                setSelectedPortfolio(portfoliosData[0]);
            }
        } catch (err) {
            console.error('Failed to load initial data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadTradingHistory = async () => {
        if (!selectedPortfolio) return;

        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const history = await apiService.getTradingHistory(selectedPortfolio.portfolioId);
            setTradingHistory(history);
        } catch (err) {
            console.error('Failed to load trading history:', err);
            setHistoryError(err.message);
        } finally {
            setHistoryLoading(false);
        }
    };

    const getStockInfo = (stockId) => {
        const stock = stocks.find(s => s.stockId === stockId);
        return stock ? `${stock.stockTicker} - ${stock.stockName}` : `Stock ID: ${stockId}`;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Loading size="lg" text="Loading portfolios..." />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Portfolio Management</h1>
                <p className="text-gray-600 dark:text-gray-400">View and manage your investment portfolios</p>
            </div>

            {error && (
                <Card className="p-4 mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex items-center text-red-700 dark:text-red-300">
                        <div className="text-sm">
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                </Card>
            )}

            {/* Portfolio Selector */}
            <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Select Portfolio</h2>
                {portfolios.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No portfolios found. Please check your backend connection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {portfolios.map(portfolio => (
                            <div
                                key={portfolio.portfolioId}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                    selectedPortfolio?.portfolioId === portfolio.portfolioId
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                                onClick={() => setSelectedPortfolio(portfolio)}
                            >
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{portfolio.portfolioName}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{portfolio.description}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                                    <p>Capital: ${portfolio.initialCapital?.toLocaleString() || '0'}</p>
                                    <p>Created: {new Date(portfolio.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Portfolio Details */}
            {selectedPortfolio && (
                <Card className="p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Portfolio Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedPortfolio.portfolioName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Description:</span>
                                    <span className="font-medium text-right text-gray-900 dark:text-gray-100">{selectedPortfolio.description}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Initial Capital:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">${selectedPortfolio.initialCapital?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(selectedPortfolio.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Trading Activity</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Orders:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{tradingHistory.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                                    <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {tradingHistory.filter(order => order.status_code === 0).length}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Filled:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                    {tradingHistory.filter(order => order.status_code === 1).length}
                  </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Stats</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Order Volume:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                    {tradingHistory.reduce((sum, order) => sum + (order.volume || 0), 0)} shares
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Fees:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${tradingHistory.reduce((sum, order) => sum + (order.fees || 0), 0).toFixed(2)}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Trading History */}
            {selectedPortfolio && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Trading History</h2>
                        <Button onClick={loadTradingHistory} loading={historyLoading} size="sm">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>

                    {historyError && (
                        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                            Error loading trading history: {historyError}
                        </div>
                    )}

                    {historyLoading ? (
                        <Loading text="Loading trading history..." />
                    ) : tradingHistory.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RefreshCw className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-lg font-medium mb-2">No trading history found</p>
                            <p className="text-sm">This portfolio doesn't have any orders yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-600">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Volume
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Fees
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {tradingHistory.map((order) => (
                                    <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            #{order.orderId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {getStockInfo(order.stock?.stockId)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.buy_or_sell === 'BUY'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {order.buy_or_sell}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            ${order.price?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {order.volume || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            ${((order.price || 0) * (order.volume || 0)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            ${order.fees?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={order.status_code} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default Portfolios;