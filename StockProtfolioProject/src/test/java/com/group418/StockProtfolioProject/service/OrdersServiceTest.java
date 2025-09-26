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
}
