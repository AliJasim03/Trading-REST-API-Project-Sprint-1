package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.entity.Stocks;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
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
        o.setBuy_or_sell(Orders.BuySellType.BUY); // mandatory
        o.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        o.setFees(0.0);
        o.setOrder_type(Orders.OrderType.Market);
        o.setPortfolio(p); // must exist
        o.setPrice(100.0);
        o.setStatus_code(1);
        o.setStock(s); // must exist
        o.setVolume(10);
        ordersRepository.save(o);

        // when
        List<Orders> found = ordersRepository.findByPortfoliosPortfolioId(p.getPortfolioId());

        // then
        
        assertThat(found).isNotNull();
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getVolume()).isEqualTo(10);
        assertThat(found.get(0).getStock().getStockTicker()).isEqualTo("TST");
        assertThat(found.get(0).getPortfolio().getPortfolioName()).isEqualTo("Test Portfolio");
        
    }
}
