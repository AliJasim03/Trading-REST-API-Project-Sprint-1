package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.service.LivePriceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LivePriceController.class)
class LivePriceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @SuppressWarnings("removal")
    @MockBean
    private LivePriceService livePriceService;

    @Test
    void testGetCurrentPrice() throws Exception {
        when(livePriceService.getCurrentPrice("AAPL"))
                .thenReturn(Map.of("symbol", "AAPL", "price", 150));

        mockMvc.perform(get("/api/live-prices/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(150));
    }

    @Test
    void testGetMultiplePrices() throws Exception {
        when(livePriceService.getMultiplePrices(List.of("AAPL", "TSLA")))
                .thenReturn(List.of(Map.of("symbol", "AAPL"), Map.of("symbol", "TSLA")));

        mockMvc.perform(post("/api/live-prices/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[\"AAPL\",\"TSLA\"]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));
    }

    @Test
    void testGetPopularStocks() throws Exception {
        when(livePriceService.getPopularStocks())
                .thenReturn(List.of(Map.of("symbol", "NFLX")));

        mockMvc.perform(get("/api/live-prices/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("NFLX"));
    }

    @Test
    void testGetHistoricalData() throws Exception {
        when(livePriceService.getHistoricalData("AAPL", "daily"))
                .thenReturn(Map.of("period", "daily"));

        mockMvc.perform(get("/api/live-prices/AAPL/history?period=daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("daily"));
    }

    @Test
    void testSearchStocks() throws Exception {
        when(livePriceService.searchStocks("apple"))
                .thenReturn(List.of(Map.of("symbol", "AAPL")));

        mockMvc.perform(get("/api/live-prices/search?q=apple"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));
    }

    @Test
    void testGetIntradayData() throws Exception {
        when(livePriceService.getIntradayData("AAPL"))
                .thenReturn(Map.of("symbol", "AAPL", "intraday", true));

        mockMvc.perform(get("/api/live-prices/AAPL/intraday"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.intraday").value(true));
    }

}

