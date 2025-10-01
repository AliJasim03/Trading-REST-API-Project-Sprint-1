package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.AlertDirection;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import com.group418.StockProtfolioProject.service.WatchlistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WatchlistController.class)
class WatchlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WatchlistService watchlistService;

    @Test
    void testAddToWatchlist() throws Exception {
        WatchlistEntry entry = new WatchlistEntry();
        entry.setId(1L);
        entry.setTargetPrice(BigDecimal.valueOf(150));
        entry.setAlertDirection(AlertDirection.ABOVE);

        when(watchlistService.addToWatchlist(1L, 100L, BigDecimal.valueOf(150), AlertDirection.ABOVE))
                .thenReturn(entry);

        mockMvc.perform(post("/api/watchlist")
                        .param("id", "1")
                        .param("stockId", "100")
                        .param("targetPrice", "150")
                        .param("direction", "ABOVE")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targetPrice").value(150))
                .andExpect(jsonPath("$.alertDirection").value("ABOVE"));
    }

    @Test
    void testRemoveFromWatchlist() throws Exception {
        doNothing().when(watchlistService).removeFromWatchlist(1L);

        mockMvc.perform(delete("/api/watchlist/1"))
                .andExpect(status().isNoContent());
    }
}
