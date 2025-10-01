import { useState, useEffect, useCallback } from 'react';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize with mock data - replace with API call
    useEffect(() => {
        // Mock initial notifications
        const mockNotifications = [
            {
                id: 1,
                type: 'alert',
                title: 'Price Alert Triggered',
                message: 'AAPL hit your target price of $150.00',
                currentPrice: '$152.30',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                read: false,
                stock: 'AAPL',
                direction: 'above'
            },
            {
                id: 2,
                type: 'alert',
                title: 'Price Alert Triggered',
                message: 'MSFT dropped below your target of $300.00',
                currentPrice: '$298.75',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                read: false,
                stock: 'MSFT',
                direction: 'below'
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

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        addPriceAlert,
        addPortfolioUpdate,
        addSystemNotification
    };
};

export default useNotifications;