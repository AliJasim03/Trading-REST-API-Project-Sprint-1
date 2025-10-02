import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Plus, X, Star, Activity, DollarSign } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import apiService from '../services/apiService';
import QuickActions from '../components/ui/QuickActions';

const LivePrices = () => {
    const [watchedStocks, setWatchedStocks] = useState([]);
    const [allStocks, setAllStocks] = useState([]); // Store all stocks from DB
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);
    const [newSymbol, setNewSymbol] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedStock, setSelectedStock] = useState(null);
    const [priceHistory, setPriceHistory] = useState({});
    const [showGainers, setShowGainers] = useState(true); // Toggle between gainers and losers
    const [isAdding, setIsAdding] = useState(false); // Loading state for adding stocks
    const [addError, setAddError] = useState(''); // Specific error for adding stocks
    const [suggestions, setSuggestions] = useState([]); // Stock suggestions from API
    const [showSuggestions, setShowSuggestions] = useState(false); // Show/hide dropdown
    const [loadingSuggestions, setLoadingSuggestions] = useState(false); // Loading state for suggestions

    // Load all stocks from database on component mount
    useEffect(() => {
        loadAllStocks();
    }, []);

    useEffect(() => {
        fetchAllStockData();
        if (autoRefresh) {
            const interval = setInterval(fetchAllStockData, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [watchedStocks, autoRefresh]);

    const loadAllStocks = async () => {
        try {
            const stocks = await apiService.getAllStocks();
            setAllStocks(stocks);
            // Initialize with all stocks from database
            const symbols = stocks.map(stock => stock.stockTicker);
            setWatchedStocks(symbols);
        } catch (err) {
            console.error('Failed to load stocks:', err);
            setError(`Failed to load stocks: ${err.message}`);
            // Fallback to hardcoded stocks if database fails
            setWatchedStocks(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']);
        }
    };

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

    // Search for stock suggestions from Finnhub API
    const searchStockSuggestions = async (query) => {
        if (!query || query.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setLoadingSuggestions(true);
        try {
            // Use the symbol lookup endpoint from your backend
            const response = await apiService.searchStockSuggestions(query);
            setSuggestions(response.slice(0, 8)); // Limit to 8 suggestions
            setShowSuggestions(true);
        } catch (err) {
            console.error('Failed to fetch suggestions:', err);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Handle input change with debounced suggestions
    const handleInputChange = (value) => {
        setNewSymbol(value.toUpperCase());
        setAddError('');
        
        // Debounce the API call
        clearTimeout(window.suggestionTimeout);
        window.suggestionTimeout = setTimeout(() => {
            searchStockSuggestions(value);
        }, 300); // 300ms debounce
    };

    // Select a suggestion
    const selectSuggestion = (stock) => {
        setNewSymbol(stock.symbol);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const addStock = async () => {
        const symbol = newSymbol.toUpperCase().trim();
        
        // Clear previous errors
        setAddError('');
        
        // Validation
        if (!symbol) {
            setAddError('Please enter a stock symbol');
            return;
        }
        
        if (symbol.length > 5) {
            setAddError('Stock symbol should be 5 characters or less');
            return;
        }
        
        if (!/^[A-Z]+$/.test(symbol)) {
            setAddError('Stock symbol should only contain letters');
            return;
        }
        
        if (watchedStocks.includes(symbol)) {
            setAddError(`${symbol} is already added`);
            return;
        }

        setIsAdding(true);
        
        try {
            // Check if the symbol already exists in database
            const existingStock = allStocks.find(stock => stock.stockTicker === symbol);
            
            if (!existingStock) {
                // First verify the symbol exists by trying to get its price
                await apiService.getLivePriceBySymbol(symbol);
                
                // Add to database if symbol is valid
                const stockToAdd = {
                    stockTicker: symbol,
                    stockName: symbol // You might want to fetch the full name from API later
                };
                await apiService.addStockToDatabase(stockToAdd);
                
                // Reload all stocks to include the new one
                await loadAllStocks();
            } else {
                // If it exists in database but not in current watchlist, just add to watchlist
                setWatchedStocks(prev => [...prev, symbol]);
                fetchStockData(symbol);
            }
            setNewSymbol('');
            setAddError('');
        } catch (err) {
            console.error('Failed to add stock:', err);
            if (err.message.includes('404') || err.message.includes('not found')) {
                setAddError(`Stock symbol "${symbol}" not found. Please check the symbol and try again.`);
            } else {
                setAddError(`Failed to add ${symbol}: ${err.message}`);
            }
        } finally {
            setIsAdding(false);
        }
    };

    const removeStock = async (symbol) => {
        try {
            // Remove from local watchlist immediately for better UX
            setWatchedStocks(prev => prev.filter(s => s !== symbol));
            setStockData(prev => {
                const newData = { ...prev };
                delete newData[symbol];
                return newData;
            });

            // Optionally remove from database (uncomment if you want to delete from DB)
            // await apiService.deleteStock(symbol);
            // await loadAllStocks();
        } catch (err) {
            console.error('Failed to remove stock:', err);
            setError(`Failed to remove stock: ${err.message}`);
        }
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
            {/* <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Live Market Data
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Real-time stock prices powered by Finnhub API
                </p>
            </div> */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Live Market Data</h1>
                    <p className="text-gray-600 dark:text-gray-400">Real-time stock prices powered by Finnhub API</p>
                </div>
                
                {/* Quick Actions - Icon Buttons with Tooltips */}
                <QuickActions />
            </div>

            {/* Controls */}
            <Card className="p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 w-full sm:w-auto relative">
                        <div className="flex gap-2 mb-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newSymbol}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addStock();
                                        }
                                    }}
                                    onFocus={() => {
                                        if (newSymbol && suggestions.length > 0) {
                                            setShowSuggestions(true);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Delay hiding suggestions to allow clicking
                                        setTimeout(() => setShowSuggestions(false), 200);
                                    }}
                                    placeholder="Search stocks by symbol or name (e.g., AAPL, Apple)"
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
                                        addError 
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    disabled={isAdding}
                                    maxLength={50}
                                />
                                {/* Clear button */}
                                {newSymbol && !isAdding && (
                                    <button
                                        onClick={() => {
                                            setNewSymbol('');
                                            setAddError('');
                                            setShowSuggestions(false);
                                            setSuggestions([]);
                                        }}
                                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                {/* Loading spinner */}
                                {isAdding && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                            </div>
                            <Button 
                                onClick={addStock} 
                                className="flex items-center gap-2 px-4"
                                disabled={isAdding || !newSymbol.trim()}
                            >
                                {isAdding ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        
                                    </>
                                )}
                            </Button>
                            <div className="flex space-x-2 ml-2">
                                <Button
                                onClick={fetchAllStockData}
                                variant="outline"
                                className="flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    
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
                        
                        {/* Error Message */}
                        {addError && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {addError}
                            </div>
                        )}
                        
                        {/* Helper Text */}
                        {!addError && !showSuggestions && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Enter a stock symbol or company name to search
                            </p>
                        )}

                        {/* Suggestions Dropdown */}
                        {showSuggestions && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {loadingSuggestions ? (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                        Searching...
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((stock, index) => (
                                        <button
                                            key={index}
                                            onClick={() => selectSuggestion(stock)}
                                            className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors"
                                            disabled={watchedStocks.includes(stock.symbol)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {stock.symbol}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                        {stock.description}
                                                    </p>
                                                </div>
                                                {watchedStocks.includes(stock.symbol) && (
                                                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded ml-2">
                                                        Added
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        No stocks found for "{newSymbol}"
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    
                       
                    
                </div>
            </Card>

            {/* Market Movers */}
            <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        {showGainers ? (
                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        ) : (
                            <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                        )}
                        Market Movers - {showGainers ? 'Top Gainers' : 'Top Losers'}
                    </h3>
                    
                    {/* Toggle Button */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setShowGainers(true)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                showGainers
                                    ? 'bg-green-500 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4 inline mr-1" />
                            Gainers
                        </button>
                        <button
                            onClick={() => setShowGainers(false)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                !showGainers
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <TrendingDown className="w-4 h-4 inline mr-1" />
                            Losers
                        </button>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {showGainers ? (
                        // Top Gainers
                        gainers.length > 0 ? gainers.map((stock) => (
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
                        )
                    ) : (
                        // Top Losers
                        losers.length > 0 ? losers.map((stock) => (
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
                        )
                    )}
                </div>
            </Card>

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
                                        {allStocks.find(stock => stock.stockTicker === symbol) && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                <p className="font-medium">{allStocks.find(stock => stock.stockTicker === symbol)?.stockName}</p>
                                                {allStocks.find(stock => stock.stockTicker === symbol)?.sector && (
                                                    <p className="text-xs">{allStocks.find(stock => stock.stockTicker === symbol)?.sector}</p>
                                                )}
                                            </div>
                                        )}
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
                        No stocks available
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