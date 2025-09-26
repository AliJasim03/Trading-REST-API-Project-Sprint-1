package com.group418.StockProtfolioProject.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
public class LivePriceService {

    @Value("${alphavantage.api.key:demo}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Cache to avoid hitting API limits
    private final Map<String, CachedPriceData> priceCache = new ConcurrentHashMap<>();
    private final long CACHE_DURATION_MS = 60000; // 1 minute cache

    // Popular stock symbols for demo
    private final List<String> defaultSymbols = Arrays.asList(
            "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX"
    );

    public LivePriceService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get current price for a symbol using Alpha Vantage Global Quote API
     */
    public Map<String, Object> getCurrentPrice(String symbol) {
        try {
            // Check cache first
            CachedPriceData cached = priceCache.get(symbol);
            if (cached != null && !cached.isExpired()) {
                return cached.getData();
            }

            String url = String.format(
                    "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=%s&apikey=%s",
                    symbol, apiKey
            );

            String response = restTemplate.getForObject(url, String.class);
            JsonNode rootNode = objectMapper.readTree(response);

            // Check for API errors
            if (rootNode.has("Error Message")) {
                throw new RuntimeException("API Error: " + rootNode.get("Error Message").asText());
            }

            if (rootNode.has("Note")) {
                throw new RuntimeException("API Rate limit exceeded. Please try again later.");
            }

            JsonNode quote = rootNode.get("Global Quote");
            if (quote == null || quote.isEmpty()) {
                throw new RuntimeException("No data found for symbol: " + symbol);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("symbol", quote.get("01. symbol").asText());
            result.put("price", new BigDecimal(quote.get("05. price").asText()));
            result.put("change", new BigDecimal(quote.get("09. change").asText()));
            result.put("changePercent", quote.get("10. change percent").asText().replace("%", ""));
            result.put("open", new BigDecimal(quote.get("02. open").asText()));
            result.put("high", new BigDecimal(quote.get("03. high").asText()));
            result.put("low", new BigDecimal(quote.get("04. low").asText()));
            result.put("volume", Long.parseLong(quote.get("06. volume").asText()));
            result.put("previousClose", new BigDecimal(quote.get("08. previous close").asText()));
            result.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            result.put("lastTradingDay", quote.get("07. latest trading day").asText());

            // Cache the result
            priceCache.put(symbol, new CachedPriceData(result));

            return result;

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch price data for " + symbol + ": " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error processing price data for " + symbol + ": " + e.getMessage());
        }
    }

    /**
     * Get multiple stock prices
     */
    public List<Map<String, Object>> getMultiplePrices(List<String> symbols) {
        List<Map<String, Object>> results = new ArrayList<>();

        for (String symbol : symbols) {
            try {
                results.add(getCurrentPrice(symbol));
                // Small delay to avoid hitting rate limits
                Thread.sleep(200);
            } catch (Exception e) {
                // Add error entry but continue with other symbols
                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("symbol", symbol);
                errorResult.put("error", e.getMessage());
                results.add(errorResult);
            }
        }

        return results;
    }

    /**
     * Get default/popular stocks for the dashboard
     */
    public List<Map<String, Object>> getPopularStocks() {
        return getMultiplePrices(defaultSymbols);
    }

    /**
     * Get historical price data for charts using Alpha Vantage Daily API
     */
    public Map<String, Object> getHistoricalData(String symbol, String period) {
        try {
            String function = period.equals("intraday") ? "TIME_SERIES_INTRADAY" : "TIME_SERIES_DAILY";
            String interval = period.equals("intraday") ? "&interval=5min" : "";

            String url = String.format(
                    "https://www.alphavantage.co/query?function=%s&symbol=%s%s&apikey=%s",
                    function, symbol, interval, apiKey
            );

            String response = restTemplate.getForObject(url, String.class);
            JsonNode rootNode = objectMapper.readTree(response);

            // Check for API errors
            if (rootNode.has("Error Message")) {
                throw new RuntimeException("API Error: " + rootNode.get("Error Message").asText());
            }

            if (rootNode.has("Note")) {
                throw new RuntimeException("API Rate limit exceeded. Please try again later.");
            }

            JsonNode timeSeries = rootNode.get(getTimeSeriesKey(period));
            if (timeSeries == null) {
                throw new RuntimeException("No historical data found for symbol: " + symbol);
            }

            List<Map<String, Object>> dataPoints = new ArrayList<>();
            Iterator<Map.Entry<String, JsonNode>> fields = timeSeries.fields();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String timestamp = entry.getKey();
                JsonNode priceData = entry.getValue();

                Map<String, Object> dataPoint = new HashMap<>();
                dataPoint.put("timestamp", timestamp);
                dataPoint.put("open", new BigDecimal(priceData.get("1. open").asText()));
                dataPoint.put("high", new BigDecimal(priceData.get("2. high").asText()));
                dataPoint.put("low", new BigDecimal(priceData.get("3. low").asText()));
                dataPoint.put("close", new BigDecimal(priceData.get("4. close").asText()));
                dataPoint.put("volume", Long.parseLong(priceData.get("5. volume").asText()));

                dataPoints.add(dataPoint);
            }

            // Sort by timestamp (newest first)
            dataPoints.sort((a, b) -> ((String)b.get("timestamp")).compareTo((String)a.get("timestamp")));

            Map<String, Object> result = new HashMap<>();
            result.put("symbol", symbol);
            result.put("data", dataPoints);
            result.put("period", period);
            result.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch historical data for " + symbol + ": " + e.getMessage());
        }
    }

    /**
     * Get intraday data for real-time charts
     */
    public Map<String, Object> getIntradayData(String symbol) {
        return getHistoricalData(symbol, "intraday");
    }

    /**
     * Get daily data for longer-term charts
     */
    public Map<String, Object> getDailyData(String symbol) {
        return getHistoricalData(symbol, "daily");
    }

    /**
     * Search for stocks by keyword
     */
    public List<Map<String, Object>> searchStocks(String keyword) {
        try {
            String url = String.format(
                    "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=%s&apikey=%s",
                    keyword, apiKey
            );

            String response = restTemplate.getForObject(url, String.class);
            JsonNode rootNode = objectMapper.readTree(response);

            JsonNode bestMatches = rootNode.get("bestMatches");
            if (bestMatches == null) {
                return new ArrayList<>();
            }

            List<Map<String, Object>> results = new ArrayList<>();
            for (JsonNode match : bestMatches) {
                Map<String, Object> stockInfo = new HashMap<>();
                stockInfo.put("symbol", match.get("1. symbol").asText());
                stockInfo.put("name", match.get("2. name").asText());
                stockInfo.put("type", match.get("3. type").asText());
                stockInfo.put("region", match.get("4. region").asText());
                stockInfo.put("currency", match.get("8. currency").asText());
                results.add(stockInfo);
            }

            return results;

        } catch (Exception e) {
            throw new RuntimeException("Failed to search stocks: " + e.getMessage());
        }
    }

    // Helper methods

    private String getTimeSeriesKey(String period) {
        switch (period) {
            case "intraday":
                return "Time Series (5min)";
            case "daily":
            default:
                return "Time Series (Daily)";
        }
    }

    // Cache class to store price data with expiration
    private static class CachedPriceData {
        private final Map<String, Object> data;
        private final long timestamp;

        public CachedPriceData(Map<String, Object> data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }

        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > 60000; // 1 minute
        }

        public Map<String, Object> getData() {
            return data;
        }
    }
}