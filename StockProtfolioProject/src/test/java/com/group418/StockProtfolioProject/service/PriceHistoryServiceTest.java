package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.PriceHistory;
import com.group418.StockProtfolioProject.repository.PriceHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PriceHistoryServiceTest {

    @Mock private PriceHistoryRepository repository;

    private PriceHistoryService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new PriceHistoryService(repository);
    }

    @Test
    void testGetPriceHistoryByStockId() {
        PriceHistory history = new PriceHistory();
        history.setPrice(123.45);
        when(repository.findByStockStockId(1)).thenReturn(List.of(history));

        List<PriceHistory> result = service.getPriceHistoryByStockId(1);

        assertEquals(123.45, result.get(0).getPrice());
    }

    @Test
    void testSavePriceHistory() {
        PriceHistory history = new PriceHistory();
        when(repository.save(history)).thenReturn(history);

        PriceHistory saved = service.savePriceHistory(history);

        assertNotNull(saved);
    }
}
