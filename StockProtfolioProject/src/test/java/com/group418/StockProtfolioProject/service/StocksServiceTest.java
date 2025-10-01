package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.StocksRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StocksServiceTest {

    @Mock private StocksRepository repository;

    private StocksService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new StocksService(repository);
    }

    @Test
    void testGetStockByIdFound() {
        Stocks stock = new Stocks();
        stock.setStockId(1);
        when(repository.findById(1)).thenReturn(Optional.of(stock));

        Stocks result = service.getStockById(1);

        assertEquals(1, result.getStockId());
    }

    @Test
    void testGetStockByIdNotFound() {
        when(repository.findById(1)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getStockById(1));
    }

    @Test
    void testCreateStockSetsTimestamp() {
        Stocks stock = new Stocks();
        when(repository.save(any())).thenReturn(stock);

        Stocks saved = service.createStock(stock);

        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void testGetAllStocks() {
        Stocks stock1 = new Stocks();
        stock1.setStockId(1);
        Stocks stock2 = new Stocks();
        stock2.setStockId(2);

        when(repository.findAll()).thenReturn(Arrays.asList(stock1, stock2));

        List<Stocks> result = service.getAllStocks();

        assertEquals(2, result.size());
        assertEquals(1, result.get(0).getStockId());
        assertEquals(2, result.get(1).getStockId());
    }

    @Test
    void testUpdateStock() {
        Stocks existing = new Stocks();
        existing.setStockId(1);
        existing.setStockTicker("OLD");

        Stocks update = new Stocks();
        update.setStockTicker("NEW");
        update.setStockName("New Name");
        update.setSector("Tech");
        update.setMarket("NASDAQ");
        update.setCurrency("USD");
        update.setIsin("US1234567890");
        update.setCusip("123456");

        when(repository.findById(1)).thenReturn(Optional.of(existing));
        when(repository.save(any(Stocks.class))).thenAnswer(i -> i.getArgument(0));

        Stocks result = service.updateStock(1, update);

        assertEquals("NEW", result.getStockTicker());
        assertEquals("New Name", result.getStockName());
        assertEquals("Tech", result.getSector());
        assertEquals("NASDAQ", result.getMarket());
        assertEquals("USD", result.getCurrency());
        assertEquals("US1234567890", result.getIsin());
        assertEquals("123456", result.getCusip());
        verify(repository, times(1)).save(existing);
    }

    @Test
    void testDeleteStock() {
        Stocks stock = new Stocks();
        stock.setStockId(1);

        when(repository.findById(1)).thenReturn(Optional.of(stock));

        service.deleteStock(1);

        verify(repository, times(1)).delete(stock);
    }

    @Test
    void testDeleteStockNotFoundThrows() {
        when(repository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.deleteStock(999));

        verify(repository, never()).delete(any());
    }
}
