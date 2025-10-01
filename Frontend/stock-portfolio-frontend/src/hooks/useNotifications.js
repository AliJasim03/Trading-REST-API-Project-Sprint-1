import { useState, useEffect, useCallback } from 'react';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize with mock data - replace with API call
    useEffect(() => {
        // Mock initial notifications (these will be replaced by real notifications from your backend)
        const mockNotifications = [
            {
                id: 1,
                type: 'system',
                title: 'Welcome to Portfolio Manager',
                message: 'Your notification system is now active!',
                timestamp: new Date(Date.now() - 60 * 60 * 1000),
                read: false
            }
        ];

        setNotifications(mockNotifications);
        updateUnreadCount(mockNotifications);
    }, []);

    const updateUnreadCount = useCallback((notificationList) => {
        const count = notificationList.filter(n => !n.read).length;
        setUnreadCount(count);
    }, []);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            ...notification,
            id: Date.now(),
            timestamp: new Date(),
            read: false
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            updateUnreadCount(updated);
            return updated;
        });
    }, [updateUnreadCount]);

    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev => {
            const updated = prev.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
            );
            updateUnreadCount(updated);
            return updated;
        });
    }, [updateUnreadCount]);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            updateUnreadCount(updated);
            return updated;
        });
    }, [updateUnreadCount]);

    const removeNotification = useCallback((notificationId) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== notificationId);
            updateUnreadCount(updated);
            return updated;
        });
    }, [updateUnreadCount]);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    // Function to add price alert notifications
    const addPriceAlert = useCallback((stock, targetPrice, currentPrice, direction) => {
        addNotification({
            type: 'alert',
            title: 'Price Alert Triggered',
            message: `${stock} ${direction === 'above' ? 'hit' : 'dropped below'} your target price of $${targetPrice}`,
            currentPrice: `$${currentPrice}`,
            stock,
            direction
        });
    }, [addNotification]);

    // Function to add portfolio update notifications
    const addPortfolioUpdate = useCallback((portfolioName, changePercent) => {
        addNotification({
            type: 'system',
            title: 'Portfolio Update',
            message: `Your ${portfolioName} ${changePercent >= 0 ? 'gained' : 'lost'} ${Math.abs(changePercent)}% today`,
            icon: 'portfolio'
        });
    }, [addNotification]);

    // Function to add system notifications
    const addSystemNotification = useCallback((title, message, type = 'system') => {
        addNotification({
            type,
            title,
            message
        });
    }, [addNotification]);

    // Function to add order placed notifications
    const addOrderPlaced = useCallback((stock, orderType, buySell, volume, price) => {
        addNotification({
            type: 'order',
            title: 'Order Placed',
            message: `${buySell.toUpperCase()} ${volume} shares of ${stock} at $${price}`,
            stock,
            orderType,
            buySell,
            volume,
            price,
            status: 'placed'
        });
    }, [addNotification]);

    // Function to add order filled notifications
    const addOrderFilled = useCallback((stock, orderType, buySell, volume, price, totalValue) => {
        addNotification({
            type: 'order',
            title: 'Order Filled ✅',
            message: `${buySell.toUpperCase()} order for ${volume} shares of ${stock} filled at $${price}`,
            currentPrice: `Total: $${totalValue}`,
            stock,
            orderType,
            buySell,
            volume,
            price,
            status: 'filled'
        });
    }, [addNotification]);

    // Function to add order rejected notifications
    const addOrderRejected = useCallback((stock, orderType, buySell, volume, price, reason) => {
        addNotification({
            type: 'order',
            title: 'Order Rejected ❌',
            message: `${buySell.toUpperCase()} order for ${volume} shares of ${stock} was rejected`,
            currentPrice: reason ? `Reason: ${reason}` : '',
            stock,
            orderType,
            buySell,
            volume,
            price,
            status: 'rejected'
        });
    }, [addNotification]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        addPriceAlert,
        addPortfolioUpdate,
        addSystemNotification,
        addOrderPlaced,
        addOrderFilled,
        addOrderRejected
    };
};

export default useNotifications;