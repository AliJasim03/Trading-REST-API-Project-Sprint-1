package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface OrdersRepository extends JpaRepository<Order, Integer> {
    List<Order> findByPortfolioPortfolioId(Integer portfolioId);
    List<Order> findByStockStockId(Integer stockId);
}
