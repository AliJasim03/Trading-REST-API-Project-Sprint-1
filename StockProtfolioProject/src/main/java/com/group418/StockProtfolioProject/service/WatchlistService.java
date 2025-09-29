package com.group418.StockProtfolioProject.service;
import com.group418.StockProtfolioProject.entity.AlertDirection;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import com.group418.StockProtfolioProject.repository.WatchlistRepository;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import com.group418.StockProtfolioProject.repository.StocksRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private StocksRepository stocksRepository;

    public WatchlistEntry addToWatchlist(Long userId, Long stockId, BigDecimal targetPrice, AlertDirection direction) {
        Integer stockIdInt = stockId.intValue();
        Stocks stock = stocksRepository.findById(stockIdInt)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));
        WatchlistEntry entry = new WatchlistEntry();
        entry.setStock(stock);
        entry.setTargetPrice(targetPrice);
        entry.setAlertDirection(direction);
        return watchlistRepository.save(entry);
    }

    public void removeFromWatchlist(Long entryId) {
        watchlistRepository.deleteById(entryId);
    }

    public void updateEntry(WatchlistEntry entry) {
        watchlistRepository.save(entry);
    }

    public List<WatchlistEntry> getAll() {
        return watchlistRepository.findAll();
    }
}

