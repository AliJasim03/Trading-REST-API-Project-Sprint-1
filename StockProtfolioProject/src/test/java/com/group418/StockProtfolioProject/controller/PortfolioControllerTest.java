package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.service.PortfolioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortfolioController.class)
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PortfolioService portfolioService;

    @Test
    void testGetAllPortfolios() throws Exception {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);
        portfolio.setPortfolioName("Growth Fund");

        when(portfolioService.getAllPortfolios()).thenReturn(List.of(portfolio));

        mockMvc.perform(get("/portfolios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].portfolioName").value("Growth Fund"));
    }

    @Test
    void testCreatePortfolio() throws Exception {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);
        portfolio.setPortfolioName("Retirement");

        when(portfolioService.createPortfolio(any())).thenReturn(portfolio);

        mockMvc.perform(post("/portfolios/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"portfolioName\":\"Retirement\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.portfolioName").value("Retirement"));
    }

    @Test
    void testDeletePortfolio() throws Exception {
        doNothing().when(portfolioService).deletePortfolio(1);

        mockMvc.perform(delete("/portfolios/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetPortfolioDashboard() throws Exception {
        when(portfolioService.getPortfolioDashboard(1))
                .thenReturn(Map.of("totalValue", 10000));

        mockMvc.perform(get("/portfolios/1/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalValue").value(10000));
    }

    @Test
    void testGetPortfolioSummary() throws Exception {
        when(portfolioService.getPortfolioSummary())
                .thenReturn(List.of(Map.of("portfolio", "Summary1")));

        mockMvc.perform(get("/portfolios/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].portfolio").value("Summary1"));
    }

    @Test
    void testGetPortfolioById() throws Exception {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioId(1);
        portfolio.setPortfolioName("Tech Portfolio");

        when(portfolioService.getPortfolioById(1)).thenReturn(portfolio);

        mockMvc.perform(get("/portfolios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.portfolioName").value("Tech Portfolio"));
    }

    @Test
    void testUpdatePortfolio_Success() throws Exception {
        Portfolios updated = new Portfolios();
        updated.setPortfolioId(1);
        updated.setPortfolioName("Updated Name");

        when(portfolioService.updatePortfolio(eq(1), any())).thenReturn(updated);

        mockMvc.perform(put("/portfolios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"portfolioName\":\"Updated Name\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.portfolioName").value("Updated Name"));
    }

    @Test
    void testUpdatePortfolio_ValidationError() throws Exception {
        when(portfolioService.updatePortfolio(eq(1), any()))
                .thenThrow(new IllegalArgumentException("Invalid update"));

        mockMvc.perform(put("/portfolios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"portfolioName\":\"Bad Update\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.message").value("Invalid update"));
    }

    @Test
    void testGetPortfolioPerformance() throws Exception {
        Map<String, Object> performance = new HashMap<>();
        performance.put("return", 15.0);

        when(portfolioService.getPortfolioHoldings(1)).thenReturn(Collections.emptyList());
        when(portfolioService.calculatePerformance(eq(1), anyList())).thenReturn(performance);

        mockMvc.perform(get("/portfolios/1/performance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.return").value(15.0));
    }

    @Test
    void testGetPortfolioAllocation() throws Exception {
        List<Map<String, Object>> allocation = new ArrayList<>();
        allocation.add(Map.of("sector", "Technology", "percentage", 70));

        when(portfolioService.getPortfolioHoldings(1)).thenReturn(Collections.emptyList());
        when(portfolioService.calculateAllocation(anyList())).thenReturn(allocation);

        mockMvc.perform(get("/portfolios/1/allocation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sector").value("Technology"))
                .andExpect(jsonPath("$[0].percentage").value(70));
    }
}
