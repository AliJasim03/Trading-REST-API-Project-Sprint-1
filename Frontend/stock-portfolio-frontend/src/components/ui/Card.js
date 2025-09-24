import React from 'react';

const Card = ({ children, className = "", ...props }) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;