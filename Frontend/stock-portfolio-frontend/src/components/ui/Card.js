import React from 'react';

const Card = ({ children, className = "", ...props }) => {
    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;