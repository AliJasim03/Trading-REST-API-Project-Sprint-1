package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.entity.Holdings;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.OrdersRepository;
import com.group418.StockProtfolioProject.repository.StocksRepository;
import com.group418.StockProtfolioProject.repository.PortfolioRepository;
import com.group418.StockProtfolioProject.repository.HoldingsRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.*;

@Service
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final StocksRepository stocksRepository;
    private final PortfolioRepository portfolioRepository;
    private final HoldingsRepository holdingsRepository;
    private final NotificationService notificationService;

    public OrdersService(OrdersRepository ordersRepository, StocksRepository stocksRepository, 
                        PortfolioRepository portfolioRepository, HoldingsRepository holdingsRepository,
                        NotificationService notificationService) {
        this.ordersRepository = ordersRepository;
        this.stocksRepository = stocksRepository;
        this.portfolioRepository = portfolioRepository;
        this.holdingsRepository = holdingsRepository;
        this.notificationService = notificationService;
    }

    public Orders placeOrder(int portfolio_id, int stock_id, Orders orders_request) {
        Portfolios portfolios = portfolioRepository.findById(portfolio_id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found."));
        Stocks stock = stocksRepository.findById(stock_id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found."));
    
        // ✅ SELL validation before saving order
        if (orders_request.getBuy_or_sell() == Orders.BuySellType.SELL) {
            Holdings holding = holdingsRepository
                    .findByPortfolioPortfolioIdAndStockStockId(portfolio_id, stock_id)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "You do not own this stock in the selected portfolio."
                    ));
    
            if (orders_request.getVolume() > holding.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient shares. You only own " + holding.getQuantity()
                );
            }
        }
    
        orders_request.setPortfolio(portfolios);
        orders_request.setStock(stock);
        orders_request.setStatus_code(0); // Initialized
        orders_request.setCreatedAt(new Timestamp(System.currentTimeMillis()));
    
        Orders savedOrder = ordersRepository.save(orders_request);
    
        // Send notification when order is placed
        notificationService.notifyOrderPlaced(savedOrder);
    
        return savedOrder;
    }
    

    public List<Orders> getTradingHistory(int portfolio_id) {
        return ordersRepository.findByPortfoliosPortfolioId(portfolio_id);
    }

    public Orders getOrderStatus(int orderId) {
        return ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + orderId));
    }

    public List<Orders> getAllOrders() {
        return ordersRepository.findAll();
    }

    public Orders updateOrderStatus(int orderId, int newStatusCode) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + orderId));

        // Validate status code (0=Initialized, 1=Processing, 2=Filled, 3=Rejected)
        if (newStatusCode < 0 || newStatusCode > 3) {
            throw new IllegalArgumentException("Invalid status code. Valid values are: 0 (Initialized), 1 (Processing), 2 (Filled), 3 (Rejected)");
        }

        int oldStatusCode = order.getStatus_code();
        order.setStatusCode(newStatusCode);

        // Update portfolio capital when order status changes to FILLED (2)
        if (oldStatusCode != 2 && newStatusCode == 2) {
            updatePortfolioCapital(order);
            updateHoldings(order);
            // Send notification when order is filled
            notificationService.notifyOrderFilled(order);
        }
        // Reverse capital changes when order status changes from FILLED back to other states
        else if (oldStatusCode == 2 && newStatusCode != 2) {
            reversePortfolioCapital(order);
            reverseHoldings(order);
        }
        
        // Send notification when order is rejected
        if (newStatusCode == 3) {
            String rejectionReason = oldStatusCode == 0 ? "Order rejected by system" : "Order status changed to rejected";
            notificationService.notifyOrderRejected(order, rejectionReason);
        }

        return ordersRepository.save(order);
    }

    private void updatePortfolioCapital(Orders order) {
        Portfolios portfolio = order.getPortfolio();
        double transactionAmount = order.getPrice() * order.getVolume();
        double totalCost = transactionAmount + order.getFees();

        if (order.getBuy_or_sell() == Orders.BuySellType.BUY) {
            // BUY: Subtract from capital (spending money)
            portfolio.setInitialCapital(portfolio.getInitialCapital() - totalCost);
        } else if (order.getBuy_or_sell() == Orders.BuySellType.SELL) {
            // SELL: Add to capital (receiving money, minus fees)
            portfolio.setInitialCapital(portfolio.getInitialCapital() + transactionAmount - order.getFees());
        }

        portfolioRepository.save(portfolio);
    }

    private void reversePortfolioCapital(Orders order) {
        Portfolios portfolio = order.getPortfolio();
        double transactionAmount = order.getPrice() * order.getVolume();
        double totalCost = transactionAmount + order.getFees();

        if (order.getBuy_or_sell() == Orders.BuySellType.BUY) {
            // Reverse BUY: Add back to capital
            portfolio.setInitialCapital(portfolio.getInitialCapital() + totalCost);
        } else if (order.getBuy_or_sell() == Orders.BuySellType.SELL) {
            // Reverse SELL: Subtract from capital
            portfolio.setInitialCapital(portfolio.getInitialCapital() - transactionAmount + order.getFees());
        }

        portfolioRepository.save(portfolio);
    }

    private void updateHoldings(Orders order) {
        Optional<Holdings> existingHolding = holdingsRepository.findByPortfolioPortfolioIdAndStockStockId(
                order.getPortfolio().getPortfolioId(), 
                order.getStock().getStockId()
        );

        Holdings holding;
        if (existingHolding.isPresent()) {
            holding = existingHolding.get();
        } else {
            // For SELL orders, we must have existing holdings
            if (order.getBuy_or_sell() == Orders.BuySellType.SELL) {
                throw new IllegalArgumentException("Cannot sell stock: No holdings found for " + 
                    order.getStock().getStockTicker() + " in this portfolio");
            }
            // Create new holding for BUY orders
            holding = new Holdings();
            holding.setPortfolio(order.getPortfolio());
            holding.setStock(order.getStock());
            holding.setQuantity(0);
        }

        if (order.getBuy_or_sell() == Orders.BuySellType.BUY) {
            // Add shares to holdings
            holding.setQuantity(holding.getQuantity() + order.getVolume());
        } else if (order.getBuy_or_sell() == Orders.BuySellType.SELL) {
            // Check if we have enough shares to sell
            if (holding.getQuantity() < order.getVolume()) {
                throw new IllegalArgumentException(
                    String.format("Insufficient shares to sell. Available: %d, Requested: %d for %s", 
                        holding.getQuantity(), order.getVolume(), order.getStock().getStockTicker())
                );
            }
            // Reduce holdings
            holding.setQuantity(holding.getQuantity() - order.getVolume());
        }

        holding.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        
        // Only save if quantity > 0, otherwise delete the holding
        if (holding.getQuantity() > 0) {
            holdingsRepository.save(holding);
        } else if (existingHolding.isPresent()) {
            holdingsRepository.delete(holding);
        }
    }

    private void reverseHoldings(Orders order) {
        Optional<Holdings> existingHolding = holdingsRepository.findByPortfolioPortfolioIdAndStockStockId(
                order.getPortfolio().getPortfolioId(), 
                order.getStock().getStockId()
        );

        Holdings holding;
        if (existingHolding.isPresent()) {
            holding = existingHolding.get();
        } else {
            // Create a new holding for reversal
            holding = new Holdings();
            holding.setPortfolio(order.getPortfolio());
            holding.setStock(order.getStock());
            holding.setQuantity(0);
        }

        if (order.getBuy_or_sell() == Orders.BuySellType.BUY) {
            // Reverse BUY: Subtract shares
            holding.setQuantity(holding.getQuantity() - order.getVolume());
        } else if (order.getBuy_or_sell() == Orders.BuySellType.SELL) {
            // Reverse SELL: Add shares back
            holding.setQuantity(holding.getQuantity() + order.getVolume());
        }

        holding.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        
        // Only save if quantity > 0, otherwise delete the holding
        if (holding.getQuantity() > 0) {
            holdingsRepository.save(holding);
        } else if (existingHolding.isPresent()) {
            holdingsRepository.delete(holding);
        }
    }
}