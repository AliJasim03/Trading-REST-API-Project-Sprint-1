package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.AlertDirection;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class WatchlistRepositoryTest {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should find watchlist entries with notified = false")
    void testFindByNotifiedFalse() {
        // given
        Stocks stock = new Stocks();
        stock.setStockTicker("AAPL");
        stock.setStockName("Apple Inc.");
        entityManager.persist(stock);

        WatchlistEntry entry1 = new WatchlistEntry();
        entry1.setStock(stock);
        entry1.setTargetPrice(BigDecimal.valueOf(150));
        entry1.setAlertDirection(AlertDirection.ABOVE);
        entry1.setNotified(false);
        entityManager.persist(entry1);

        WatchlistEntry entry2 = new WatchlistEntry();
        entry2.setStock(stock);
        entry2.setTargetPrice(BigDecimal.valueOf(120));
        entry2.setAlertDirection(AlertDirection.BELOW);
        entry2.setNotified(true);
        entityManager.persist(entry2);

        entityManager.flush();

        // when
        List<WatchlistEntry> result = watchlistRepository.findByNotifiedFalse();

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNotified()).isFalse();
        assertThat(result.get(0).getStock().getStockTicker()).isEqualTo("AAPL");
    }
}
