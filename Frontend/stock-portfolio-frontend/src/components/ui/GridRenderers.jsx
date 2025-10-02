import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

// Currency cell renderer
export const CurrencyRenderer = ({ value }) => {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(val || 0);
    };

    return (
        <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(value)}
        </span>
    );
};

// Date cell renderer
export const DateRenderer = ({ value }) => {
    if (!value) return <span className="text-gray-400">N/A</span>;
    
    const date = new Date(value);
    return (
        <span className="text-gray-600 dark:text-gray-400">
            {date.toLocaleDateString()}
        </span>
    );
};

// Status badge cell renderer
export const StatusRenderer = ({ value }) => {
    return <StatusBadge status={value} />;
};

// Buy/Sell type renderer
export const BuySellRenderer = ({ value }) => {
    const isBuy = value === 'BUY';
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isBuy
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
            {value}
        </span>
    );
};

// Number renderer with formatting
export const NumberRenderer = ({ value, decimals = 0 }) => {
    return (
        <span className="font-medium text-gray-900 dark:text-gray-100">
            {typeof value === 'number' ? value.toFixed(decimals) : value || 0}
        </span>
    );
};

// Percentage renderer
export const PercentageRenderer = ({ value }) => {
    const isPositive = value >= 0;
    return (
        <span className={`font-medium ${
            isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
        }`}>
            {`${(value || 0).toFixed(2)}%`}
        </span>
    );
};

// Gain/Loss renderer
export const GainLossRenderer = ({ value }) => {
    const isPositive = value >= 0;
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(val || 0);
    };

    return (
        <span className={`font-medium ${
            isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
        }`}>
            {formatCurrency(value)}
        </span>
    );
};

// Order ID renderer with status icon
export const OrderIdRenderer = ({ value, data, onOrderClick }) => {
    const getStatusIcon = (statusCode) => {
        switch (statusCode) {
            case 0:
                return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
            case 1:
                return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
            case 2:
                return <div className="w-4 h-4 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>;
            default:
                return <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 rounded-full"></div>;
        }
    };

    return (
        <div className="flex items-center">
            {getStatusIcon(data?.status_code)}
            <button
                onClick={() => onOrderClick && onOrderClick(value)}
                className="ml-3 text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
                title="View order details"
            >
                #{value}
            </button>
        </div>
    );
};

// Stock renderer with ticker and name
export const StockRenderer = ({ value }) => {
    const stock = value || {};
    return (
        <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
                {stock.stockTicker || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
                {stock.stockName || 'N/A'}
            </div>
        </div>
    );
};

// DateTime renderer with date and time
export const DateTimeRenderer = ({ value }) => {
    if (!value) return <span className="text-gray-400">N/A</span>;
    
    const date = new Date(value);
    return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    );
};

// Volume and Price details renderer
export const VolumeePriceRenderer = ({ data }) => {
    return (
        <div className="text-sm text-gray-900 dark:text-gray-100">
            <div>{data?.volume || 0} shares</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">@ ${(data?.price || 0).toFixed(2)}</div>
        </div>
    );
};