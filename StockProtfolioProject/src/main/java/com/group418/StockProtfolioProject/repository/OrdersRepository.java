package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface OrdersRepository extends JpaRepository<Orders, Integer> {
    List<Orders> findByPortfoliosPortfolioId(Integer portfolio_id);
    
    // Methods for order processing simulator
    List<Orders> findByStatusCode(Integer statusCode);
    
    @Query("SELECT COUNT(o) FROM Orders o WHERE o.statusCode = ?1")
    long countByStatusCode(Integer statusCode);
    
    //List<Order> findByStockStockId(Integer stockId);
}
