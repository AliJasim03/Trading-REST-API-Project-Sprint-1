package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Portfolios;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolios, Integer> {
}
