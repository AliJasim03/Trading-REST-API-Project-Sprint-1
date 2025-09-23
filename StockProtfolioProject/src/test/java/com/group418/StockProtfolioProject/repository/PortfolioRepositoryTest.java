package com.group418.StockProtfolioProject.repository;

import com.group418.StockProtfolioProject.entity.Portfolios;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class PortfolioRepositoryTest {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Test
    @DisplayName("save and findById should persist and retrieve a portfolio")
    void testSaveAndFind() {
        // given
        Portfolios portfolio = new Portfolios();
        portfolio.setPortfolioName("My Portfolio");
        portfolio.setDescription("desc");
        portfolio.setInitialCapital(5000.0);
        portfolio.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        // when
        Portfolios saved = portfolioRepository.save(portfolio);

        // then
        Optional<Portfolios> found = portfolioRepository.findById(saved.getPortfolioId());
        assertThat(found).isPresent();
        assertThat(found.get().getPortfolioName()).isEqualTo("My Portfolio");
        assertThat(found.get().getInitialCapital()).isEqualTo(5000.0);
    }

    @Test
    @DisplayName("findAll should return all portfolios")
    void testFindAll() {
        Portfolios p1 = new Portfolios();
        p1.setPortfolioName("P1");
        p1.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        Portfolios p2 = new Portfolios();
        p2.setPortfolioName("P2");
        p2.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        portfolioRepository.save(p1);
        portfolioRepository.save(p2);

        assertThat(portfolioRepository.findAll()).hasSizeGreaterThanOrEqualTo(2);
    }
}
