import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const OrderSimulatorPanel = () => {
    const [stats, setStats] = useState({
        initializedOrders: 0,
        processingOrders: 0,
        filledOrders: 0,
        rejectedOrders: 0,
        failureRate: 15
    });
    const [isEnabled, setIsEnabled] = useState(true);
    const [newFailureRate, setNewFailureRate] = useState(15);

    // Mock function - replace with actual API call
    const fetchStats = async () => {
        // This would call your backend API endpoint
        // const response = await apiService.getSimulatorStats();
        // setStats(response);
    };

    const updateFailureRate = async () => {
        // This would call your backend API endpoint
        // await apiService.updateSimulatorSettings(newFailureRate);
        setStats(prev => ({ ...prev, failureRate: newFailureRate }));
    };

    useEffect(() => {
        // Fetch stats every 5 seconds
        const interval = setInterval(fetchStats, 5000);
        fetchStats(); // Initial fetch
        
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Order Processing Simulator
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Real-time order processing simulation
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isEnabled 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                    {isEnabled ? 'ACTIVE' : 'PAUSED'}
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Initialized</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.initializedOrders}
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Processing</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {stats.processingOrders}
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Filled</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {stats.filledOrders}
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-sm font-medium text-red-800 dark:text-red-300">Rejected</span>
                    </div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {stats.rejectedOrders}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => setIsEnabled(!isEnabled)}
                            variant={isEnabled ? "outline" : "primary"}
                            className="flex items-center"
                        >
                            {isEnabled ? (
                                <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Failure Rate:
                        </span>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={newFailureRate}
                                onChange={(e) => setNewFailureRate(parseInt(e.target.value) || 0)}
                                className="w-20"
                            />
                            <span className="text-sm text-gray-500">%</span>
                            <Button
                                onClick={updateFailureRate}
                                size="sm"
                                variant="outline"
                            >
                                Update
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Orders move: Initialized → Processing (10s) → Filled/Rejected (15s) • Current failure rate: {stats.failureRate}%
                </div>
            </div>
        </Card>
    );
};

export default OrderSimulatorPanel;