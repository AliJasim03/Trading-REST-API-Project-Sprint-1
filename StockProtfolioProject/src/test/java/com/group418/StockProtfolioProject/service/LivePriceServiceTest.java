package com.group418.StockProtfolioProject.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.test.util.ReflectionTestUtils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class LivePriceServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private ObjectMapper objectMapper;
    private LivePriceService livePriceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        objectMapper = new ObjectMapper();

        livePriceService = new LivePriceService();
        // inject mocks via reflection
        ReflectionTestUtils.setField(livePriceService, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(livePriceService, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(livePriceService, "apiKey", "demo");

    }

    @Test
    void testGetCurrentPriceSuccess() {
        String jsonResponse = """
            {
              "Global Quote": {
                "01. symbol": "AAPL",
                "02. open": "150.00",
                "03. high": "155.00",
                "04. low": "149.00",
                "05. price": "152.50",
                "06. volume": "1200000",
                "07. latest trading day": "2025-09-29",
                "08. previous close": "150.50",
                "09. change": "2.00",
                "10. change percent": "1.33%"
              }
            }
            """;

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);

        Map<String, Object> result = livePriceService.getCurrentPrice("AAPL");

        assertEquals("AAPL", result.get("symbol"));
        assertEquals(new BigDecimal("152.50"), result.get("price"));
        assertEquals("1.33", result.get("changePercent"));
    }

    @Test
    void testGetCurrentPriceApiError() {
        String jsonResponse = """
            { "Error Message": "Invalid API call" }
            """;

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> livePriceService.getCurrentPrice("FAKE"));
        assertTrue(ex.getMessage().contains("API Error"));
    }

    @Test
    void testGetMultiplePricesWithError() {
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenThrow(new RuntimeException("Network error"));

        List<Map<String, Object>> results = livePriceService.getMultiplePrices(List.of("AAPL", "GOOGL"));

        assertEquals(2, results.size());
        assertTrue(results.get(0).containsKey("error"));
    }

    @Test
    void testGetHistoricalDataDailySuccess() {
        String jsonResponse = """
            {
            "Time Series (Daily)": {
                "2025-09-30": {
                "1. open": "150.00",
                "2. high": "155.00",
                "3. low": "149.00",
                "4. close": "152.50",
                "5. volume": "1200000"
                },
                "2025-09-29": {
                "1. open": "148.00",
                "2. high": "150.00",
                "3. low": "147.00",
                "4. close": "149.50",
                "5. volume": "1000000"
                }
            }
            }
            """;

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);

        Map<String, Object> result = livePriceService.getHistoricalData("AAPL", "daily");

        assertEquals("AAPL", result.get("symbol"));
        assertEquals("daily", result.get("period"));
        List<Map<String, Object>> data = (List<Map<String, Object>>) result.get("data");
        assertEquals(2, data.size());
        // Ensure sorted by timestamp descending
        assertEquals("2025-09-30", data.get(0).get("timestamp"));
    }

    @Test
    void testGetHistoricalDataIntradaySuccess() {
        String jsonResponse = """
            {
            "Time Series (5min)": {
                "2025-09-30 15:55:00": {
                "1. open": "150.00",
                "2. high": "151.00",
                "3. low": "149.50",
                "4. close": "150.75",
                "5. volume": "5000"
                }
            }
            }
            """;

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);

        Map<String, Object> result = livePriceService.getHistoricalData("AAPL", "intraday");

        assertEquals("AAPL", result.get("symbol"));
        assertEquals("intraday", result.get("period"));
        List<Map<String, Object>> data = (List<Map<String, Object>>) result.get("data");
        assertEquals(1, data.size());
        assertEquals("2025-09-30 15:55:00", data.get(0).get("timestamp"));
    }

    @Test
    void testGetHistoricalDataNoData() {
        String jsonResponse = "{ }"; // missing time series

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> livePriceService.getHistoricalData("AAPL", "daily"));
        assertTrue(ex.getMessage().contains("No historical data"));
    }

    @Test
    void testSearchStocksSuccess() {
        String jsonResponse = """
            {
            "bestMatches": [
                {
                "1. symbol": "AAPL",
                "2. name": "Apple Inc.",
                "3. type": "Equity",
                "4. region": "United States",
                "8. currency": "USD"
                }
            ]
            }
            """;

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);

        List<Map<String, Object>> results = livePriceService.searchStocks("Apple");

        assertEquals(1, results.size());
        assertEquals("AAPL", results.get(0).get("symbol"));
        assertEquals("Apple Inc.", results.get(0).get("name"));
    }

    @Test
    void testSearchStocksNoMatches() {
        String jsonResponse = "{ }"; // missing bestMatches

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);

        List<Map<String, Object>> results = livePriceService.searchStocks("Unknown");
        assertTrue(results.isEmpty());
    }

    @Test
    void testGetTimeSeriesKey() {
        assertEquals("Time Series (5min)", ReflectionTestUtils.invokeMethod(livePriceService, "getTimeSeriesKey", "intraday"));
        assertEquals("Time Series (Daily)", ReflectionTestUtils.invokeMethod(livePriceService, "getTimeSeriesKey", "daily"));
        assertEquals("Time Series (Daily)", ReflectionTestUtils.invokeMethod(livePriceService, "getTimeSeriesKey", "anythingElse"));
    }

    @Test
    void testGetPopularStocks() {
        // Mock getCurrentPrice to avoid hitting external API
        Map<String, Object> mockPrice = new HashMap<>();
        mockPrice.put("symbol", "AAPL");
        mockPrice.put("price", new BigDecimal("100.00"));

        LivePriceService spyService = spy(livePriceService);
        doReturn(mockPrice).when(spyService).getCurrentPrice(anyString());

        List<Map<String, Object>> results = spyService.getPopularStocks();

        assertFalse(results.isEmpty());
        assertEquals("AAPL", results.get(0).get("symbol"));
    }

    @Test
    void testGetIntradayDataDelegatesToHistorical() {
        LivePriceService spyService = spy(livePriceService);
        Map<String, Object> mockResult = Map.of("symbol", "AAPL", "period", "intraday");
        doReturn(mockResult).when(spyService).getHistoricalData("AAPL", "intraday");

        Map<String, Object> result = spyService.getIntradayData("AAPL");
        assertEquals("intraday", result.get("period"));
    }

    @Test
    void testGetDailyDataDelegatesToHistorical() {
        LivePriceService spyService = spy(livePriceService);
        Map<String, Object> mockResult = Map.of("symbol", "AAPL", "period", "daily");
        doReturn(mockResult).when(spyService).getHistoricalData("AAPL", "daily");

        Map<String, Object> result = spyService.getDailyData("AAPL");
        assertEquals("daily", result.get("period"));
    }

}

