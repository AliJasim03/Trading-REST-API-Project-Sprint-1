import React, { useState, useEffect } from 'react';
import PortfolioSelector from '../components/portfolio/PortfolioSelector';
import PortfolioAnalytics from '../components/portfolio/PortfolioAnalytics';
import TradingHistory from '../components/portfolio/TradingHistory';
import HoldingsAllocation from '../components/portfolio/HoldingsAllocation';
import apiService from '../services/apiService';
import QuickActions from '../components/ui/QuickActions';
const Portfolios = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [tradingHistory, setTradingHistory] = useState([]);
    const [portfolioDashboard, setPortfolioDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPortfolios();
    }, []);

    useEffect(() => {
        if (selectedPortfolio) {
            fetchTradingHistory();
            fetchPortfolioDashboard();
        }
    }, [selectedPortfolio]);

    const fetchPortfolios = async () => {
        try {
            setLoading(true);
            setError(null);
            // Include CLOSED portfolios on this page
            const portfoliosData = await apiService.getAllPortfoliosIncludingClosed();
            setPortfolios(portfoliosData);
        } catch (error) {
            console.error('Error fetching portfolios:', error);
            setError(error.message || 'Failed to load portfolios. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePortfolioCreated = (newPortfolio) => {
        // Add the new portfolio to the list
        setPortfolios(prev => [...prev, newPortfolio]);
        
        // If this is the first portfolio, select it
        if (portfolios.length === 0) {
            setSelectedPortfolio(newPortfolio);
        }
    };

    const fetchTradingHistory = async () => {
        if (!selectedPortfolio) return;
        
        try {
            setHistoryLoading(true);
            const historyData = await apiService.getTradingHistory(selectedPortfolio.portfolioId);
            setTradingHistory(historyData);
        } catch (error) {
            console.error('Error fetching trading history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchPortfolioDashboard = async () => {
        if (!selectedPortfolio) return;
        
        try {
            setDashboardLoading(true);
            const dashboardData = await apiService.getPortfolioDashboard(selectedPortfolio.portfolioId);
            setPortfolioDashboard(dashboardData);
        } catch (error) {
            console.error('Error fetching portfolio dashboard:', error);
        } finally {
            setDashboardLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
             <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Portfolio Management</h1>
                                <p className="text-gray-600 dark:text-gray-400">View and manage your investment portfolios with detailed analytics</p>
                            </div>
                            
                            {/* Quick Actions - Icon Buttons with Tooltips */}
                            <QuickActions />
                        </div>
         

            <PortfolioSelector 
                portfolios={portfolios}
                selectedPortfolio={selectedPortfolio}
                onPortfolioSelect={setSelectedPortfolio}
                loading={loading}
                error={error}
                onRefresh={fetchPortfolios}
                onPortfolioCreated={handlePortfolioCreated}
            />

            {selectedPortfolio && (
                <>
                    <PortfolioAnalytics 
                        performance={portfolioDashboard?.performance}
                        loading={dashboardLoading}
                    />

                    <div className="mt-5">
                        <TradingHistory 
                            tradingHistory={tradingHistory}
                            loading={historyLoading}
                        />

                        
                    </div>
                    <div className="mt-5">
                        <HoldingsAllocation 
                            holdingsAllocation={portfolioDashboard?.allocation}
                            loading={dashboardLoading}
                        />
                    </div>

                </>
            )}
        </div>
    );
};

export default Portfolios;