package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Integer> {
    List<PriceHistory> findByStockStockId(Integer stockId);
    List<PriceHistory> findByStockStockIdOrderByCreatedAtDesc(Integer stockId);
}