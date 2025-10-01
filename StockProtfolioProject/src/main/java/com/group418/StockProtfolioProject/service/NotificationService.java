package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {

    /**
     * Send notification when an order is placed
     */
    public void notifyOrderPlaced(Orders order) {
        String message = String.format(
            "Order placed: %s %d shares of %s at $%.2f",
            order.getBuy_or_sell(),
            order.getVolume(),
            order.getStock().getStockTicker(),
            order.getPrice()
        );
        
        System.out.println("[NOTIFICATION] Order Placed - " + message);
        
        // TODO: In a real application, you would:
        // 1. Save notification to database
        // 2. Send WebSocket message to frontend
        // 3. Send email/SMS if configured
        // 4. Push notification to mobile app
    }

    /**
     * Send notification when an order is filled
     */
    public void notifyOrderFilled(Orders order) {
        double totalValue = order.getPrice() * order.getVolume() + order.getFees();
        
        String message = String.format(
            "Order filled: %s %d shares of %s at $%.2f (Total: $%.2f)",
            order.getBuy_or_sell(),
            order.getVolume(),
            order.getStock().getStockTicker(),
            order.getPrice(),
            totalValue
        );
        
        System.out.println("[NOTIFICATION] Order Filled - " + message);
        
        // TODO: Implement actual notification delivery
    }

    /**
     * Send notification when an order is rejected
     */
    public void notifyOrderRejected(Orders order, String reason) {
        String message = String.format(
            "Order rejected: %s %d shares of %s at $%.2f. Reason: %s",
            order.getBuy_or_sell(),
            order.getVolume(),
            order.getStock().getStockTicker(),
            order.getPrice(),
            reason != null ? reason : "Unknown"
        );
        
        System.out.println("[NOTIFICATION] Order Rejected - " + message);
        
        // TODO: Implement actual notification delivery
    }

    /**
     * Send notification when a price alert is triggered
     */
    public void notifyPriceAlert(WatchlistEntry entry, BigDecimal currentPrice) {
        String direction = entry.getAlertDirection().toString().toLowerCase();
        String message = String.format(
            "Price alert: %s %s your target price of $%.2f (Current: $%.2f)",
            entry.getStock().getStockTicker(),
            direction.equals("above") ? "reached" : "dropped below",
            entry.getTargetPrice(),
            currentPrice
        );
        
        System.out.println("[NOTIFICATION] Price Alert - " + message);
        
        // TODO: Implement actual notification delivery
    }

    /**
     * Send notification for portfolio updates
     */
    public void notifyPortfolioUpdate(String portfolioName, double changePercent) {
        String changeDirection = changePercent >= 0 ? "gained" : "lost";
        String message = String.format(
            "Portfolio update: %s %s %.2f%% today",
            portfolioName,
            changeDirection,
            Math.abs(changePercent)
        );
        
        System.out.println("[NOTIFICATION] Portfolio Update - " + message);
        
        // TODO: Implement actual notification delivery
    }

    /**
     * Send general system notification
     */
    public void notifySystem(String title, String message) {
        String formattedMessage = String.format(
            "System notification: %s - %s",
            title,
            message
        );
        
        System.out.println("[NOTIFICATION] System - " + formattedMessage);
        
        // TODO: Implement actual notification delivery
    }

    /**
     * Log notification for debugging
     */
    private void logNotification(String type, String message) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        System.out.printf("[%s] %s: %s%n", timestamp, type, message);
    }
}