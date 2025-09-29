import { useState, useCallback } from 'react';
import apiService from '../services/apiService';

export const useOrderStatus = () => {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const searchOrder = useCallback(async (orderId) => {
        if (!orderId.trim()) {
            setError('Please enter an order ID');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const order = await apiService.getOrderStatus(parseInt(orderId));
            setOrderData(order);
        } catch (err) {
            console.error('Failed to get order status:', err);
            setError(err.message);
            setOrderData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrderStatus = useCallback(async (newStatus) => {
        if (!orderData) return;
        
        setUpdating(true);
        setError(null);
        setSuccess(null);
        
        try {
            const updatedOrder = await apiService.updateOrderStatus(orderData.orderId, newStatus);
            setOrderData(updatedOrder);
            
            const statusText = newStatus === 1 ? 'filled' : 'rejected';
            setSuccess(`Order has been successfully ${statusText}.`);
            
            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            console.error('Failed to update order status:', err);
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    }, [orderData]);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    return {
        orderData,
        loading,
        updating,
        error,
        success,
        searchOrder,
        updateOrderStatus,
        clearMessages
    };
};