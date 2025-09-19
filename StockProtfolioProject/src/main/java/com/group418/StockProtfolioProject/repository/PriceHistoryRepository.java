package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Integer> {
}
