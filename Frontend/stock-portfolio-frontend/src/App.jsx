import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navigation from './components/ui/Navigation';
import Dashboard from './pages/Dashboard';
import Portfolios from './pages/Portfolios';
import OrderStatus from './pages/OrderStatus';
import ManageOrders from './pages/ManageOrders';
import LivePrices from './pages/LivePrices';
import Watchlist from './pages/Watchlist';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule])
function App() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                        <Navigation />
                        <main>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/portfolios" element={<Portfolios />} />
                                <Route path="/order-status" element={<OrderStatus />} />
                                <Route path="/track-orders" element={<ManageOrders />} />
                                <Route path="/live-prices" element={<LivePrices />} />
                                <Route path="/watchlist" element={<Watchlist />} />
                            </Routes>
                        </main>
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                        />
                    </div>
                </Router>
            </NotificationProvider>
        </ThemeProvider>
    );
}

export default App;