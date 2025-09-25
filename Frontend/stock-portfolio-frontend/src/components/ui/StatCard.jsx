import React from 'react';
import Card from './Card';

const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle = null,
    iconColor = 'blue',
    valueColor = 'gray',
    className = '',
    iconSize = 'w-6 h-6',
    hover = true,
    // Special prop for gain/loss scenarios
    gainLossValue = null
}) => {
    // Icon color variants
    const iconColorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
        primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
        gray: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    };

    // Value color variants
    const valueColorClasses = {
        gray: 'text-gray-900 dark:text-gray-100',
        green: 'text-green-600 dark:text-green-400',
        red: 'text-red-600 dark:text-red-400',
        blue: 'text-blue-600 dark:text-blue-400',
        yellow: 'text-yellow-600 dark:text-yellow-400'
    };

    // Handle gain/loss coloring automatically
    const isGainLoss = gainLossValue !== null;
    const isPositive = isGainLoss ? gainLossValue >= 0 : true;

    // Dynamic icon color
    const getIconColorClass = () => {
        if (typeof iconColor === 'function') {
            return iconColor();
        }
        if (isGainLoss) {
            return isPositive 
                ? iconColorClasses.green 
                : iconColorClasses.red;
        }
        return iconColorClasses[iconColor] || iconColorClasses.blue;
    };

    // Dynamic value color
    const getValueColorClass = () => {
        if (typeof valueColor === 'function') {
            return valueColor();
        }
        if (isGainLoss) {
            return isPositive 
                ? valueColorClasses.green 
                : valueColorClasses.red;
        }
        return valueColorClasses[valueColor] || valueColorClasses.gray;
    };

    const cardClassName = `p-6 ${hover ? 'hover:shadow-xl transition-shadow' : ''} ${className}`;

    return (
        <Card className={cardClassName}>
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${getIconColorClass()}`}>
                    <Icon className={iconSize} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className={`text-2xl font-bold ${getValueColorClass()}`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className={`text-sm ${getValueColorClass()}`}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default StatCard;