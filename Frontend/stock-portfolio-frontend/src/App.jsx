import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AgGridReact } from 'ag-grid-react';
import { ToastContainer } from 'react-toastify';
import Navigation from './components/ui/Navigation';
import Dashboard from './pages/Dashboard';
import Portfolios from './pages/Portfolios';
import OrderStatus from './pages/OrderStatus';
import ManageOrders from './pages/ManageOrders';
import LivePrices from './pages/LivePrices';
import Watchlist from './pages/Watchlist';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                    <Navigation />
                    <main>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/portfolios" element={<Portfolios />} />
                            <Route path="/order-status" element={<OrderStatus />} />
                            <Route path="/manage-orders" element={<ManageOrders />} />
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
        </ThemeProvider>
    );
}

export default App;