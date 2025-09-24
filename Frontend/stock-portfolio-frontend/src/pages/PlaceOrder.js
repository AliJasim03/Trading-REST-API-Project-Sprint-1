import React, { useState, useEffect } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Loading from '../components/ui/Loading';
import apiService from '../services/apiService';

const PlaceOrder = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [orderData, setOrderData] = useState({
        portfolioId: '',
        stockId: '',
        price: '',
        volume: '',
        buyOrSell: 'BUY',
        orderType: 'Market',
        fees: '9.99'
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        loadInitialData();
    }, []);

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
        setOrderData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!orderData.portfolioId) {
            errors.portfolioId = 'Please select a portfolio';
        }
        if (!orderData.stockId) {
            errors.stockId = 'Please select a stock';
        }
        if (!orderData.price || parseFloat(orderData.price) <= 0) {
            errors.price = 'Please enter a valid price greater than 0';
        }
        if (!orderData.volume || parseInt(orderData.volume) <= 0) {
            errors.volume = 'Please enter a valid volume greater than 0';
        }
        if (!orderData.fees || parseFloat(orderData.fees) < 0) {
            errors.fees = 'Fees must be 0 or greater';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

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

            setSuccess(`Order placed successfully! Order ID: ${result.orderId}`);

            // Reset form
            setOrderData({
                portfolioId: '',
                stockId: '',
                price: '',
                volume: '',
                buyOrSell: 'BUY',
                orderType: 'Market',
                fees: '9.99'
            });
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
            fees: '9.99'
        });
        setValidationErrors({});
        setError(null);
        setSuccess(null);
    };

    const calculateOrderValue = () => {
        const price = parseFloat(orderData.price) || 0;
        const volume = parseInt(orderData.volume) || 0;
        const fees = parseFloat(orderData.fees) || 0;

        return {
            orderValue: price * volume,
            totalCost: (price * volume) + fees
        };
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Loading size="lg" text="Loading order form..." />
            </div>
        );
    }

    const { orderValue, totalCost } = calculateOrderValue();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Place New Order</h1>
                <p className="text-gray-600">Buy or sell stocks in your portfolios</p>
            </div>

            <Card className="p-6">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium">Error placing order</h3>
                                <div className="mt-1 text-sm">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium">Order placed successfully!</h3>
                                <div className="mt-1 text-sm">{success}</div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Portfolio *"
                            name="portfolioId"
                            value={orderData.portfolioId}
                            onChange={handleInputChange}
                            error={validationErrors.portfolioId}
                            required
                        >
                            <option value="">Select Portfolio</option>
                            {portfolios.map(portfolio => (
                                <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
                                    {portfolio.portfolioName}
                                </option>
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
                            {stocks.map(stock => (
                                <option key={stock.stockId} value={stock.stockId}>
                                    {stock.stockTicker} - {stock.stockName}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Order Type *"
                            name="buyOrSell"
                            value={orderData.buyOrSell}
                            onChange={handleInputChange}
                        >
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </Select>

                        <Select
                            label="Order Method *"
                            name="orderType"
                            value={orderData.orderType}
                            onChange={handleInputChange}
                        >
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

                        <Input
                            label="Volume (Number of Shares) *"
                            type="number"
                            min="1"
                            name="volume"
                            value={orderData.volume}
                            onChange={handleInputChange}
                            placeholder="0"
                            error={validationErrors.volume}
                            required
                        />

                        <Input
                            label="Transaction Fees"
                            type="number"
                            step="0.01"
                            min="0"
                            name="fees"
                            value={orderData.fees}
                            onChange={handleInputChange}
                            placeholder="9.99"
                            error={validationErrors.fees}
                        />
                    </div>

                    {/* Order Summary */}
                    {orderData.price && orderData.volume && (
                        <Card className="p-4 bg-gray-50 border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Order Value:</span>
                                        <span className="font-medium">${orderValue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction Fees:</span>
                                        <span className="font-medium">${parseFloat(orderData.fees || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Shares:</span>
                                        <span className="font-medium">{orderData.volume} shares</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price per Share:</span>
                                        <span className="font-medium">${parseFloat(orderData.price || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-lg border-t pt-2 md:border-t-0 md:pt-0">
                                        <span className="font-semibold text-gray-900">Total Cost:</span>
                                        <span className="font-bold text-gray-900">${totalCost.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            loading={submitting}
                            size="lg"
                            className="flex-1 md:flex-none"
                        >
                            <Send className="w-5 h-5" />
                            Place Order
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            onClick={resetForm}
                            className="flex-1 md:flex-none"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset Form
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default PlaceOrder;