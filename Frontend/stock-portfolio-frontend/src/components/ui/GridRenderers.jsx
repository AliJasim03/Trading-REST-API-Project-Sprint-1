import React from 'react';
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