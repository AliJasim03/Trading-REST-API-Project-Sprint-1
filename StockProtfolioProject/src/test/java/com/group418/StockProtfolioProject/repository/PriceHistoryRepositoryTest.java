package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.PriceHistory;
import com.group418.StockProtfolioProject.entity.Stocks;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class PriceHistoryRepositoryTest {

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private StocksRepository stocksRepository;

    @Test
    @DisplayName("save and retrieve price history for a stock")
    void testSaveAndFind() {
        // create a stock first (since PriceHistory requires a Stock)
        Stocks stock = new Stocks();
        stock.setStockTicker("ABC");
        stock.setStockName("ABC Inc.");
        stock.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        stock = stocksRepository.save(stock);

        PriceHistory ph = new PriceHistory();
        ph.setPrice(123.45);
        ph.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        // link stock
        ph.setStock(stock);

        PriceHistory saved = priceHistoryRepository.save(ph);

        assertThat(saved.getPrice()).isEqualTo(123.45);
        assertThat(saved.getStock()).isEqualTo(stock);
        assertThat(priceHistoryRepository.findById(saved.getPriceId())).isPresent();
    }
}
