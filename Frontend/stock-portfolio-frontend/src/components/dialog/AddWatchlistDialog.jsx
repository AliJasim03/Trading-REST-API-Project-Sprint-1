import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, X, CheckCircle } from 'lucide-react';
import Dialog from './Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Loading from '../ui/Loading';
import apiService from '../../services/apiService';

const AddWatchlistDialog = ({ isOpen, onClose, onAddToWatchlist, selectedStock }) => {
    const [formData, setFormData] = useState({
        stockId: '',
        stockSymbol: '',
        stockName: '',
        targetPrice: '',
        alertDirection: 'ABOVE'
    });
    const [stocks, setStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Load stocks when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadStocks();
            resetForm();
        }
    }, [isOpen]);

    // Handle selected stock prop
    useEffect(() => {
        if (selectedStock && isOpen) {
            setFormData(prev => ({
                ...prev,
                stockId: selectedStock.stockId,
                stockSymbol: selectedStock.stockTicker,
                stockName: selectedStock.stockName
            }));
            setSearchQuery(selectedStock.stockTicker);
        }
    }, [selectedStock, isOpen]);

    const loadStocks = async () => {
        try {
            setLoading(true);
            const stockData = await apiService.getAllStocks();
            setStocks(stockData || []);
        } catch (err) {
            console.error('Failed to load stocks:', err);
            setError('Failed to load stocks');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            stockId: '',
            stockSymbol: '',
            stockName: '',
            targetPrice: '',
            alertDirection: 'ABOVE'
        });
        setSearchQuery('');
        setValidationErrors({});
        setError(null);
        setSuccess(null);
    };

    const handleStockSelect = (stock) => {
        setFormData(prev => ({
            ...prev,
            stockId: stock.stockId,
            stockSymbol: stock.stockTicker,
            stockName: stock.stockName
        }));
        setSearchQuery(stock.stockTicker);
        setValidationErrors(prev => ({ ...prev, stockId: '' }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
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

        if (!formData.stockId) {
            errors.stockId = 'Please select a stock';
        }

        if (!formData.targetPrice || parseFloat(formData.targetPrice) <= 0) {
            errors.targetPrice = 'Please enter a valid target price greater than 0';
        } else if (parseFloat(formData.targetPrice) > 10000) {
            errors.targetPrice = 'Target price cannot exceed $10,000';
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
            await onAddToWatchlist(
                formData.stockId,
                parseFloat(formData.targetPrice),
                formData.alertDirection
            );

            setSuccess(`Alert added for ${formData.stockSymbol}!`);

            // Close dialog after 1.5 seconds
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Failed to add watchlist entry:', err);
            setError(err.message || 'Failed to add to watchlist. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter stocks based on search query
    const filteredStocks = stocks.filter(stock =>
        stock.stockTicker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.stockName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Add Price Alert" 
            size="md"
            closeOnOverlayClick={!submitting}
        >
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
                                <h3 className="text-sm font-medium">Alert added successfully!</h3>
                                <div className="mt-1 text-sm">{success}</div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Stock Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {selectedStock ? 'Selected Stock' : 'Select Stock'} *
                        </label>
                        {selectedStock ? (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <div className="font-medium text-blue-900 dark:text-blue-100">
                                            {selectedStock.stockTicker}
                                        </div>
                                        <div className="text-sm text-blue-600 dark:text-blue-400">
                                            {selectedStock.stockName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for a stock (e.g., AAPL, Tesla)..."
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                                            validationErrors.stockId 
                                                ? 'border-red-300 dark:border-red-600' 
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    />
                                </div>
                                
                                {/* Stock List */}
                                {searchQuery && (
                                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                        {loading ? (
                                            <div className="p-4 text-center">
                                                <Loading size="sm" />
                                            </div>
                                        ) : filteredStocks.length > 0 ? (
                                            filteredStocks.slice(0, 10).map((stock) => (
                                                <button
                                                    key={stock.stockId}
                                                    type="button"
                                                    onClick={() => handleStockSelect(stock)}
                                                    className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                                >
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {stock.stockTicker}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {stock.stockName}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                No stocks found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                        
                        {validationErrors.stockId && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.stockId}</p>
                        )}
                    </div>

                    {/* Selected Stock Display for non-pre-selected stocks */}
                    {formData.stockId && !selectedStock && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {formData.stockSymbol}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {formData.stockName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Target Price */}
                    <Input
                        label="Target Price *"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="10000"
                        name="targetPrice"
                        value={formData.targetPrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        error={validationErrors.targetPrice}
                        required
                    />

                    {/* Alert Direction */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Alert When Price Goes *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, alertDirection: 'ABOVE' }))}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    formData.alertDirection === 'ABOVE'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                            >
                                <div className="flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    <span className="font-medium">Above Target</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, alertDirection: 'BELOW' }))}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    formData.alertDirection === 'BELOW'
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                            >
                                <div className="flex items-center justify-center">
                                    <TrendingDown className="w-5 h-5 mr-2" />
                                    <span className="font-medium">Below Target</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={resetForm}
                            disabled={submitting}
                        >
                            Reset
                        </Button>

                        <div className="flex space-x-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitting || !formData.stockId}
                                className="flex items-center"
                            >
                                {submitting ? (
                                    <Loading size="sm" className="mr-2" />
                                ) : (
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                )}
                                {submitting ? 'Adding Alert...' : 'Add Alert'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Dialog>
    );
};

export default AddWatchlistDialog;