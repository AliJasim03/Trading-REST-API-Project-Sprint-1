package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Holdings;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.entity.Stocks;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class HoldingsRepositoryTest {

    @Autowired
    private HoldingsRepository holdingsRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Portfolios createPortfolio(String name) {
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioName(name);
        portfolio.setDescription("Test portfolio");
        portfolio.setInitialCapital(10000.0);
        entityManager.persist(portfolio);
        return portfolio;
    }

    private Stocks createStock(String ticker) {
        Stocks stock = new Stocks();
        stock.setStockTicker(ticker);
        stock.setStockName("Company " + ticker);
        stock.setCurrency("USD");
        entityManager.persist(stock);
        return stock;
    }

    @Test
    @DisplayName("Should find holding by portfolioId and stockId")
    void testFindByPortfolioPortfolioIdAndStockStockId() {
        Portfolios portfolio = createPortfolio("Retirement");
        Stocks stock = createStock("TSLA");

        Holdings holdings = new Holdings(10, portfolio, stock);
        entityManager.persist(holdings);
        entityManager.flush();

        Optional<Holdings> result =
                holdingsRepository.findByPortfolioPortfolioIdAndStockStockId(
                        portfolio.getPortfolioId(), stock.getStockId());

        assertThat(result).isPresent();
        assertThat(result.get().getQuantity()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should find all holdings for a portfolio")
    void testFindByPortfolioPortfolioId() {
        Portfolios portfolio = createPortfolio("Growth Fund");
        Stocks stock = createStock("AMZN");

        Holdings holdings = new Holdings(5, portfolio, stock);
        entityManager.persist(holdings);
        entityManager.flush();

        List<Holdings> result = holdingsRepository.findByPortfolioPortfolioId(portfolio.getPortfolioId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStock().getStockTicker()).isEqualTo("AMZN");
    }

    @Test
    @DisplayName("Should find all holdings for a stock")
    void testFindByStockStockId() {
        Portfolios portfolio = createPortfolio("Index Fund");
        Stocks stock = createStock("MSFT");

        Holdings holdings = new Holdings(8, portfolio, stock);
        entityManager.persist(holdings);
        entityManager.flush();

        List<Holdings> result = holdingsRepository.findByStockStockId(stock.getStockId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getQuantity()).isEqualTo(8);
    }

    @Test
    @DisplayName("Should find all active holdings (quantity > 0)")
    void testFindAllActiveHoldings() {
        Portfolios portfolio = createPortfolio("Balanced Fund");
        Stocks stock = createStock("GOOG");

        Holdings holdings1 = new Holdings(15, portfolio, stock);
        Holdings holdings2 = new Holdings(0, portfolio, stock);

        entityManager.persist(holdings1);
        entityManager.persist(holdings2);
        entityManager.flush();

        List<Holdings> result = holdingsRepository.findAllActiveHoldings();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getQuantity()).isEqualTo(15);
    }

    @Test
    @DisplayName("Should find active holdings by portfolio (quantity > 0)")
    void testFindActiveHoldingsByPortfolio() {
        Portfolios portfolio = createPortfolio("Dividend Fund");
        Stocks stock = createStock("NFLX");

        Holdings holdings1 = new Holdings(7, portfolio, stock);
        Holdings holdings2 = new Holdings(0, portfolio, stock);

        entityManager.persist(holdings1);
        entityManager.persist(holdings2);
        entityManager.flush();

        List<Holdings> result = holdingsRepository.findActiveHoldingsByPortfolio(portfolio.getPortfolioId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getQuantity()).isEqualTo(7);
    }
}
