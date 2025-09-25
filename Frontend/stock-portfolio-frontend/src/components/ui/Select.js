import React from 'react';

const Select = ({ label, error, children, className = "", id, ...props }) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="mb-4">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    error ? 'border-danger-500 focus:ring-danger-500' : ''
                } ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-danger-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default Select;