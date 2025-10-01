package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.*;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WatchlistServiceTest {

    @Mock private WatchlistRepository watchlistRepository;
    @Mock private StocksRepository stocksRepository;

    private WatchlistService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new WatchlistService();
        ReflectionTestUtils.setField(service, "watchlistRepository", watchlistRepository);
        ReflectionTestUtils.setField(service, "stocksRepository", stocksRepository);
    }

    @Test
    void testAddToWatchlistSuccess() {
        Stocks stock = new Stocks();
        stock.setStockId(1);
        when(stocksRepository.findById(1)).thenReturn(Optional.of(stock));
        when(watchlistRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        WatchlistEntry result = service.addToWatchlist(1L, 1L, BigDecimal.valueOf(150), AlertDirection.BELOW);

        assertEquals(stock, result.getStock());
        assertEquals(BigDecimal.valueOf(150), result.getTargetPrice());
    }

    @Test
    void testAddToWatchlistStockNotFound() {
        when(stocksRepository.findById(anyInt())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.addToWatchlist(1L, 1L, BigDecimal.TEN, AlertDirection.ABOVE));
    }

    @Test
    void testRemoveFromWatchlist() {
        service.removeFromWatchlist(5L);

        verify(watchlistRepository).deleteById(5L);
    }
}
