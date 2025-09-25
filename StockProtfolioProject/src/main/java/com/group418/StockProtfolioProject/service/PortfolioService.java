package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Holdings;
import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.entity.PriceHistory;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.HoldingsRepository;
import com.group418.StockProtfolioProject.repository.OrdersRepository;
import com.group418.StockProtfolioProject.repository.PortfolioRepository;
import com.group418.StockProtfolioProject.repository.PriceHistoryRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final HoldingsRepository holdingsRepository;
    private final OrdersRepository ordersRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public PortfolioService(PortfolioRepository portfolioRepository,
                          HoldingsRepository holdingsRepository,
                          OrdersRepository ordersRepository,
                          PriceHistoryRepository priceHistoryRepository) {
        this.portfolioRepository = portfolioRepository;
        this.holdingsRepository = holdingsRepository;
        this.ordersRepository = ordersRepository;
        this.priceHistoryRepository = priceHistoryRepository;
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
    
    // Dashboard Analytics Methods
    
    public Map<String, Object> getPortfolioDashboard(Integer portfolioId) {
        Portfolios portfolio = getPortfolioById(portfolioId);
        Map<String, Object> dashboard = new HashMap<>();
        
        // Basic portfolio info
        dashboard.put("portfolio", portfolio);
        
        // Holdings summary
        List<Holdings> holdings = holdingsRepository.findByPortfolioPortfolioId(portfolioId);
        dashboard.put("holdings", holdings);
        dashboard.put("totalHoldings", holdings.size());
        
        // Calculate portfolio value
        double totalValue = calculatePortfolioValue(holdings);
        dashboard.put("totalValue", totalValue);
        dashboard.put("availableCapital", portfolio.getInitialCapital());
        dashboard.put("totalCapital", totalValue + portfolio.getInitialCapital());
        
        // Recent orders
        List<Orders> recentOrders = ordersRepository.findByPortfoliosPortfolioId(portfolioId);
        // Get last 10 orders by sorting by order_id (most recent first)
        recentOrders = recentOrders.stream()
            .sorted((o1, o2) -> Integer.compare(o2.getOrderId(), o1.getOrderId()))
            .limit(10)
            .collect(Collectors.toList());
        dashboard.put("recentOrders", recentOrders);
        
        // Portfolio performance
        Map<String, Object> performance = calculatePerformance(portfolioId, holdings);
        dashboard.put("performance", performance);
        
        // Holdings allocation
        List<Map<String, Object>> allocation = calculateAllocation(holdings);
        dashboard.put("allocation", allocation);
        
        return dashboard;
    }
    
    public Map<String, Object> calculatePerformance(Integer portfolioId, List<Holdings> holdings) {
        Map<String, Object> performance = new HashMap<>();
        
        // Get all orders for this portfolio
        List<Orders> allOrders = ordersRepository.findByPortfoliosPortfolioId(portfolioId);
        
        // Calculate total invested (from filled buy orders)
        double totalInvested = allOrders.stream()
            .filter(order -> order.getBuy_or_sell() == Orders.BuySellType.BUY && order.getStatus_code() == 1)
            .mapToDouble(order -> order.getVolume() * order.getPrice() + order.getFees())
            .sum();
            
        // Calculate total sold (from filled sell orders)
        double totalSold = allOrders.stream()
            .filter(order -> order.getBuy_or_sell() == Orders.BuySellType.SELL && order.getStatus_code() == 1)
            .mapToDouble(order -> order.getVolume() * order.getPrice() - order.getFees())
            .sum();
            
        double currentValue = calculatePortfolioValue(holdings);
        double totalGainLoss = (currentValue + totalSold) - totalInvested;
        double gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
        
        performance.put("totalInvested", totalInvested);
        performance.put("totalSold", totalSold);
        performance.put("currentValue", currentValue);
        performance.put("totalGainLoss", totalGainLoss);
        performance.put("gainLossPercent", gainLossPercent);
        
        return performance;
    }
    
    public double calculatePortfolioValue(List<Holdings> holdings) {
        return holdings.stream()
            .mapToDouble(holding -> {
                try {
                    // Get latest price for the stock
                    List<PriceHistory> priceHistory = priceHistoryRepository
                        .findByStockStockIdOrderByCreatedAtDesc(holding.getStock().getStockId());
                    if (!priceHistory.isEmpty()) {
                        return holding.getQuantity() * priceHistory.get(0).getPrice();
                    }
                    return 0.0;
                } catch (Exception e) {
                    return 0.0;
                }
            })
            .sum();
    }
    
    public List<Map<String, Object>> calculateAllocation(List<Holdings> holdings) {
        double totalValue = calculatePortfolioValue(holdings);
        
        return holdings.stream()
            .map(holding -> {
                Map<String, Object> allocation = new HashMap<>();
                try {
                    List<PriceHistory> priceHistory = priceHistoryRepository
                        .findByStockStockIdOrderByCreatedAtDesc(holding.getStock().getStockId());
                    double currentPrice = !priceHistory.isEmpty() ? priceHistory.get(0).getPrice() : 0.0;
                    double holdingValue = holding.getQuantity() * currentPrice;
                    double percentage = totalValue > 0 ? (holdingValue / totalValue) * 100 : 0;
                    
                    allocation.put("stockSymbol", holding.getStock().getStockTicker());
                    allocation.put("stockName", holding.getStock().getStockName());
                    allocation.put("quantity", holding.getQuantity());
                    allocation.put("value", holdingValue);
                    allocation.put("percentage", percentage);
                    allocation.put("currentPrice", currentPrice);
                } catch (Exception e) {
                    allocation.put("stockSymbol", holding.getStock().getStockTicker());
                    allocation.put("stockName", holding.getStock().getStockName());
                    allocation.put("quantity", holding.getQuantity());
                    allocation.put("value", 0.0);
                    allocation.put("percentage", 0.0);
                    allocation.put("currentPrice", 0.0);
                }
                return allocation;
            })
            .collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getPortfolioSummary() {
        List<Portfolios> allPortfolios = getAllPortfolios();
        
        return allPortfolios.stream()
            .map(portfolio -> {
                Map<String, Object> summary = new HashMap<>();
                List<Holdings> holdings = holdingsRepository.findByPortfolioPortfolioId(portfolio.getPortfolioId());
                double totalValue = calculatePortfolioValue(holdings);
                
                summary.put("id", portfolio.getPortfolioId());
                summary.put("name", portfolio.getPortfolioName());
                summary.put("totalValue", totalValue);
                summary.put("availableCapital", portfolio.getInitialCapital());
                summary.put("totalCapital", totalValue + portfolio.getInitialCapital());
                summary.put("holdingsCount", holdings.size());
                
                return summary;
            })
            .collect(Collectors.toList());
    }
    
    public List<Holdings> getPortfolioHoldings(Integer portfolioId) {
        return holdingsRepository.findByPortfolioPortfolioId(portfolioId);
    }
}