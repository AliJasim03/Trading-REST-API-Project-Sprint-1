import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Settings } from 'lucide-react';
import Tooltip from './Tooltip';
import PlaceOrderDialog from '../dialog/PlaceOrderDialog';

export default function QuickActions() {
    const [isPlaceOrderDialogOpen, setIsPlaceOrderDialogOpen] = useState(false);
    const location = useLocation();

    // Helper function to determine if a button should be active/highlighted
    const isActive = (path) => location.pathname === path;

    // Helper function to get button classes with active state
    const getButtonClasses = (path, baseColor) => {
        const active = isActive(path);
        const baseClasses = "p-3 rounded-lg transition-all hover:scale-105 active:scale-95";
        
        if (active) {
            // Active state with more prominent styling
            return `${baseClasses} bg-${baseColor}-200 dark:bg-${baseColor}-800/70 text-${baseColor}-700 dark:text-${baseColor}-300 ring-2 ring-${baseColor}-300 dark:ring-${baseColor}-600`;
        } else {
            // Normal state
            return `${baseClasses} bg-${baseColor}-100 hover:bg-${baseColor}-200 dark:bg-${baseColor}-900/30 dark:hover:bg-${baseColor}-800/50 text-${baseColor}-600 dark:text-${baseColor}-400`;
        }
    };

    return (
        <>
            <div className="flex items-center space-x-3">
                <Tooltip content="Place New Order" position="bottom">
                    <button 
                        onClick={() => setIsPlaceOrderDialogOpen(true)}
                        className="p-3 rounded-lg bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-800/50 text-primary-600 dark:text-primary-400 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </Tooltip>
                
                {/* <Tooltip content="View Portfolios" position="bottom">
                    <Link to="/portfolios">
                        <button className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-all hover:scale-105 active:scale-95">
                            <PieChart className="w-5 h-5" />
                        </button>
                    </Link>
                </Tooltip> */}
                
                <Tooltip content="Check Order Status" position="bottom">
                    <Link to="/order-status">
                        <button className={getButtonClasses('/order-status', 'green')}>
                            <Search className="w-5 h-5" />
                        </button>
                    </Link>
                </Tooltip>
                
                <Tooltip content="Manage Orders" position="bottom">
                    <Link to="/manage-orders">
                        <button className={getButtonClasses('/manage-orders', 'yellow')}>
                            <Settings className="w-5 h-5" />
                        </button>
                    </Link>
                </Tooltip>
            </div>

            {/* Place Order Dialog */}
            <PlaceOrderDialog 
                isOpen={isPlaceOrderDialogOpen}
                onClose={() => setIsPlaceOrderDialogOpen(false)}
            />
        </>
    );
}
