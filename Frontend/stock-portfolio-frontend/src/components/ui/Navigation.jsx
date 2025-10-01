import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Briefcase, Plus, Search, Settings, Sun, Moon, Activity, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';

const Navigation = () => {
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: TrendingUp },
        { path: '/portfolios', label: 'Portfolios', icon: Briefcase },
        { path: '/live-prices', label: 'Live Prices', icon: Activity },
        { path: '/watchlist', label: 'Watchlist', icon: Bell },
        // { path: '/place-order', label: 'Place Order', icon: Plus },
        // { path: '/order-status', label: 'Order Status', icon: Search },
        // { path: '/manage-orders', label: 'Manage Orders', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg border-b dark:border-gray-700 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary-900 dark:text-primary-200 flex items-center">
                            <TrendingUp className="w-8 h-8 mr-2" />
                            Portfolio Manager
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-8 items-center">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                                        isActive(item.path)
                                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 mr-1" />
                                    {item.label}
                                </Link>
                            );
                        })}

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        <NotificationDropdown />
                    </div>

                    {/* Mobile menu button - you can expand this later */}
                    <div className="md:hidden flex items-center space-x-2">
                        {/* Notification Dropdown for Mobile */}
                        <NotificationDropdown />
                        
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                        <button className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
