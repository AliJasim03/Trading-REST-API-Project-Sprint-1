package com.group418.StockProtfolioProject.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Service
public class FinnhubService {

    private static final String FINNHUB_API_KEY = "d3efm4pr01qrd38u8800d3efm4pr01qrd38u880g";
    private static final String FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public FinnhubService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get real-time quote for a stock symbol
     * @param symbol Stock ticker symbol (e.g., AAPL, TSLA)
     * @return Map containing current price, high, low, open, previous close, and change
     */
    public Map<String, Object> getQuote(String symbol) {
        try {
            String url = String.format("%s/quote?symbol=%s&token=%s",
                    FINNHUB_BASE_URL, symbol.toUpperCase(), FINNHUB_API_KEY);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            Map<String, Object> quote = new HashMap<>();
            quote.put("symbol", symbol.toUpperCase());
            quote.put("currentPrice", root.path("c").asDouble());
            quote.put("change", root.path("d").asDouble());
            quote.put("percentChange", root.path("dp").asDouble());
            quote.put("high", root.path("h").asDouble());
            quote.put("low", root.path("l").asDouble());
            quote.put("open", root.path("o").asDouble());
            quote.put("previousClose", root.path("pc").asDouble());
            quote.put("timestamp", root.path("t").asLong());

            return quote;
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Failed to fetch quote from Finnhub: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error processing Finnhub data: " + e.getMessage());
        }
    }

    /**
     * Get company profile information
     * @param symbol Stock ticker symbol
     * @return Map containing company information
     */
    public Map<String, Object> getCompanyProfile(String symbol) {
        try {
            String url = String.format("%s/stock/profile2?symbol=%s&token=%s",
                    FINNHUB_BASE_URL, symbol.toUpperCase(), FINNHUB_API_KEY);

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            Map<String, Object> profile = new HashMap<>();
            profile.put("name", root.path("name").asText());
            profile.put("ticker", root.path("ticker").asText());
            profile.put("exchange", root.path("exchange").asText());
            profile.put("industry", root.path("finnhubIndustry").asText());
            profile.put("logo", root.path("logo").asText());
            profile.put("marketCapitalization", root.path("marketCapitalization").asDouble());
            profile.put("shareOutstanding", root.path("shareOutstanding").asDouble());
            profile.put("currency", root.path("currency").asText());

            return profile;
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Failed to fetch company profile: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error processing company profile: " + e.getMessage());
        }
    }
}