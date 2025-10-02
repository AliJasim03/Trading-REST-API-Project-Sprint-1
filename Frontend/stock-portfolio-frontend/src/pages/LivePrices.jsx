import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Plus, X, Star, Activity, DollarSign } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import apiService from '../services/apiService';

const LivePrices = () => {
    const [watchedStocks, setWatchedStocks] = useState(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']);
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);
    const [newSymbol, setNewSymbol] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedStock, setSelectedStock] = useState(null);
    const [priceHistory, setPriceHistory] = useState({});

    useEffect(() => {
        fetchAllStockData();
        if (autoRefresh) {
            const interval = setInterval(fetchAllStockData, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [watchedStocks, autoRefresh]);

    const fetchAllStockData = async () => {
        for (const symbol of watchedStocks) {
            if (!loading[symbol]) {
                fetchStockData(symbol);
            }
        }
    };

    const fetchStockData = async (symbol) => {
        setLoading(prev => ({ ...prev, [symbol]: true }));
        setError(null);
        try {
            const data = await apiService.getLivePriceBySymbol(symbol);
            setStockData(prev => ({
                ...prev,
                [symbol]: data
            }));

            // Generate mock historical data for the chart
            generatePriceHistory(symbol, data);
        } catch (err) {
            console.error(`Failed to fetch price for ${symbol}:`, err);
            setError(`Failed to fetch ${symbol}: ${err.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [symbol]: false }));
        }
    };

    const generatePriceHistory = (symbol, currentData) => {
        // Generate 24 hours of mock historical data based on current price
        const history = [];
        const currentPrice = currentData.currentPrice;
        const volatility = currentData.percentChange || 0;

        for (let i = 23; i >= 0; i--) {
            const time = new Date();
            time.setHours(time.getHours() - i);
            const randomChange = (Math.random() - 0.5) * Math.abs(volatility) * 0.1;
            const price = currentPrice * (1 - (volatility / 100) * (i / 24) + randomChange);

            history.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                price: parseFloat(price.toFixed(2)),
                timestamp: time.getTime()
            });
        }

        setPriceHistory(prev => ({
            ...prev,
            [symbol]: history
        }));
    };

    const addStock = () => {
        const symbol = newSymbol.toUpperCase().trim();
        if (symbol && !watchedStocks.includes(symbol)) {
            setWatchedStocks(prev => [...prev, symbol]);
            setNewSymbol('');
            fetchStockData(symbol);
        }
    };

    const removeStock = (symbol) => {
        setWatchedStocks(prev => prev.filter(s => s !== symbol));
        setStockData(prev => {
            const newData = { ...prev };
            delete newData[symbol];
            return newData;
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const formatPercent = (value) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${(value || 0).toFixed(2)}%`;
    };

    const getMarketMovers = () => {
        const stocks = Object.entries(stockData).map(([symbol, data]) => ({
            symbol,
            ...data
        }));

        const gainers = stocks
            .filter(s => s.percentChange > 0)
            .sort((a, b) => b.percentChange - a.percentChange)
            .slice(0, 3);

        const losers = stocks
            .filter(s => s.percentChange < 0)
            .sort((a, b) => a.percentChange - b.percentChange)
            .slice(0, 3);

        return { gainers, losers };
    };

    const { gainers, losers } = getMarketMovers();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Live Market Data
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Real-time stock prices powered by Finnhub API
                </p>
            </div>

            {/* Controls */}
            <Card className="p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-2 flex-1 w-full sm:w-auto">
                        <input
                            type="text"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && addStock()}
                            placeholder="Add stock symbol (e.g., NVDA)"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <Button onClick={addStock} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={fetchAllStockData}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh All
                        </Button>

                        <Button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            variant={autoRefresh ? "primary" : "outline"}
                            className="flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4" />
                            Auto {autoRefresh ? 'ON' : 'OFF'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Market Movers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Top Gainers */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Top Gainers
                    </h3>
                    <div className="space-y-3">
                        {gainers.length > 0 ? gainers.map((stock) => (
                            <div key={stock.symbol} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{stock.symbol}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(stock.currentPrice)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-green-600 dark:text-green-400">{formatPercent(stock.percentChange)}</p>
                                    <p className="text-sm text-green-600 dark:text-green-400">+{formatCurrency(stock.change)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No gainers yet</p>
                        )}
                    </div>
                </Card>

                {/* Top Losers */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                        Top Losers
                    </h3>
                    <div className="space-y-3">
                        {losers.length > 0 ? losers.map((stock) => (
                            <div key={stock.symbol} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{stock.symbol}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(stock.currentPrice)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-red-600 dark:text-red-400">{formatPercent(stock.percentChange)}</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">{formatCurrency(stock.change)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No losers yet</p>
                        )}
                    </div>
                </Card>
            </div>

            {error && (
                <Card className="p-4 mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-red-800 dark:text-red-300">{error}</p>
                </Card>
            )}

            {/* Stock Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {watchedStocks.map((symbol) => {
                    const data = stockData[symbol];
                    const isPositive = data?.change >= 0;
                    const history = priceHistory[symbol] || [];

                    return (
                        <Card key={symbol} className="p-6 relative">
                            {/* Remove Button */}
                            <button
                                onClick={() => removeStock(symbol)}
                                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Remove stock"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>

                            {loading[symbol] && !data ? (
                                <div className="animate-pulse">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            ) : data ? (
                                <>
                                    {/* Header */}
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {symbol}
                                        </h3>
                                    </div>

                                    {/* Price Info */}
                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(data.currentPrice)}
                                            </p>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold ${
                                                isPositive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                                {isPositive ? (
                                                    <TrendingUp className="w-4 h-4" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4" />
                                                )}
                                                <span>{formatPercent(data.percentChange)}</span>
                                            </div>
                                        </div>
                                        <p className={`text-sm ${
                                            isPositive
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {data.change >= 0 ? '+' : ''}{formatCurrency(data.change)} today
                                        </p>
                                    </div>

                                    {/* Chart */}
                                    {history.length > 0 && (
                                        <div className="mb-4" style={{ height: '150px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={history}>
                                                    <defs>
                                                        <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop
                                                                offset="5%"
                                                                stopColor={isPositive ? '#10b981' : '#ef4444'}
                                                                stopOpacity={0.3}
                                                            />
                                                            <stop
                                                                offset="95%"
                                                                stopColor={isPositive ? '#10b981' : '#ef4444'}
                                                                stopOpacity={0}
                                                            />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                                    <XAxis
                                                        dataKey="time"
                                                        tick={{ fontSize: 10 }}
                                                        interval="preserveStartEnd"
                                                        stroke="#6b7280"
                                                    />
                                                    <YAxis
                                                        domain={['auto', 'auto']}
                                                        tick={{ fontSize: 10 }}
                                                        stroke="#6b7280"
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1f2937',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            color: '#fff'
                                                        }}
                                                        formatter={(value) => [formatCurrency(value), 'Price']}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="price"
                                                        stroke={isPositive ? '#10b981' : '#ef4444'}
                                                        strokeWidth={2}
                                                        fill={`url(#gradient-${symbol})`}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Open</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(data.open)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">High</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(data.high)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Low</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(data.low)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Prev Close</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(data.previousClose)}</p>
                                        </div>
                                    </div>

                                    {/* Last Updated */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Last updated: {new Date(data.timestamp * 1000).toLocaleString()}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">Failed to load data</p>
                                    <Button
                                        onClick={() => fetchStockData(symbol)}
                                        variant="outline"
                                        className="mt-4"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {watchedStocks.length === 0 && (
                <Card className="p-12 text-center">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No stocks in your watchlist
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add some stock symbols above to start tracking live prices
                    </p>
                </Card>
            )}
        </div>
    );
};

export default LivePrices;