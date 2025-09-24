import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
                    children,
                    variant = "primary",
                    size = "md",
                    loading = false,
                    className = "",
                    disabled,
                    ...props
                }) => {
    const baseClasses = "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl focus:ring-primary-500",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
        success: "bg-success-500 hover:bg-success-600 text-white shadow-lg hover:shadow-xl focus:ring-success-500",
        danger: "bg-danger-500 hover:bg-danger-600 text-white shadow-lg hover:shadow-xl focus:ring-danger-500",
        outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    };

    const isDisabled = loading || disabled;

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
                isDisabled ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isDisabled}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;