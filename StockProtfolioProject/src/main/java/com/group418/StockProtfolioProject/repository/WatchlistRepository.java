package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WatchlistRepository extends JpaRepository<WatchlistEntry, Long> {
    List<WatchlistEntry> findByNotifiedFalse();
}
