package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.entity.Stocks;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class OrdersRepositoryTest {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private StocksRepository stocksRepository;

    @Test
    @DisplayName("findByPortfoliosPortfolioId should return orders belonging to a portfolio")
    void testFindByPortfoliosPortfolioId() {
        // create required Portfolio
        Portfolios p = new Portfolios();
        p.setPortfolioName("Test Portfolio");
        p.setDescription("desc");
        p.setInitialCapital(1000.0);
        p.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        p = portfolioRepository.save(p);

        // create required Stock
        Stocks s = new Stocks();
        s.setStockTicker("TST");
        s.setStockName("Test Stock");
        s.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        s = stocksRepository.save(s);

        // create order and link to portfolio + stock
        Orders o = new Orders();
        o.setPrice(12.34);
        o.setVolume(10);
        o.setFees(1.0);
        o.setPortfolio(p);
        o.setStock(s);
        o = ordersRepository.save(o);

        // when
        List<Orders> found = ordersRepository.findByPortfoliosPortfolioId(p.getPortfolioId());

        // then
        assertThat(found).isNotNull();
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getPrice()).isEqualTo(12.34);
        assertThat(found.get(0).getVolume()).isEqualTo(10);
    }
}
