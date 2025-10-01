package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.OrdersRepository;
import com.group418.StockProtfolioProject.repository.PortfolioRepository;
import com.group418.StockProtfolioProject.repository.StocksRepository;
import com.group418.StockProtfolioProject.repository.HoldingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

class OrdersServiceTest {

    private OrdersRepository ordersRepository;
    private PortfolioRepository portfolioRepository;
    private StocksRepository stocksRepository;
    private OrdersService ordersService;
    private HoldingsRepository holdingsRepository;

    @BeforeEach
    void setUp() {
        ordersRepository = mock(OrdersRepository.class);
        portfolioRepository = mock(PortfolioRepository.class);
        stocksRepository = mock(StocksRepository.class);
        holdingsRepository = mock(HoldingsRepository.class);
        ordersService = new OrdersService(ordersRepository, stocksRepository, portfolioRepository, holdingsRepository);
    }

    @Test
    void placeOrder_successful() {
        Portfolios p = new Portfolios();
        p.setPortfolioId(1);

        Stocks s = new Stocks();
        s.setStockTicker("T");

        Orders req = new Orders();
        req.setVolume(5);

        when(portfolioRepository.findById(1)).thenReturn(Optional.of(p));
        when(stocksRepository.findById(2)).thenReturn(Optional.of(s));
        when(ordersRepository.save(any(Orders.class))).thenAnswer(i -> i.getArgument(0));

        Orders result = ordersService.placeOrder(1, 2, req);

        assertThat(result).isNotNull();
        assertThat(result.getVolume()).isEqualTo(5);
        assertThat(result.getPortfolio()).isEqualTo(p);
        assertThat(result.getStock()).isEqualTo(s);

        verify(ordersRepository, times(1)).save(req);
    }

    @Test
    void placeOrder_portfolioNotFound_throws() {
        when(portfolioRepository.findById(1)).thenReturn(Optional.empty());

        Orders req = new Orders();

        assertThrows(ResourceNotFoundException.class, () -> ordersService.placeOrder(1, 2, req));

        verify(ordersRepository, never()).save(any());
    }

    @Test
    void getTradingHistory_returnsList() {
        Orders o = new Orders();
        when(ordersRepository.findByPortfoliosPortfolioId(1)).thenReturn(Collections.singletonList(o));

        assertThat(ordersService.getTradingHistory(1)).hasSize(1);
    }

    @Test
    void getOrderStatus_found() {
        Orders o = new Orders();
        when(ordersRepository.findById(5)).thenReturn(Optional.of(o));

        Orders result = ordersService.getOrderStatus(5);
        assertThat(result).isSameAs(o);
    }

    @Test
    void getOrderStatus_notFound_throws() {
        when(ordersRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> ordersService.getOrderStatus(999));
    }

    @Test
    void getAllOrders_returnsList() {
        Orders o1 = new Orders();
        Orders o2 = new Orders();
        when(ordersRepository.findAll()).thenReturn(java.util.List.of(o1, o2));

        assertThat(ordersService.getAllOrders()).hasSize(2);
        verify(ordersRepository, times(1)).findAll();
    }

    @Test
    void updateOrderStatus_validTransitionToFilled_updatesPortfolioAndHoldings() {
        Portfolios portfolio = new Portfolios();
        portfolio.setInitialCapital(1000);

        Stocks stock = new Stocks();
        stock.setStockId(10);

        Orders order = new Orders();
        order.setOrderId(1);
        order.setPortfolio(portfolio);
        order.setStock(stock);
        order.setStatusCode(0); // pending
        order.setPrice(100);
        order.setVolume(2);
        order.setFees(10);
        order.setBuy_or_sell(Orders.BuySellType.BUY);

        when(ordersRepository.findById(1)).thenReturn(Optional.of(order));
        when(ordersRepository.save(any(Orders.class))).thenAnswer(inv -> inv.getArgument(0));
        when(holdingsRepository.findByPortfolioPortfolioIdAndStockStockId(anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        Orders updated = ordersService.updateOrderStatus(1, 1);

        assertThat(updated.getStatus_code()).isEqualTo(1);
        assertThat(portfolio.getInitialCapital()).isLessThan(1000); // spent money
        verify(holdingsRepository, times(1)).save(any());
    }

    @Test
    void updateOrderStatus_invalidCode_throws() {
        Orders order = new Orders();
        order.setStatusCode(0);
        when(ordersRepository.findById(1)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class,
                () -> ordersService.updateOrderStatus(1, 99));
    }

    @Test
    void updateHoldings_buyNewStock_createsHolding() {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);

        Stocks stock = new Stocks();
        stock.setStockId(5);

        Orders order = new Orders();
        order.setPortfolio(portfolio);
        order.setStock(stock);
        order.setVolume(10);
        order.setBuy_or_sell(Orders.BuySellType.BUY);

        when(holdingsRepository.findByPortfolioPortfolioIdAndStockStockId(1, 5)).thenReturn(Optional.empty());

        // call via reflection since it's private
        org.springframework.test.util.ReflectionTestUtils.invokeMethod(ordersService, "updateHoldings", order);

        verify(holdingsRepository, times(1)).save(any());
    }

    @Test
    void updateHoldings_sellTooManyShares_throws() {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);

        Stocks stock = new Stocks();
        stock.setStockId(5);

        Orders order = new Orders();
        order.setPortfolio(portfolio);
        order.setStock(stock);
        order.setVolume(10);
        order.setBuy_or_sell(Orders.BuySellType.SELL);

        com.group418.StockProtfolioProject.entity.Holdings holding = new com.group418.StockProtfolioProject.entity.Holdings();
        holding.setQuantity(5);

        when(holdingsRepository.findByPortfolioPortfolioIdAndStockStockId(1, 5)).thenReturn(Optional.of(holding));

        assertThrows(IllegalArgumentException.class,
                () -> org.springframework.test.util.ReflectionTestUtils.invokeMethod(ordersService, "updateHoldings", order));
    }

    @Test
    void reverseHoldings_reversesBuy() {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);

        Stocks stock = new Stocks();
        stock.setStockId(5);

        Orders order = new Orders();
        order.setPortfolio(portfolio);
        order.setStock(stock);
        order.setVolume(5);
        order.setBuy_or_sell(Orders.BuySellType.BUY);

        com.group418.StockProtfolioProject.entity.Holdings holding = new com.group418.StockProtfolioProject.entity.Holdings();
        holding.setQuantity(5);

        when(holdingsRepository.findByPortfolioPortfolioIdAndStockStockId(1, 5)).thenReturn(Optional.of(holding));

        org.springframework.test.util.ReflectionTestUtils.invokeMethod(ordersService, "reverseHoldings", order);

        verify(holdingsRepository).delete(any());
    }

    @Test
    void updatePortfolioCapital_buySubtractsCapital() {
        Portfolios portfolio = new Portfolios();
        portfolio.setInitialCapital(1000);

        Orders order = new Orders();
        order.setPortfolio(portfolio);
        order.setPrice(50);
        order.setVolume(2);
        order.setFees(10);
        order.setBuy_or_sell(Orders.BuySellType.BUY);

        org.springframework.test.util.ReflectionTestUtils.invokeMethod(ordersService, "updatePortfolioCapital", order);

        assertThat(portfolio.getInitialCapital()).isEqualTo(1000 - (50*2 + 10));
    }

    @Test
    void reversePortfolioCapital_sellSubtractsCapital() {
        Portfolios portfolio = new Portfolios();
        portfolio.setInitialCapital(1000);

        Orders order = new Orders();
        order.setPortfolio(portfolio);
        order.setPrice(50);
        order.setVolume(2);
        order.setFees(10);
        order.setBuy_or_sell(Orders.BuySellType.SELL);

        org.springframework.test.util.ReflectionTestUtils.invokeMethod(ordersService, "reversePortfolioCapital", order);

        assertThat(portfolio.getInitialCapital()).isEqualTo(1000 - (50*2) + 10);
    }
}
