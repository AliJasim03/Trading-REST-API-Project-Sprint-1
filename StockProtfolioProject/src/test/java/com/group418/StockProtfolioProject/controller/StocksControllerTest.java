package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.PriceHistory;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.service.PriceHistoryService;
import com.group418.StockProtfolioProject.service.StocksService;
import com.group418.StockProtfolioProject.service.FinnhubService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StocksController.class)
class StocksControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StocksService stocksService;

    @MockBean
    private PriceHistoryService priceHistoryService;

    @MockBean
    private FinnhubService finnhubService;

    @Test
    void testGetAllStocks() throws Exception {
        Stocks stock = new Stocks();
        stock.setStockId(1);
        stock.setStockTicker("AAPL");

        when(stocksService.getAllStocks()).thenReturn(List.of(stock));

        mockMvc.perform(get("/stocks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stockTicker").value("AAPL"));
    }

    @Test
    void testGetStockById() throws Exception {
        Stocks stock = new Stocks();
        stock.setStockId(1);
        stock.setStockTicker("TSLA");

        when(stocksService.getStockById(1)).thenReturn(stock);

        mockMvc.perform(get("/stocks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockTicker").value("TSLA"));
    }

    
    @Test
    void testGetPriceHistory() throws Exception {
        PriceHistory history = new PriceHistory();
        history.setPriceId(1);
        history.setPrice(123.45);

        when(priceHistoryService.getPriceHistoryByStockId(1)).thenReturn(List.of(history));

        mockMvc.perform(get("/stocks/1/price-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].priceId").value(1))
                .andExpect(jsonPath("$[0].price").value(123.45));
    }


    @Test
    void testCreateStock() throws Exception {
        Stocks stock = new Stocks();
        stock.setStockId(1);
        stock.setStockTicker("GOOG");

        when(stocksService.createStock(any())).thenReturn(stock);

        mockMvc.perform(post("/stocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stockTicker\":\"GOOG\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockTicker").value("GOOG"));
    }

    @Test
    void testUpdateStock() throws Exception {
        Stocks stock = new Stocks();
        stock.setStockId(1);
        stock.setStockTicker("AMZN");

        when(stocksService.updateStock(eq(1), any())).thenReturn(stock);

        mockMvc.perform(put("/stocks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stockTicker\":\"AMZN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockTicker").value("AMZN"));
    }

    @Test
    void testDeleteStock() throws Exception {
        doNothing().when(stocksService).deleteStock(1);

        mockMvc.perform(delete("/stocks/1"))
                .andExpect(status().isNoContent());
    }
}
