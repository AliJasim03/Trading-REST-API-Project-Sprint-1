import React, { useState, useEffect } from 'react';
import { Send, RotateCcw, CheckCircle, X } from 'lucide-react';
import Dialog from './Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Loading from '../ui/Loading';
import apiService from '../../services/apiService';
import { useNotificationContext } from '../../context/NotificationContext';
import { toast } from 'react-toastify';

const PlaceOrderDialog = ({ isOpen, onClose }) => {
    const [portfolios, setPortfolios] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [orderData, setOrderData] = useState({
        portfolioId: '',
        stockId: '',
        price: '',
        volume: '',
        buyOrSell: 'BUY',
        orderType: 'Market',
        fees: '2.00'
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const { addOrderPlaced } = useNotificationContext();

    // Load portfolios & stocks when dialog opens
    useEffect(() => {
        if (isOpen && portfolios.length === 0) loadInitialData();
    }, [isOpen, portfolios.length]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) resetForm();
    }, [isOpen]);

    // Fetch holdings whenever a portfolio is selected
    useEffect(() => {
        if (orderData.portfolioId) {
            // Use dashboard API which includes holdings data
            apiService.getPortfolioDashboard(orderData.portfolioId)
                .then(dashboardData => {
                    const raw = dashboardData?.holdings || [];
                    // Normalize to { stockId, quantity }
                    const simplified = (raw || []).map(h => {
                        const stockId = Number(
                            h?.stockId ?? h?.stock_id ?? h?.id ?? h?.stock?.stockId
                        );
                        const quantity = Number(h?.quantity ?? h?.availableQuantity ?? h?.volume ?? 0);
                        return stockId ? { stockId, quantity } : null;
                    }).filter(Boolean);

                    setHoldings(simplified);

                    // If in SELL and current stock is not sellable, clear selection
                    if (orderData.buyOrSell === 'SELL' && orderData.stockId) {
                        const selectedId = Number(orderData.stockId);
                        const canSell = simplified.some(h => h.stockId === selectedId && h.quantity > 0);
                        if (!canSell) {
                            setOrderData(prev => ({ ...prev, stockId: '' }));
                        }
                    }
                })
                .catch(err => console.error('Failed to fetch portfolio dashboard:', err));
        } else {
            setHoldings([]);
        }
    }, [orderData.portfolioId, orderData.buyOrSell]);

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
        } catch (err) {
            console.error('Failed to load initial data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Helper to get the quantity of a stock in the portfolio
    const getHoldingQuantity = (stockId) => {
        const sid = Number(stockId);
        const holding = holdings.find(h => h.stockId === sid);
        return holding ? Number(holding.quantity) : 0;
    };

    const validateForm = () => {
        const errors = {};

        if (!orderData.portfolioId) errors.portfolioId = 'Please select a portfolio';
        if (!orderData.stockId) errors.stockId = 'Please select a stock';
        if (!orderData.price || parseFloat(orderData.price) <= 0) errors.price = 'Please enter a valid price greater than 0';
        if (!orderData.volume || parseInt(orderData.volume) <= 0) errors.volume = 'Please enter a valid volume greater than 0';
        if (!orderData.fees || parseFloat(orderData.fees) < 0) errors.fees = 'Fees must be 0 or greater';

        // SELL-specific validation
        if (orderData.buyOrSell === "SELL") {
            const available = getHoldingQuantity(orderData.stockId);
            if (available === 0) {
                errors.volume = 'You do not own this stock in this portfolio.';
            } else if (parseInt(orderData.volume) > available) {
                errors.volume = `Insufficient shares. You own only ${available}.`;
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const orderPayload = {
                price: parseFloat(orderData.price),
                volume: parseInt(orderData.volume),
                buy_or_sell: orderData.buyOrSell,
                order_type: orderData.orderType,
                fees: parseFloat(orderData.fees)
            };

            const result = await apiService.placeOrder(
                parseInt(orderData.portfolioId),
                parseInt(orderData.stockId),
                orderPayload
            );

            const selectedStock = stocks.find(s => s.stockId === parseInt(orderData.stockId));
            const stockTicker = selectedStock?.stockTicker || 'Unknown';

            addOrderPlaced(
                stockTicker,
                orderData.orderType,
                orderData.buyOrSell,
                parseInt(orderData.volume),
                parseFloat(orderData.price)
            );

            setSuccess(`Order placed successfully! Order ID: ${result.orderId}`);
            toast.success(`${orderData.buyOrSell} order for ${stockTicker} placed successfully!`);

            setTimeout(() => {
                resetForm();
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Failed to place order:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setOrderData({
            portfolioId: '',
            stockId: '',
            price: '',
            volume: '',
            buyOrSell: 'BUY',
            orderType: 'Market',
            fees: '2.00'
        });
        setValidationErrors({});
        setError(null);
        setSuccess(null);
        setHoldings([]);
    };

    if (loading && portfolios.length === 0) {
        return (
            <Dialog isOpen={isOpen} onClose={onClose} title="Place New Order" size="lg">
                <div className="p-6 text-center">
                    <Loading size="lg" text="Loading portfolios and stocks..." />
                </div>
            </Dialog>
        );
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Place New Order" size="lg" closeOnOverlayClick={!submitting}>
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center text-red-700 dark:text-red-300">
                            <X className="h-5 w-5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium">Error</h3>
                                <div className="mt-1 text-sm">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center text-green-700 dark:text-green-300">
                            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium">Order placed successfully!</h3>
                                <div className="mt-1 text-sm">{success}</div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Portfolio *"
                            name="portfolioId"
                            value={orderData.portfolioId}
                            onChange={handleInputChange}
                            error={validationErrors.portfolioId}
                            required
                        >
                            <option value="">Select Portfolio</option>
                            {portfolios.map(p => (
                                <option key={p.portfolioId} value={p.portfolioId}>{p.portfolioName}</option>
                            ))}
                        </Select>

                        <Select
                            label="Stock *"
                            name="stockId"
                            value={orderData.stockId}
                            onChange={handleInputChange}
                            error={validationErrors.stockId}
                            required
                        >
                            <option value="">Select Stock</option>
                            {stocks.map(stock => {
                                const holdingQty = getHoldingQuantity(stock.stockId);
                                const canSell = holdingQty > 0;
                                const isDisabled = orderData.buyOrSell === "SELL" && !canSell;
                                
                                return (
                                    <option 
                                        key={stock.stockId} 
                                        value={stock.stockId}
                                        disabled={isDisabled}
                                        style={isDisabled ? { color: '#9CA3AF', fontStyle: 'italic' } : {}}
                                    >
                                        {stock.stockTicker} - {stock.stockName}
                                        {orderData.buyOrSell === "SELL" ? 
                                            (canSell ? ` (${holdingQty} available)` : ' (Not owned)') : 
                                            ''
                                        }
                                    </option>
                                );
                            })}
                        </Select>

                        <Select label="Order Type *" name="buyOrSell" value={orderData.buyOrSell} onChange={handleInputChange}>
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </Select>

                        <Select label="Order Method *" name="orderType" value={orderData.orderType} onChange={handleInputChange}>
                            <option value="Market">Market Order</option>
                            <option value="Limit">Limit Order</option>
                            <option value="Stop">Stop Order</option>
                        </Select>

                        <Input
                            label="Price per Share *"
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            value={orderData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            error={validationErrors.price}
                            required
                        />

                        <div className="space-y-2">
                            <Input
                                label={
                                    orderData.buyOrSell === 'SELL' && orderData.stockId ? 
                                    `Volume (Number of Shares) * - Max: ${getHoldingQuantity(orderData.stockId)}` :
                                    "Volume (Number of Shares) *"
                                }
                                type="number"
                                min="1"
                                max={orderData.buyOrSell === 'SELL' && orderData.stockId ? getHoldingQuantity(orderData.stockId) : undefined}
                                name="volume"
                                value={orderData.volume}
                                onChange={handleInputChange}
                                placeholder={orderData.buyOrSell === 'SELL' && orderData.stockId ? 
                                    `Max: ${getHoldingQuantity(orderData.stockId)}` : "0"
                                }
                                error={validationErrors.volume}
                                required
                            />
                            
                            {/* Quick-fill buttons for SELL orders */}
                            {orderData.buyOrSell === 'SELL' && orderData.stockId && getHoldingQuantity(orderData.stockId) > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setOrderData(prev => ({ ...prev, volume: Math.floor(getHoldingQuantity(orderData.stockId) * 0.25).toString() }))}
                                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                    >
                                        25%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrderData(prev => ({ ...prev, volume: Math.floor(getHoldingQuantity(orderData.stockId) * 0.5).toString() }))}
                                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                    >
                                        50%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrderData(prev => ({ ...prev, volume: Math.floor(getHoldingQuantity(orderData.stockId) * 0.75).toString() }))}
                                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                    >
                                        75%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrderData(prev => ({ ...prev, volume: getHoldingQuantity(orderData.stockId).toString() }))}
                                        className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded"
                                    >
                                        All
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Holdings Summary for SELL orders */}
                    {orderData.buyOrSell === 'SELL' && orderData.portfolioId && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                Your Holdings in This Portfolio
                            </h4>
                            {holdings.length === 0 ? (
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    No holdings found in this portfolio. You need to own stocks before you can sell them.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {holdings.map(holding => {
                                        const stock = stocks.find(s => s.stockId === holding.stockId);
                                        return (
                                            <div key={holding.stockId} className="text-sm text-blue-700 dark:text-blue-300 flex justify-between bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                                <span>{stock?.stockTicker || 'Unknown'}</span>
                                                <span className="font-medium">{holding.quantity} shares</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <Input
                        label="Transaction Fees"
                        type="number"
                        step="0.01"
                        min="0"
                        name="fees"
                        value={orderData.fees}
                        onChange={handleInputChange}
                        placeholder="2.00"
                        error={validationErrors.fees}
                        className="md:w-1/2"
                        disabled
                    />

                    {/* Order Summary */}
                    {orderData.price && orderData.volume && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Order Summary</h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${(parseFloat(orderData.price || 0) * parseInt(orderData.volume || 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Fees:</span>
                                    <span>${parseFloat(orderData.fees || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-gray-900 dark:text-gray-100 pt-1 border-t border-gray-200 dark:border-gray-600">
                                    <span>Total:</span>
                                    <span>${(parseFloat(orderData.price || 0) * parseInt(orderData.volume || 0) + parseFloat(orderData.fees || 0)).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button type="button" variant="outline" onClick={resetForm} disabled={submitting} className="flex items-center">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>

                        <div className="flex space-x-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting} className="flex items-center">
                                {submitting ? (
                                    <Loading size="sm" className="mr-2" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                {submitting ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Dialog>
    );
};

export default PlaceOrderDialog;
