import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Settings } from 'lucide-react';
import Tooltip from './Tooltip';
import PlaceOrderDialog from '../dialog/PlaceOrderDialog';

export default function QuickActions() {
    const [isPlaceOrderDialogOpen, setIsPlaceOrderDialogOpen] = useState(false);

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
                        <button className="p-3 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 dark:text-green-400 transition-all hover:scale-105 active:scale-95">
                            <Search className="w-5 h-5" />
                        </button>
                    </Link>
                </Tooltip>
                
                <Tooltip content="Manage Orders" position="bottom">
                    <Link to="/manage-orders">
                        <button className="p-3 rounded-lg bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/50 text-yellow-600 dark:text-yellow-400 transition-all hover:scale-105 active:scale-95">
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
