import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw, Activity, DollarSign, Eye, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import { livePrices } from '../services/apiService';
import QuickActions from '../components/ui/QuickActions';

const LivePrices = () => {
    const [popularStocks, setPopularStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [historicalData, setHistoricalData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [loadingChart, setLoadingChart] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('daily');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Auto-refresh interval
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                loadPopularStocks();
                if (selectedStock) {
                    loadHistoricalData(selectedStock.symbol);
                }
            }, 60000); // Refresh every minute
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, selectedStock]);

    useEffect(() => {
        loadPopularStocks();
    }, []);

    useEffect(() => {
        if (selectedStock) {
            loadHistoricalData(selectedStock.symbol);
        }
    }, [selectedStock, chartPeriod]);

    const loadPopularStocks = async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        if (!showRefreshing) setLoading(true);
        setError(null);

        try {
            const stocks = await livePrices.getPopularStocks();
            setPopularStocks(stocks.filter(stock => !stock.error));

            // Set first stock as selected if none selected
            if (!selectedStock && stocks.length > 0 && !stocks[0].error) {
                setSelectedStock(stocks[0]);
            }
        } catch (err) {
            console.error('Failed to load popular stocks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadHistoricalData = async (symbol) => {
        setLoadingChart(true);
        try {
            const data = await livePrices.getHistoricalData(symbol, chartPeriod);
            setHistoricalData(data);
        } catch (err) {
            console.error('Failed to load historical data:', err);
            setError(err.message);
        } finally {
            setLoadingChart(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const results = await livePrices.searchStocks(searchQuery);
            setSearchResults(results);
        } catch (err) {
            console.error('Search failed:', err);
            setError(err.message);
        } finally {
            setSearching(false);
        }
    };

    const handleStockSelect = (stock) => {
        setSelectedStock(stock);
        setSearchResults([]);
        setSearchQuery('');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    const formatPercent = (percent) => {
        const num = typeof percent === 'string' ? parseFloat(percent) : percent;
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    };

    const formatChartData = (data) => {
        if (!data || !data.data) return [];

        return data.data.slice(0, 100).reverse().map((item, index) => ({
            name: new Date(item.timestamp).toLocaleDateString(),
            price: parseFloat(item.close),
            volume: item.volume,
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            open: parseFloat(item.open)
        }));
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Loading />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Live Prices</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time stock market data and charts</p>
                </div>
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={() => loadPopularStocks(true)}
                        disabled={refreshing}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                autoRefresh ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    autoRefresh ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    <QuickActions />
                </div>
            </div>

            {error && (
                <Card className="mb-6 p-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </Card>
            )}

            {/* Search */}
            <Card className="mb-6 p-6">
                <div className="flex space-x-4">
                    <Input
                        type="text"
                        placeholder="Search stocks by symbol or company name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={searching}>
                        <Search className="w-4 h-4 mr-2" />
                        {searching ? 'Searching...' : 'Search'}
                    </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-4 max-h-60 overflow-y-auto">
                        {searchResults.map((stock, index) => (
                            <div
                                key={index}
                                onClick={() => handleStockSelect(stock)}
                                className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                            >
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{stock.symbol}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{stock.type}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{stock.region}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock List */}
                <div className="lg:col-span-1">
                    <Card className="p-6 h-full">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Popular Stocks
                        </h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {popularStocks.map((stock, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleStockSelect(stock)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                                        selectedStock?.symbol === stock.symbol
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {stock.symbol}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Vol: {stock.volume?.toLocaleString() || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(stock.price)}
                                            </div>
                                            <div className={`text-sm flex items-center ${
                                                parseFloat(stock.change) >= 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {parseFloat(stock.change) >= 0 ?
                                                    <TrendingUp className="w-3 h-3 mr-1" /> :
                                                    <TrendingDown className="w-3 h-3 mr-1" />
                                                }
                                                {formatPercent(stock.changePercent)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Chart Section */}
                <div className="lg:col-span-2">
                    {selectedStock ? (
                        <Card className="p-6 h-full">
                            {/* Stock Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {selectedStock.symbol}
                                    </h2>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {formatPrice(selectedStock.price)}
                                        </span>
                                        <div className={`flex items-center text-lg ${
                                            parseFloat(selectedStock.change) >= 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {parseFloat(selectedStock.change) >= 0 ?
                                                <TrendingUp className="w-5 h-5 mr-1" /> :
                                                <TrendingDown className="w-5 h-5 mr-1" />
                                            }
                                            {formatPrice(selectedStock.change)} ({formatPercent(selectedStock.changePercent)})
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Open</span>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(selectedStock.open)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">High</span>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(selectedStock.high)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Low</span>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(selectedStock.low)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Volume</span>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {selectedStock.volume?.toLocaleString() || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Period Selector */}
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant={chartPeriod === 'intraday' ? 'primary' : 'outline'}
                                        onClick={() => setChartPeriod('intraday')}
                                    >
                                        1D
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={chartPeriod === 'daily' ? 'primary' : 'outline'}
                                        onClick={() => setChartPeriod('daily')}
                                    >
                                        1M
                                    </Button>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="h-96">
                                {loadingChart ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loading />
                                    </div>
                                ) : historicalData && historicalData.data ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={formatChartData(historicalData)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#6b7280"
                                                fontSize={12}
                                            />
                                            <YAxis
                                                stroke="#6b7280"
                                                fontSize={12}
                                                domain={['dataMin - 5', 'dataMax + 5']}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                                formatter={(value, name) => [formatPrice(value), name === 'price' ? 'Price' : name]}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fill="rgba(59, 130, 246, 0.1)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                        No chart data available
                                    </div>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-6 h-full flex items-center justify-center">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Select a stock to view its chart</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LivePrices;