import React, { useState } from 'react';
import { Building, CheckCircle, X } from 'lucide-react';
import Dialog from './Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Loading from '../ui/Loading';
import apiService from '../../services/apiService';

const CreatePortfolioDialog = ({ isOpen, onClose, onPortfolioCreated }) => {
    const [portfolioData, setPortfolioData] = useState({
        portfolioName: '',
        description: '',
        initialCapital: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    // NEW: cache existing portfolio names (normalized)
    const [existingNames, setExistingNames] = useState([]);

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    // NEW: fetch existing portfolio names when dialog opens
    React.useEffect(() => {
        if (!isOpen) return;
        apiService.getAllPortfolios()
            .then(list => {
                const names = (list || [])
                    .map(p => (p?.portfolioName || '').trim().toLowerCase())
                    .filter(Boolean);
                setExistingNames(names);
            })
            .catch(() => {
                // ignore; uniqueness validation will be skipped if we cannot load
                setExistingNames([]);
            });
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPortfolioData(prev => ({
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

        if (!portfolioData.portfolioName.trim()) {
            errors.portfolioName = 'Portfolio name is required';
        } else if (portfolioData.portfolioName.trim().length < 2) {
            errors.portfolioName = 'Portfolio name must be at least 2 characters long';
        }
        // NEW: uniqueness check (case-insensitive)
        const normalizedName = portfolioData.portfolioName.trim().toLowerCase();
        if (!errors.portfolioName && existingNames.includes(normalizedName)) {
            errors.portfolioName = 'A portfolio with this name already exists';
        }

        if (!portfolioData.description.trim()) {
            errors.description = 'Description is required';
        } else if (portfolioData.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters long';
        }

        if (!portfolioData.initialCapital || parseFloat(portfolioData.initialCapital) <= 0) {
            errors.initialCapital = 'Please enter a valid initial capital amount greater than 0';
        } else if (parseFloat(portfolioData.initialCapital) > 1000000) {
            errors.initialCapital = 'Initial capital cannot exceed $1,000,000';
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
            const portfolioPayload = {
                portfolioName: portfolioData.portfolioName.trim(),
                description: portfolioData.description.trim(),
                initialCapital: parseFloat(portfolioData.initialCapital)
            };

            const result = await apiService.createPortfolio(portfolioPayload);

            setSuccess(`Portfolio "${portfolioData.portfolioName}" created successfully!`);

            // Call the callback to refresh the portfolio list
            if (onPortfolioCreated) {
                onPortfolioCreated(result);
            }

            // Reset form after 1.5 seconds and close dialog
            setTimeout(() => {
                resetForm();
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Failed to create portfolio:', err);
            setError(err.message || 'Failed to create portfolio. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setPortfolioData({
            portfolioName: '',
            description: '',
            initialCapital: ''
        });
        setValidationErrors({});
        setError(null);
        setSuccess(null);
    };

    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Create New Portfolio" 
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
                                <h3 className="text-sm font-medium">Portfolio created successfully!</h3>
                                <div className="mt-1 text-sm">{success}</div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Portfolio Name *"
                        type="text"
                        name="portfolioName"
                        value={portfolioData.portfolioName}
                        onChange={handleInputChange}
                        placeholder="Enter portfolio name (e.g., 'Growth Portfolio', 'Retirement Fund')"
                        error={validationErrors.portfolioName}
                        required
                        maxLength={100}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={portfolioData.description}
                            onChange={handleInputChange}
                            placeholder="Describe the purpose and strategy of this portfolio..."
                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none ${
                                validationErrors.description 
                                    ? 'border-red-300 dark:border-red-600' 
                                    : 'border-gray-300 dark:border-gray-600'
                            }`}
                            rows={3}
                            maxLength={500}
                            required
                        />
                        {validationErrors.description && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.description}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {portfolioData.description.length}/500 characters
                        </p>
                    </div>

                    <Input
                        label="Initial Capital *"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="1000000"
                        name="initialCapital"
                        value={portfolioData.initialCapital}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        error={validationErrors.initialCapital}
                        required
                    />

                    {/* Portfolio Summary */}
                    {portfolioData.portfolioName && portfolioData.initialCapital && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center mb-3">
                                <Building className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Portfolio Preview</h4>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span>Name:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{portfolioData.portfolioName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Starting Capital:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        ${parseFloat(portfolioData.initialCapital || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

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
                                disabled={submitting}
                                className="flex items-center"
                            >
                                {submitting ? (
                                    <Loading size="sm" className="mr-2" />
                                ) : (
                                    <Building className="w-4 h-4 mr-2" />
                                )}
                                {submitting ? 'Creating Portfolio...' : 'Create Portfolio'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Dialog>
    );
};

export default CreatePortfolioDialog;
