package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/portfolios")
@CrossOrigin(origins = "http://localhost:3000")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ResponseEntity<List<Portfolios>> getAllPortfolios() {
        List<Portfolios> portfolios = portfolioService.getAllPortfolios();
        return ResponseEntity.ok(portfolios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Portfolios> getPortfolioById(@PathVariable Integer id) {
        Portfolios portfolio = portfolioService.getPortfolioById(id);
        return ResponseEntity.ok(portfolio);
    }

    @PostMapping("/create")
    public ResponseEntity<Portfolios> createPortfolio(@RequestBody Portfolios portfolio) {
        Portfolios createdPortfolio = portfolioService.createPortfolio(portfolio);
        return ResponseEntity.ok(createdPortfolio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Portfolios> updatePortfolio(@PathVariable Integer id, @RequestBody Portfolios portfolio) {
        Portfolios updatedPortfolio = portfolioService.updatePortfolio(id, portfolio);
        return ResponseEntity.ok(updatedPortfolio);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Integer id) {
        portfolioService.deletePortfolio(id);
        return ResponseEntity.noContent().build();
    }

    // Dashboard Analytics Endpoints
    
    @GetMapping("/{id}/dashboard")
    public ResponseEntity<Map<String, Object>> getPortfolioDashboard(@PathVariable Integer id) {
        Map<String, Object> dashboard = portfolioService.getPortfolioDashboard(id);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/summary")
    public ResponseEntity<List<Map<String, Object>>> getPortfolioSummary() {
        List<Map<String, Object>> summary = portfolioService.getPortfolioSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}/performance")
    public ResponseEntity<Map<String, Object>> getPortfolioPerformance(@PathVariable Integer id) {
        List<com.group418.StockProtfolioProject.entity.Holdings> holdings = 
            portfolioService.getPortfolioHoldings(id);
        Map<String, Object> performance = portfolioService.calculatePerformance(id, holdings);
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/{id}/allocation")
    public ResponseEntity<List<Map<String, Object>>> getPortfolioAllocation(@PathVariable Integer id) {
        List<com.group418.StockProtfolioProject.entity.Holdings> holdings = 
            portfolioService.getPortfolioHoldings(id);
        List<Map<String, Object>> allocation = portfolioService.calculateAllocation(holdings);
        return ResponseEntity.ok(allocation);
    }
}