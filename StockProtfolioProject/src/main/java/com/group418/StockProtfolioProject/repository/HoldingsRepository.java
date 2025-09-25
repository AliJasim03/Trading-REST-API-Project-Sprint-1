package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Holdings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingsRepository extends JpaRepository<Holdings, Integer> {

    // Find holding by portfolio and stock
    Optional<Holdings> findByPortfolioPortfolioIdAndStockStockId(Integer portfolioId, Integer stockId);

    // Find all holdings for a specific portfolio
    List<Holdings> findByPortfolioPortfolioId(Integer portfolioId);

    // Find all holdings for a specific stock
    List<Holdings> findByStockStockId(Integer stockId);

    // Find all holdings with positive quantity (actual holdings)
    @Query("SELECT h FROM Holdings h WHERE h.quantity > 0")
    List<Holdings> findAllActiveHoldings();

    // Find all holdings for a portfolio with positive quantity
    @Query("SELECT h FROM Holdings h WHERE h.portfolio.portfolioId = :portfolioId AND h.quantity > 0")
    List<Holdings> findActiveHoldingsByPortfolio(@Param("portfolioId") Integer portfolioId);
}