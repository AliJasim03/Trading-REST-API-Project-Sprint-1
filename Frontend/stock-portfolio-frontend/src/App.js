import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/ui/Navigation';
import Dashboard from './pages/Dashboard';
import Portfolios from './pages/Portfolios';
import PlaceOrder from './pages/PlaceOrder';
import OrderStatus from './pages/OrderStatus';
import './App.css';

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
                            <Route path="/place-order" element={<PlaceOrder />} />
                            <Route path="/order-status" element={<OrderStatus />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;