package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.service.LivePriceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/live-prices")
@CrossOrigin(origins = "http://localhost:3000")
public class LivePriceController {

    private final LivePriceService livePriceService;

    public LivePriceController(LivePriceService livePriceService) {
        this.livePriceService = livePriceService;
    }

    /**
     * Get current price for a specific symbol
     */
    @GetMapping("/{symbol}")
    public ResponseEntity<Map<String, Object>> getCurrentPrice(@PathVariable String symbol) {
        try {
            Map<String, Object> priceData = livePriceService.getCurrentPrice(symbol.toUpperCase());
            return ResponseEntity.ok(priceData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "symbol", symbol));
        }
    }

    /**
     * Get current prices for multiple symbols
     */
    @PostMapping("/batch")
    public ResponseEntity<List<Map<String, Object>>> getMultiplePrices(
            @RequestBody List<String> symbols) {
        try {
            List<Map<String, Object>> prices = livePriceService.getMultiplePrices(
                    symbols.stream().map(String::toUpperCase).collect(java.util.stream.Collectors.toList())
            );
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(List.of(Map.of("error", e.getMessage())));
        }
    }

    /**
     * Get popular stocks for dashboard
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Map<String, Object>>> getPopularStocks() {
        try {
            List<Map<String, Object>> prices = livePriceService.getPopularStocks();
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(List.of(Map.of("error", e.getMessage())));
        }
    }

    /**
     * Get historical data for charts
     */
    @GetMapping("/{symbol}/history")
    public ResponseEntity<Map<String, Object>> getHistoricalData(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "daily") String period) {
        try {
            Map<String, Object> historicalData = livePriceService.getHistoricalData(
                    symbol.toUpperCase(), period
            );
            return ResponseEntity.ok(historicalData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "symbol", symbol));
        }
    }

    /**
     * Get intraday data for real-time charts
     */
    @GetMapping("/{symbol}/intraday")
    public ResponseEntity<Map<String, Object>> getIntradayData(@PathVariable String symbol) {
        try {
            Map<String, Object> intradayData = livePriceService.getIntradayData(symbol.toUpperCase());
            return ResponseEntity.ok(intradayData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "symbol", symbol));
        }
    }

    /**
     * Search for stocks
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchStocks(@RequestParam String q) {
        try {
            List<Map<String, Object>> results = livePriceService.searchStocks(q);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(List.of(Map.of("error", e.getMessage())));
        }
    }
}
