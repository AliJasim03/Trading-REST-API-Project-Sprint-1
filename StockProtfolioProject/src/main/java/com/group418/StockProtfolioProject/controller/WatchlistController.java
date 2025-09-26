package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.AlertDirection;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import com.group418.StockProtfolioProject.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @PostMapping
    public ResponseEntity<WatchlistEntry> addToWatchlist(@RequestParam Long id,
                                                         @RequestParam Long stockId,
                                                         @RequestParam BigDecimal targetPrice,
                                                         @RequestParam AlertDirection direction) {
        return ResponseEntity.ok(watchlistService.addToWatchlist(id, stockId, targetPrice, direction));
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> removeFromWatchlist(@PathVariable Long entryId) {
        watchlistService.removeFromWatchlist(entryId);
        return ResponseEntity.noContent().build();
    }
}

