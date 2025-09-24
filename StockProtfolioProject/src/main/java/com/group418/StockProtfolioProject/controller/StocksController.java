package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.PriceHistory;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.service.PriceHistoryService;
import com.group418.StockProtfolioProject.service.StocksService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stocks")
@CrossOrigin(origins = "http://localhost:3000")
public class StocksController {

    private final StocksService stocksService;
    private final PriceHistoryService priceHistoryService;

    public StocksController(StocksService stocksService, PriceHistoryService priceHistoryService) {
        this.stocksService = stocksService;
        this.priceHistoryService = priceHistoryService;
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