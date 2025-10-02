package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Holdings;
import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.entity.Portfolios.PortfolioStatus;
import com.group418.StockProtfolioProject.entity.PriceHistory;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.HoldingsRepository;
import com.group418.StockProtfolioProject.repository.OrdersRepository;
import com.group418.StockProtfolioProject.repository.PortfolioRepository;
import com.group418.StockProtfolioProject.repository.PriceHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (portfolioDetails.getPortfolioName() == null || portfolioDetails.getPortfolioName().trim().isEmpty()) {
            throw new IllegalArgumentException("Portfolio name cannot be null or empty");
        }
        
        if (portfolioDetails.getPortfolioName().trim().length() < 2) {
            throw new IllegalArgumentException("Portfolio name must be at least 2 characters long");
        }
        
        if (portfolioDetails.getPortfolioName().trim().length() > 100) {
            throw new IllegalArgumentException("Portfolio name cannot exceed 100 characters");
        }

        if (portfolioDetails.getDescription() == null || portfolioDetails.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Portfolio description cannot be null or empty");
        }
        
        if (portfolioDetails.getDescription().trim().length() < 10) {
            throw new IllegalArgumentException("Portfolio description must be at least 10 characters long");
        }
        
        if (portfolioDetails.getDescription().trim().length() > 500) {
            throw new IllegalArgumentException("Portfolio description cannot exceed 500 characters");
        }

        // Check if portfolio has any orders/holdings
        List<Orders> existingOrders = ordersRepository.findByPortfoliosPortfolioId(id);
        List<Holdings> existingHoldings = holdingsRepository.findByPortfolioPortfolioId(id);
        
        boolean hasActivity = !existingOrders.isEmpty() || !existingHoldings.isEmpty();
        
        if (hasActivity && portfolioDetails.getInitialCapital() != portfolio.getInitialCapital()) {
            throw new IllegalArgumentException(
                "Cannot modify capital for portfolios with existing orders or holdings. " +
                "Current available capital: $" + String.format("%.2f", portfolio.getInitialCapital())
            );
        }
        
        // If no activity, validate the new initial capital
        if (!hasActivity) {
            if (portfolioDetails.getInitialCapital() <= 0) {
                throw new IllegalArgumentException("Initial capital must be greater than 0");
            }
            
            if (portfolioDetails.getInitialCapital() > 1000000) {
                throw new IllegalArgumentException("Initial capital cannot exceed $1,000,000");
            }
        }

        portfolio.setPortfolioName(portfolioDetails.getPortfolioName().trim());
        portfolio.setDescription(portfolioDetails.getDescription().trim());
        
        // Only update initial capital if portfolio has no activity
        if (!hasActivity) {
            portfolio.setInitialCapital(portfolioDetails.getInitialCapital());
        }

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
        
        // Calculate total invested (from filled buy orders) - status_code 2 = Filled
        double totalInvested = allOrders.stream()
            .filter(order -> order.getBuy_or_sell() == Orders.BuySellType.BUY && order.getStatus_code() == 2)
            .mapToDouble(order -> order.getVolume() * order.getPrice() + order.getFees())
            .sum();
            
        // Calculate total sold (from filled sell orders) - status_code 2 = Filled
        double totalSold = allOrders.stream()
            .filter(order -> order.getBuy_or_sell() == Orders.BuySellType.SELL && order.getStatus_code() == 2)
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
        System.out.println("=== DEBUG: calculatePortfolioValue ===");
        System.out.println("Holdings count: " + holdings.size());
        
        return holdings.stream()
            .mapToDouble(holding -> {
                try {
                    System.out.println("Processing holding for stock ID: " + holding.getStock().getStockId() + 
                                     " (" + holding.getStock().getStockTicker() + "), quantity: " + holding.getQuantity());
                    
                    // Get latest price for the stock
                    List<PriceHistory> priceHistory = priceHistoryRepository
                        .findByStockStockIdOrderByCreatedAtDesc(holding.getStock().getStockId());
                    
                    System.out.println("Price history entries found: " + priceHistory.size());
                    
                    if (!priceHistory.isEmpty()) {
                        double price = priceHistory.get(0).getPrice();
                        double value = holding.getQuantity() * price;
                        System.out.println("Latest price: " + price + ", calculated value: " + value);
                        return value;
                    } else {
                        System.out.println("No price history found for stock ID: " + holding.getStock().getStockId());
                    }
                    return 0.0;
                } catch (Exception e) {
                    System.out.println("Error calculating value for holding: " + e.getMessage());
                    e.printStackTrace();
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
                // Add status so frontend can filter out CLOSED portfolios
                summary.put("status", portfolio.getStatus());
                
                return summary;
            })
            .collect(Collectors.toList());
    }
    
    public List<Holdings> getPortfolioHoldings(Integer portfolioId) {
        return holdingsRepository.findByPortfolioPortfolioId(portfolioId);
    }

    @Transactional
    public Portfolios closePortfolio(Integer id, boolean liquidate) {
    Portfolios portfolio = getPortfolioById(id);

    // Check for pending orders
    List<Orders> orders = ordersRepository.findByPortfoliosPortfolioId(id);
    boolean hasPendingOrders = orders.stream().anyMatch(order -> order.getStatus_code() != 2);
    if (hasPendingOrders) {
        throw new IllegalArgumentException("Cannot close portfolio. Some orders are still processing.");
    }

    if (liquidate) {
        List<Holdings> holdings = holdingsRepository.findByPortfolioPortfolioId(id);
        for (Holdings h : holdings) {
            if (h == null || h.getQuantity() <= 0) continue;

            Orders sellOrder = new Orders();
            sellOrder.setPortfolio(portfolio);
            sellOrder.setStock(h.getStock());
            sellOrder.setBuy_or_sell(Orders.BuySellType.SELL);
            sellOrder.setOrder_type(Orders.OrderType.Market);
            sellOrder.setVolume(h.getQuantity());

            double price = priceHistoryRepository.findByStockStockIdOrderByCreatedAtDesc(h.getStock().getStockId())
                            .stream()
                            .findFirst()
                            .map(p -> p.getPrice())
                            .orElse(0.0);

            sellOrder.setPrice(price);
            sellOrder.setFees(0.0);
            sellOrder.setStatus_code(2); // Mark as filled
            sellOrder.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            ordersRepository.save(sellOrder);

            holdingsRepository.delete(h);
        }
    } else {
        if (!holdingsRepository.findByPortfolioPortfolioId(id).isEmpty()) {
            throw new IllegalArgumentException("Portfolio has active holdings. Liquidation is required to close.");
        }
    }

    portfolio.setStatus(PortfolioStatus.CLOSED); // Mark portfolio as closed
    return portfolioRepository.save(portfolio);
}

}