import React from 'react';

const StatusBadge = ({ status, className = "" }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 0:
                return {
                    text: 'Pending',
                    class: 'bg-yellow-100 text-yellow-800 border-yellow-200'
                };
            case 1:
                return {
                    text: 'Filled',
                    class: 'bg-green-100 text-green-800 border-green-200'
                };
            case 2:
                return {
                    text: 'Rejected',
                    class: 'bg-red-100 text-red-800 border-red-200'
                };
            default:
                return {
                    text: 'Unknown',
                    class: 'bg-gray-100 text-gray-800 border-gray-200'
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${config.class} ${className}`}>
      {config.text}
    </span>
    );
};

export default StatusBadge;