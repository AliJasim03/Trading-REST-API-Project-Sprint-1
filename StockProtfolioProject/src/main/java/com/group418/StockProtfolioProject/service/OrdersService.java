package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Order;
import com.group418.StockProtfolioProject.entity.Portfolio;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.OrdersRepository;
import com.group418.StockProtfolioProject.repository.StocksRepository;
import com.group418.StockProtfolioProject.repository.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final StocksRepository stocksRepository;
    private final PortfolioRepository portfolioRepository;

    public OrdersService(OrdersRepository ordersRepository, StocksRepository stocksRepository, PortfolioRepository portfolioRepository) {
        this.ordersRepository = ordersRepository;
        this.stocksRepository = stocksRepository;
        this.portfolioRepository = portfolioRepository;
    }

    public Order placeOrder(int portfolio_id, int stock_id, Order order_request){
        Portfolio portfolio = portfolioRepository.findById(portfolio_id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found "));
        Stocks stock = stocksRepository.findById(stock_id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        order_request.setPortfolio(portfolio);
        order_request.setStock(stock);
        order_request.setStatus_code(0); // Pending
        return ordersRepository.save(order_request);

    }

    public List<Order> getTradingHistory(int portfolioId) {
        return ordersRepository.findByPortfolioPortfolioId(portfolioId);
    }

    public Order getOrderStatus(int orderId) {
        return ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + orderId));
    }



}
