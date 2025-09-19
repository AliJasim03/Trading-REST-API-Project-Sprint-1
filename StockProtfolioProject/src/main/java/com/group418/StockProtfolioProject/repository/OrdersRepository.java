package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface OrdersRepository extends JpaRepository<Orders, Integer> {
    List<Orders> findByPortfoliosPortfolioId(Integer portfolio_id);
    //List<Order> findByStockStockId(Integer stockId);
}
