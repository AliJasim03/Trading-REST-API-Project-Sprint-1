package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Stocks;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StocksRepository extends JpaRepository<Stocks, Integer> {
}
