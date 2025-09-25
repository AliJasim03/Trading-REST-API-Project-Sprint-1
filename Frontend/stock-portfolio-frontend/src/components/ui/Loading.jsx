import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ size = "default", text = "" }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        default: "w-8 h-8",
        lg: "w-12 h-12"
    };

    return (
        <div className="flex flex-col justify-center items-center py-8">
            <Loader2 className={`animate-spin text-primary-600 dark:text-primary-400 ${sizeClasses[size]}`} />
            {text && <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{text}</p>}
        </div>
    );
};

export default Loading;