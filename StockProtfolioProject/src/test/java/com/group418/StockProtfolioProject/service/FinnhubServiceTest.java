package com.group418.StockProtfolioProject.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinnhubServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Spy
    private ObjectMapper objectMapper;

    @InjectMocks
    private FinnhubService finnhubService;

    @BeforeEach
    void setUp() {
        // Inject the mocked RestTemplate and ObjectMapper into the service
        ReflectionTestUtils.setField(finnhubService, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(finnhubService, "objectMapper", objectMapper);
    }

    @Test
    void testGetQuote_Success() {
        // Arrange
        String symbol = "AAPL";
        String mockResponse = """
            {
                "c": 150.25,
                "d": 2.50,
                "dp": 1.69,
                "h": 152.00,
                "l": 148.50,
                "o": 149.00,
                "pc": 147.75,
                "t": 1609459200
            }
            """;

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act
        Map<String, Object> result = finnhubService.getQuote(symbol);

        // Assert
        assertNotNull(result);
        assertEquals("AAPL", result.get("symbol"));
        assertEquals(150.25, result.get("currentPrice"));
        assertEquals(2.50, result.get("change"));
        assertEquals(1.69, result.get("percentChange"));
        assertEquals(152.00, result.get("high"));
        assertEquals(148.50, result.get("low"));
        assertEquals(149.00, result.get("open"));
        assertEquals(147.75, result.get("previousClose"));
        assertEquals(1609459200L, result.get("timestamp"));

        verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
    }

    @Test
    void testGetQuote_ConvertsSymbolToUpperCase() {
        // Arrange
        String symbol = "aapl";
        String mockResponse = """
            {
                "c": 150.25,
                "d": 2.50,
                "dp": 1.69,
                "h": 152.00,
                "l": 148.50,
                "o": 149.00,
                "pc": 147.75,
                "t": 1609459200
            }
            """;

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act
        Map<String, Object> result = finnhubService.getQuote(symbol);

        // Assert
        assertEquals("AAPL", result.get("symbol"));
    }

    @Test
    void testGetQuote_HttpClientErrorException() {
        // Arrange
        String symbol = "INVALID";
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            finnhubService.getQuote(symbol);
        });

        assertTrue(exception.getMessage().contains("Failed to fetch quote from Finnhub"));
        verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
    }

    @Test
    void testGetQuote_GenericException() throws Exception {
        // Arrange
        String symbol = "AAPL";
        String mockResponse = "invalid json";

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            finnhubService.getQuote(symbol);
        });

        assertTrue(exception.getMessage().contains("Error processing Finnhub data"));
    }

    @Test
    void testGetCompanyProfile_Success() {
        // Arrange
        String symbol = "TSLA";
        String mockResponse = """
            {
                "name": "Tesla Inc",
                "ticker": "TSLA",
                "exchange": "NASDAQ",
                "finnhubIndustry": "Automobiles",
                "logo": "https://example.com/logo.png",
                "marketCapitalization": 800000.0,
                "shareOutstanding": 1000.0,
                "currency": "USD"
            }
            """;

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act
        Map<String, Object> result = finnhubService.getCompanyProfile(symbol);

        // Assert
        assertNotNull(result);
        assertEquals("Tesla Inc", result.get("name"));
        assertEquals("TSLA", result.get("ticker"));
        assertEquals("NASDAQ", result.get("exchange"));
        assertEquals("Automobiles", result.get("industry"));
        assertEquals("https://example.com/logo.png", result.get("logo"));
        assertEquals(800000.0, result.get("marketCapitalization"));
        assertEquals(1000.0, result.get("shareOutstanding"));
        assertEquals("USD", result.get("currency"));

        verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
    }

    @Test
    void testGetCompanyProfile_ConvertsSymbolToUpperCase() {
        // Arrange
        String symbol = "tsla";
        String mockResponse = """
            {
                "name": "Tesla Inc",
                "ticker": "TSLA",
                "exchange": "NASDAQ",
                "finnhubIndustry": "Automobiles",
                "logo": "https://example.com/logo.png",
                "marketCapitalization": 800000.0,
                "shareOutstanding": 1000.0,
                "currency": "USD"
            }
            """;

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act
        Map<String, Object> result = finnhubService.getCompanyProfile(symbol);

        // Assert
        assertNotNull(result);
        verify(restTemplate, times(1)).getForEntity(contains("TSLA"), eq(String.class));
    }

    @Test
    void testGetCompanyProfile_HttpClientErrorException() {
        // Arrange
        String symbol = "INVALID";
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Bad Request"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            finnhubService.getCompanyProfile(symbol);
        });

        assertTrue(exception.getMessage().contains("Failed to fetch company profile"));
        verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
    }

    @Test
    void testGetCompanyProfile_GenericException() {
        // Arrange
        String symbol = "AAPL";
        String mockResponse = "invalid json";

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            finnhubService.getCompanyProfile(symbol);
        });

        assertTrue(exception.getMessage().contains("Error processing company profile"));
    }

    @Test
    void testGetQuote_EmptyResponse() {
        // Arrange
        String symbol = "AAPL";
        String mockResponse = "{}";

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act
        Map<String, Object> result = finnhubService.getQuote(symbol);

        // Assert
        assertNotNull(result);
        assertEquals("AAPL", result.get("symbol"));
        assertEquals(0.0, result.get("currentPrice")); // default value for missing fields
    }

    @Test
    void testGetCompanyProfile_EmptyResponse() {
        // Arrange
        String symbol = "AAPL";
        String mockResponse = "{}";

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act
        Map<String, Object> result = finnhubService.getCompanyProfile(symbol);

        // Assert
        assertNotNull(result);
        assertEquals("", result.get("name")); // default value for missing string fields
        assertEquals(0.0, result.get("marketCapitalization")); // default value for missing numeric fields
    }
}