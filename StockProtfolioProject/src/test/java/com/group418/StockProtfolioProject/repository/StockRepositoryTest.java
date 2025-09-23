package com.group418.StockProtfolioProject.repository;

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
class StocksRepositoryTest {

    @Autowired
    private StocksRepository stocksRepository;

    @Test
    @DisplayName("save and findById should persist and retrieve a stock")
    void testSaveAndFind() {
        Stocks stock = new Stocks();
        stock.setStockTicker("XYZ");
        stock.setStockName("XYZ Corp");
        stock.setSector("Technology");
        stock.setMarket("NASDAQ");
        stock.setCurrency("USD");
        stock.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        Stocks saved = stocksRepository.save(stock);

        assertThat(saved.getStockTicker()).isEqualTo("XYZ");
        assertThat(stocksRepository.findById(saved.getStockId())).isPresent();
    }

    @Test
    @DisplayName("findAll should return all stocks")
    void testFindAll() {
        Stocks s1 = new Stocks();
        s1.setStockTicker("S1");
        s1.setStockName("Stock1");
        s1.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        Stocks s2 = new Stocks();
        s2.setStockTicker("S2");
        s2.setStockName("Stock2");
        s2.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        stocksRepository.save(s1);
        stocksRepository.save(s2);

        assertThat(stocksRepository.findAll()).hasSizeGreaterThanOrEqualTo(2);
    }
}
