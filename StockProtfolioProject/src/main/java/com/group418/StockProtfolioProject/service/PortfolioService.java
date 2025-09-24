package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;

    public PortfolioService(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    public List<Portfolios> getAllPortfolios() {
        return portfolioRepository.findAll();
    }

    public Portfolios getPortfolioById(Integer id) {
        return portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + id));
    }

    public Portfolios createPortfolio(Portfolios portfolio) {
        portfolio.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return portfolioRepository.save(portfolio);
    }

    public Portfolios updatePortfolio(Integer id, Portfolios portfolioDetails) {
        Portfolios portfolio = getPortfolioById(id);

        portfolio.setPortfolioName(portfolioDetails.getPortfolioName());
        portfolio.setDescription(portfolioDetails.getDescription());
        portfolio.setInitialCapital(portfolioDetails.getInitialCapital());

        return portfolioRepository.save(portfolio);
    }

    public void deletePortfolio(Integer id) {
        Portfolios portfolio = getPortfolioById(id);
        portfolioRepository.delete(portfolio);
    }
}