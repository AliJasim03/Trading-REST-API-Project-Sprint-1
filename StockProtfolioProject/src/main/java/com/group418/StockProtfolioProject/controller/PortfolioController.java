package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.Holdings;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.service.PortfolioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    public ResponseEntity<?> createPortfolio(@RequestBody Portfolios portfolio) {
        try {
            Portfolios createdPortfolio = portfolioService.createPortfolio(portfolio);
            return ResponseEntity.ok(createdPortfolio);
        } catch (IllegalArgumentException e) {
            // Return validation errors as 400 Bad Request with detailed message
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation Error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            // Return other errors as 500 Internal Server Error
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server Error");
            errorResponse.put("message", "An unexpected error occurred while creating the portfolio");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePortfolio(@PathVariable Integer id, @RequestBody Portfolios portfolio) {
        try {
            Portfolios updatedPortfolio = portfolioService.updatePortfolio(id, portfolio);
            return ResponseEntity.ok(updatedPortfolio);
        } catch (IllegalArgumentException e) {
            // Return validation errors as 400 Bad Request with detailed message
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation Error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            // Return other errors as 500 Internal Server Error
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server Error");
            errorResponse.put("message", "An unexpected error occurred while updating the portfolio");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
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

    @GetMapping("/{id}/holdings")
    public ResponseEntity<List<Holdings>> getPortfolioHoldings(@PathVariable Integer id) {
        List<Holdings> holdings = portfolioService.getPortfolioHoldings(id);
        return ResponseEntity.ok(holdings);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<?> closePortfolio(@PathVariable Integer id, @RequestBody(required = false) Map<String, Object> body) {
        try {
            boolean liquidate = false;
            if (body != null && body.containsKey("liquidate")) {
                Object v = body.get("liquidate");
                if (v instanceof Boolean) {
                    liquidate = (Boolean) v;
                }
            }
            Portfolios closed = portfolioService.closePortfolio(id, liquidate);
            return ResponseEntity.ok(closed);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation Error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server Error");
            errorResponse.put("message", "An unexpected error occurred while closing the portfolio");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}