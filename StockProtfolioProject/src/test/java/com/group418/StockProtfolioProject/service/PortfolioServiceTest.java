package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.*;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.HoldingsRepository;
import com.group418.StockProtfolioProject.repository.OrdersRepository;
import com.group418.StockProtfolioProject.repository.PortfolioRepository;
import com.group418.StockProtfolioProject.repository.PriceHistoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import java.sql.Timestamp;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PortfolioServiceTest {

    @Mock private PortfolioRepository portfolioRepository;
    @Mock private HoldingsRepository holdingsRepository;
    @Mock private OrdersRepository ordersRepository;
    @Mock private PriceHistoryRepository priceHistoryRepository;

    private PortfolioService portfolioService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        portfolioService = new PortfolioService(portfolioRepository, holdingsRepository, ordersRepository, priceHistoryRepository);
    }

    @Test
    void testGetPortfolioByIdFound() {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);
        when(portfolioRepository.findById(1)).thenReturn(Optional.of(portfolio));

        Portfolios result = portfolioService.getPortfolioById(1);
        assertEquals(1, result.getPortfolioId());
    }

    @Test
    void testGetPortfolioByIdNotFound() {
        when(portfolioRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> portfolioService.getPortfolioById(1));
    }

    @Test
    void testCreatePortfolioSetsTimestamp() {
        Portfolios portfolio = new Portfolios();
        when(portfolioRepository.save(any())).thenReturn(portfolio);

        Portfolios saved = portfolioService.createPortfolio(portfolio);

        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void testUpdatePortfolioValid() {
        Portfolios existing = new Portfolios();
        existing.setPortfolioId(1);
        existing.setInitialCapital(1000);

        Portfolios update = new Portfolios();
        update.setPortfolioName("My Portfolio");
        update.setDescription("Valid description with more than 10 chars");
        update.setInitialCapital(2000);

        when(portfolioRepository.findById(1)).thenReturn(Optional.of(existing));
        when(ordersRepository.findByPortfoliosPortfolioId(1)).thenReturn(Collections.emptyList());
        when(holdingsRepository.findByPortfolioPortfolioId(1)).thenReturn(Collections.emptyList());
        when(portfolioRepository.save(any())).thenReturn(existing);

        Portfolios result = portfolioService.updatePortfolio(1, update);

        assertEquals("My Portfolio", result.getPortfolioName());
    }

    @Test
    void testCalculatePortfolioValue() {
        Holdings holding = new Holdings();
        Stocks stock = new Stocks();
        stock.setStockId(1);
        holding.setStock(stock);
        holding.setQuantity(10);

        PriceHistory priceHistory = new PriceHistory();
        priceHistory.setPrice(100.0);

        when(priceHistoryRepository.findByStockStockIdOrderByCreatedAtDesc(1)).thenReturn(List.of(priceHistory));

        double value = portfolioService.calculatePortfolioValue(List.of(holding));

        assertEquals(1000.0, value);
    }

    @Test
    void testGetAllPortfolios() {
        Portfolios p1 = new Portfolios();
        p1.setPortfolioId(1);
        when(portfolioRepository.findAll()).thenReturn(List.of(p1));

        List<Portfolios> result = portfolioService.getAllPortfolios();
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getPortfolioId());
    }

    @Test
    void testDeletePortfolio() {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);
        when(portfolioRepository.findById(1)).thenReturn(Optional.of(portfolio));

        portfolioService.deletePortfolio(1);

        verify(portfolioRepository, times(1)).delete(portfolio);
    }

    @Test
    void testGetPortfolioHoldings() {
        Holdings holding = new Holdings();
        when(holdingsRepository.findByPortfolioPortfolioId(1)).thenReturn(List.of(holding));

        List<Holdings> result = portfolioService.getPortfolioHoldings(1);
        assertEquals(1, result.size());
    }

    @Test
    void testCalculateAllocation() {
        Holdings holding = new Holdings();
        Stocks stock = new Stocks();
        stock.setStockId(1);
        stock.setStockTicker("AAPL");
        stock.setStockName("Apple");
        holding.setStock(stock);
        holding.setQuantity(10);

        PriceHistory ph = new PriceHistory();
        ph.setPrice(100.0);
        when(priceHistoryRepository.findByStockStockIdOrderByCreatedAtDesc(1))
                .thenReturn(List.of(ph));

        List<Map<String, Object>> allocation = portfolioService.calculateAllocation(List.of(holding));

        assertEquals("AAPL", allocation.get(0).get("stockSymbol"));
        assertEquals(1000.0, (double) allocation.get(0).get("value"));
    }

    @Test
    void testGetPortfolioSummary() {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);
        portfolio.setPortfolioName("Test");
        portfolio.setInitialCapital(500);

        Holdings holding = new Holdings();
        Stocks stock = new Stocks();
        stock.setStockId(1);
        holding.setStock(stock);
        holding.setQuantity(2);

        PriceHistory ph = new PriceHistory();
        ph.setPrice(100.0);

        when(portfolioRepository.findAll()).thenReturn(List.of(portfolio));
        when(holdingsRepository.findByPortfolioPortfolioId(1)).thenReturn(List.of(holding));
        when(priceHistoryRepository.findByStockStockIdOrderByCreatedAtDesc(1)).thenReturn(List.of(ph));

        List<Map<String, Object>> summary = portfolioService.getPortfolioSummary();

        assertEquals(1, summary.size());
        assertEquals("Test", summary.get(0).get("name"));
        assertEquals(700.0, (double) summary.get(0).get("totalCapital")); // 500 + 200
    }

    @Test
    void testCalculatePerformance() {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);

        Holdings holding = new Holdings();
        Stocks stock = new Stocks();
        stock.setStockId(1);
        holding.setStock(stock);
        holding.setQuantity(2);

        PriceHistory ph = new PriceHistory();
        ph.setPrice(100.0);

        Orders buyOrder = new Orders();
        buyOrder.setBuy_or_sell(Orders.BuySellType.BUY);
        buyOrder.setStatus_code(1);
        buyOrder.setPrice(90);
        buyOrder.setVolume(2);
        buyOrder.setFees(10);

        Orders sellOrder = new Orders();
        sellOrder.setBuy_or_sell(Orders.BuySellType.SELL);
        sellOrder.setStatus_code(1);
        sellOrder.setPrice(110);
        sellOrder.setVolume(1);
        sellOrder.setFees(5);

        when(ordersRepository.findByPortfoliosPortfolioId(1)).thenReturn(List.of(buyOrder, sellOrder));
        when(priceHistoryRepository.findByStockStockIdOrderByCreatedAtDesc(1)).thenReturn(List.of(ph));

        Map<String, Object> perf = portfolioService.calculatePerformance(1, List.of(holding));

        assertTrue((double) perf.get("totalInvested") > 0);
        assertTrue(perf.containsKey("totalGainLoss"));
    }

    @Test
    void testGetPortfolioDashboard() {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);
        portfolio.setInitialCapital(1000);
        portfolio.setPortfolioName("Dashboard Test");

        Holdings holding = new Holdings();
        Stocks stock = new Stocks();
        stock.setStockId(1);
        stock.setStockTicker("AAPL");
        stock.setStockName("Apple");
        holding.setStock(stock);
        holding.setQuantity(5);

        PriceHistory ph = new PriceHistory();
        ph.setPrice(100.0);

        Orders order = new Orders();
        order.setOrderId(2);
        order.setBuy_or_sell(Orders.BuySellType.BUY);
        order.setStatus_code(1);
        order.setPrice(100);
        order.setVolume(5);
        order.setFees(5);

        when(portfolioRepository.findById(1)).thenReturn(Optional.of(portfolio));
        when(holdingsRepository.findByPortfolioPortfolioId(1)).thenReturn(List.of(holding));
        when(priceHistoryRepository.findByStockStockIdOrderByCreatedAtDesc(1)).thenReturn(List.of(ph));
        when(ordersRepository.findByPortfoliosPortfolioId(1)).thenReturn(List.of(order));

        Map<String, Object> dashboard = portfolioService.getPortfolioDashboard(1);

        assertNotNull(dashboard.get("portfolio"));
        assertNotNull(dashboard.get("holdings"));
        assertNotNull(dashboard.get("performance"));
        assertNotNull(dashboard.get("allocation"));
        assertTrue((double) dashboard.get("totalValue") > 0);
    }

}
