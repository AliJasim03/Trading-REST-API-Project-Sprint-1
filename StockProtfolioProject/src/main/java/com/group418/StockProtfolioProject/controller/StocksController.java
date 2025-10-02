package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.PriceHistory;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.service.PriceHistoryService;
import com.group418.StockProtfolioProject.service.StocksService;
import com.group418.StockProtfolioProject.service.FinnhubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stocks")
@CrossOrigin(origins = "http://localhost:3000")
public class StocksController {

    private final StocksService stocksService;
    private final PriceHistoryService priceHistoryService;
    private final FinnhubService finnhubService;

    public StocksController(StocksService stocksService,
                            PriceHistoryService priceHistoryService,
                            FinnhubService finnhubService) {
        this.stocksService = stocksService;
        this.priceHistoryService = priceHistoryService;
        this.finnhubService = finnhubService;
    }

    @GetMapping
    public ResponseEntity<List<Stocks>> getAllStocks() {
        List<Stocks> stocks = stocksService.getAllStocks();
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Stocks> getStockById(@PathVariable Integer id) {
        Stocks stock = stocksService.getStockById(id);
        return ResponseEntity.ok(stock);
    }

    @GetMapping("/{id}/price-history")
    public ResponseEntity<List<PriceHistory>> getPriceHistory(@PathVariable Integer id) {
        List<PriceHistory> priceHistory = priceHistoryService.getPriceHistoryByStockId(id);
        return ResponseEntity.ok(priceHistory);
    }

    /**
     * Get live price for a stock using Finnhub API
     * @param id Stock ID
     * @return Real-time quote data
     */
    @GetMapping("/{id}/live-price")
    public ResponseEntity<Map<String, Object>> getLivePrice(@PathVariable Integer id) {
        Stocks stock = stocksService.getStockById(id);
        Map<String, Object> quote = finnhubService.getQuote(stock.getStockTicker());
        return ResponseEntity.ok(quote);
    }

    /**
     * Get live price by ticker symbol
     * @param symbol Stock ticker symbol (e.g., AAPL)
     * @return Real-time quote data
     */
    @GetMapping("/ticker/{symbol}/live-price")
    public ResponseEntity<Map<String, Object>> getLivePriceBySymbol(@PathVariable String symbol) {
        Map<String, Object> quote = finnhubService.getQuote(symbol);
        return ResponseEntity.ok(quote);
    }

    /**
     * Get company profile information
     * @param symbol Stock ticker symbol
     * @return Company profile data
     */
    @GetMapping("/ticker/{symbol}/profile")
    public ResponseEntity<Map<String, Object>> getCompanyProfile(@PathVariable String symbol) {
        Map<String, Object> profile = finnhubService.getCompanyProfile(symbol);
        return ResponseEntity.ok(profile);
    }

    /**
     * Search for stocks using Finnhub symbol lookup
     * @param query Search query string
     * @return List of matching stock symbols and names
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchStocks(@RequestParam String q) {
        List<Map<String, Object>> results = finnhubService.symbolLookup(q);
        return ResponseEntity.ok(results);
    }

    @PostMapping
    public ResponseEntity<Stocks> createStock(@RequestBody Stocks stock) {
        Stocks createdStock = stocksService.createStock(stock);
        return ResponseEntity.ok(createdStock);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Stocks> updateStock(@PathVariable Integer id, @RequestBody Stocks stock) {
        Stocks updatedStock = stocksService.updateStock(id, stock);
        return ResponseEntity.ok(updatedStock);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Integer id) {
        stocksService.deleteStock(id);
        return ResponseEntity.noContent().build();
    }
}