package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.AlertDirection;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import com.group418.StockProtfolioProject.repository.WatchlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.*;

import static org.mockito.Mockito.*;

class WatchlistAlertSchedulerTest {

    @Mock private WatchlistRepository watchlistRepository;
    @Mock private LivePriceService livePriceService;
    @Mock private NotificationService notificationService;

    private WatchlistAlertScheduler scheduler;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        scheduler = new WatchlistAlertScheduler(watchlistRepository, livePriceService, notificationService);
    }

    @Test
    void testCheckAlertsTriggersNotification() {
        Stocks stock = new Stocks();
        stock.setStockTicker("AAPL");

        WatchlistEntry entry = new WatchlistEntry();
        entry.setStock(stock);
        entry.setTargetPrice(BigDecimal.valueOf(100));
        entry.setAlertDirection(AlertDirection.ABOVE);
        entry.setNotified(false);

        // Use the same repository method that the scheduler uses
        when(watchlistRepository.findByTargetPriceIsNotNullAndAlertDirectionIsNotNull()).thenReturn(List.of(entry));
        when(livePriceService.getCurrentPrice("AAPL")).thenReturn(Map.of("price", BigDecimal.valueOf(150)));

        scheduler.checkAlerts();

        verify(notificationService).notifyPriceAlert(eq(entry), eq(BigDecimal.valueOf(150)));
        verify(watchlistRepository).save(entry);
        assertTrue(entry.getNotified());
    }
}
