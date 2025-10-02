package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.group418.StockProtfolioProject.entity.AlertDirection;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Mock
    private Orders mockOrder;

    @Mock
    private Stocks mockStock;

    @Mock
    private WatchlistEntry mockWatchlistEntry;

    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();
    private final PrintStream originalOut = System.out;

    @BeforeEach
    void setUp() {
        // Redirect System.out to capture console output
        System.setOut(new PrintStream(outContent));
    }

    @AfterEach
    void tearDown() {
        // Restore original System.out
        System.setOut(originalOut);
    }

    @Test
    void testNotifyOrderPlaced_BuyOrder() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.BUY);
        when(mockOrder.getVolume()).thenReturn(100);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("AAPL");
        when(mockOrder.getPrice()).thenReturn(150.50);

        // Act
        notificationService.notifyOrderPlaced(mockOrder);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Placed"));
        assertTrue(output.contains("Order placed: BUY 100 shares of AAPL at $150.50"));
        
        verify(mockOrder, times(1)).getBuy_or_sell();
        verify(mockOrder, times(1)).getVolume();
        verify(mockOrder, times(1)).getStock();
        verify(mockStock, times(1)).getStockTicker();
        verify(mockOrder, times(1)).getPrice();
    }

    @Test
    void testNotifyOrderPlaced_SellOrder() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.SELL);
        when(mockOrder.getVolume()).thenReturn(50);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("TSLA");
        when(mockOrder.getPrice()).thenReturn(250.75);

        // Act
        notificationService.notifyOrderPlaced(mockOrder);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Placed"));
        assertTrue(output.contains("Order placed: SELL 50 shares of TSLA at $250.75"));
    }

    @Test
    void testNotifyOrderFilled_WithNoFees() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.SELL);
        when(mockOrder.getVolume()).thenReturn(25);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("GOOGL");
        when(mockOrder.getPrice()).thenReturn(100.00);
        when(mockOrder.getFees()).thenReturn(0.0);

        // Act
        notificationService.notifyOrderFilled(mockOrder);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Filled"));
        assertTrue(output.contains("Order filled: SELL 25 shares of GOOGL at $100.00 (Total: $2500.00)"));
    }

    @Test
    void testNotifyOrderRejected_WithReason() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.BUY);
        when(mockOrder.getVolume()).thenReturn(1000);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("AAPL");
        when(mockOrder.getPrice()).thenReturn(150.00);
        String reason = "Insufficient funds";

        // Act
        notificationService.notifyOrderRejected(mockOrder, reason);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Rejected"));
        assertTrue(output.contains("Order rejected: BUY 1000 shares of AAPL at $150.00. Reason: Insufficient funds"));
    }

    @Test
    void testNotifyOrderRejected_WithNullReason() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.SELL);
        when(mockOrder.getVolume()).thenReturn(100);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("TSLA");
        when(mockOrder.getPrice()).thenReturn(200.00);

        // Act
        notificationService.notifyOrderRejected(mockOrder, null);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Rejected"));
        assertTrue(output.contains("Order rejected: SELL 100 shares of TSLA at $200.00. Reason: Unknown"));
    }

    @Test
    void testNotifyOrderRejected_WithEmptyReason() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.BUY);
        when(mockOrder.getVolume()).thenReturn(50);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("AMD");
        when(mockOrder.getPrice()).thenReturn(100.00);

        // Act
        notificationService.notifyOrderRejected(mockOrder, "");

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Rejected"));
        assertTrue(output.contains("Reason: "));
    }

    @Test
    void testNotifyPriceAlert_AboveTarget() {
        // Arrange
        when(mockWatchlistEntry.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("AAPL");
        when(mockWatchlistEntry.getAlertDirection()).thenReturn(AlertDirection.ABOVE);
        when(mockWatchlistEntry.getTargetPrice()).thenReturn(BigDecimal.valueOf(150.00));
        BigDecimal currentPrice = BigDecimal.valueOf(155.00);

        // Act
        notificationService.notifyPriceAlert(mockWatchlistEntry, currentPrice);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Price Alert"));
        assertTrue(output.contains("Price alert: AAPL reached your target price of $150.00 (Current: $155.00)"));
    }

    @Test
    void testNotifyPriceAlert_BelowTarget() {
        // Arrange
        when(mockWatchlistEntry.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("TSLA");
        when(mockWatchlistEntry.getAlertDirection()).thenReturn(AlertDirection.BELOW);
        when(mockWatchlistEntry.getTargetPrice()).thenReturn(BigDecimal.valueOf(200.00));
        BigDecimal currentPrice = BigDecimal.valueOf(195.00);

        // Act
        notificationService.notifyPriceAlert(mockWatchlistEntry, currentPrice);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Price Alert"));
        assertTrue(output.contains("Price alert: TSLA dropped below your target price of $200.00 (Current: $195.00)"));
    }

    @Test
    void testNotifyPortfolioUpdate_PositiveChange() {
        // Arrange
        String portfolioName = "My Portfolio";
        double changePercent = 5.75;

        // Act
        notificationService.notifyPortfolioUpdate(portfolioName, changePercent);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Portfolio Update"));
        assertTrue(output.contains("Portfolio update: My Portfolio gained 5.75% today"));
    }

    @Test
    void testNotifyPortfolioUpdate_NegativeChange() {
        // Arrange
        String portfolioName = "Tech Portfolio";
        double changePercent = -3.25;

        // Act
        notificationService.notifyPortfolioUpdate(portfolioName, changePercent);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Portfolio Update"));
        assertTrue(output.contains("Portfolio update: Tech Portfolio lost 3.25% today"));
    }

    @Test
    void testNotifyPortfolioUpdate_ZeroChange() {
        // Arrange
        String portfolioName = "Stable Portfolio";
        double changePercent = 0.0;

        // Act
        notificationService.notifyPortfolioUpdate(portfolioName, changePercent);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Portfolio Update"));
        assertTrue(output.contains("Portfolio update: Stable Portfolio gained 0.00% today"));
    }

    @Test
    void testNotifySystem_WithTitleAndMessage() {
        // Arrange
        String title = "Maintenance Alert";
        String message = "System will be down for maintenance from 2 AM to 4 AM";

        // Act
        notificationService.notifySystem(title, message);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] System"));
        assertTrue(output.contains("System notification: Maintenance Alert - System will be down for maintenance from 2 AM to 4 AM"));
    }

    @Test
    void testNotifySystem_WithEmptyMessage() {
        // Arrange
        String title = "Test";
        String message = "";

        // Act
        notificationService.notifySystem(title, message);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] System"));
        assertTrue(output.contains("System notification: Test - "));
    }

    @Test
    void testNotifyOrderPlaced_WithDecimalPrice() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.BUY);
        when(mockOrder.getVolume()).thenReturn(1);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("BTC");
        when(mockOrder.getPrice()).thenReturn(45000.123);

        // Act
        notificationService.notifyOrderPlaced(mockOrder);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Placed"));
        assertTrue(output.contains("Order placed: BUY 1 shares of BTC at $45000.12"));
    }

    @Test
    void testMultipleNotifications_InSequence() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.BUY);
        when(mockOrder.getVolume()).thenReturn(10);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("AAPL");
        when(mockOrder.getPrice()).thenReturn(150.00);
        when(mockOrder.getFees()).thenReturn(5.00);

        // Act
        notificationService.notifyOrderPlaced(mockOrder);
        notificationService.notifyOrderFilled(mockOrder);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Placed"));
        assertTrue(output.contains("[NOTIFICATION] Order Filled"));
    }

    @Test
    void testNotifyOrderFilled_LargeOrder() {
        // Arrange
        when(mockOrder.getBuy_or_sell()).thenReturn(Orders.BuySellType.BUY);
        when(mockOrder.getVolume()).thenReturn(5000);
        when(mockOrder.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("MSFT");
        when(mockOrder.getPrice()).thenReturn(350.75);
        when(mockOrder.getFees()).thenReturn(100.50);

        // Act
        notificationService.notifyOrderFilled(mockOrder);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Order Filled"));
        assertTrue(output.contains("5000 shares"));
        // Total should be: 350.75 * 5000 + 100.50 = 1,753,850.50
        assertTrue(output.contains("$1753850.50"));
    }

    @Test
    void testNotifyPriceAlert_WithLargeNumbers() {
        // Arrange
        when(mockWatchlistEntry.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("BRK.A");
        when(mockWatchlistEntry.getAlertDirection()).thenReturn(AlertDirection.ABOVE);
        when(mockWatchlistEntry.getTargetPrice()).thenReturn(BigDecimal.valueOf(500000.00));
        BigDecimal currentPrice = BigDecimal.valueOf(505000.00);

        // Act
        notificationService.notifyPriceAlert(mockWatchlistEntry, currentPrice);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Price Alert"));
        assertTrue(output.contains("BRK.A"));
        assertTrue(output.contains("$500000.00"));
        assertTrue(output.contains("$505000.00"));
    }

    @Test
    void testNotifyPortfolioUpdate_LargeNegativeChange() {
        // Arrange
        String portfolioName = "Volatile Portfolio";
        double changePercent = -15.50;

        // Act
        notificationService.notifyPortfolioUpdate(portfolioName, changePercent);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] Portfolio Update"));
        assertTrue(output.contains("Volatile Portfolio lost 15.50% today"));
    }

    @Test
    void testNotifySystem_WithSpecialCharacters() {
        // Arrange
        String title = "Security Alert!";
        String message = "Unusual activity detected: 3 failed login attempts from IP 192.168.1.1";

        // Act
        notificationService.notifySystem(title, message);

        // Assert
        String output = outContent.toString();
        assertTrue(output.contains("[NOTIFICATION] System"));
        assertTrue(output.contains("Security Alert!"));
        assertTrue(output.contains("192.168.1.1"));
    }
    }
