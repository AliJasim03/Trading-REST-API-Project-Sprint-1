import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Briefcase, Plus, Search } from 'lucide-react';

const Navigation = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: TrendingUp },
        { path: '/portfolios', label: 'Portfolios', icon: Briefcase },
        { path: '/place-order', label: 'Place Order', icon: Plus },
        { path: '/order-status', label: 'Order Status', icon: Search },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary-900 flex items-center">
                            <TrendingUp className="w-8 h-8 mr-2" />
                            Portfolio Manager
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                                        isActive(item.path)
                                            ? 'text-primary-600 bg-primary-50'
                                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 mr-1" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile menu button - you can expand this later */}
                    <div className="md:hidden">
                        <button className="text-gray-700 hover:text-primary-600">
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