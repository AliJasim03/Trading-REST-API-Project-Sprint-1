package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.PriceHistory;
import com.group418.StockProtfolioProject.repository.PriceHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriceHistoryService {

    private final PriceHistoryRepository priceHistoryRepository;

    public PriceHistoryService(PriceHistoryRepository priceHistoryRepository) {
        this.priceHistoryRepository = priceHistoryRepository;
    }

    public List<PriceHistory> getPriceHistoryByStockId(Integer stockId) {
        return priceHistoryRepository.findByStockStockId(stockId);
    }

    public List<PriceHistory> getAllPriceHistory() {
        return priceHistoryRepository.findAll();
    }

    public PriceHistory savePriceHistory(PriceHistory priceHistory) {
        return priceHistoryRepository.save(priceHistory);
    }
}