package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Portfolios;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.OrdersRepository;
import com.group418.StockProtfolioProject.repository.StocksRepository;
import com.group418.StockProtfolioProject.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
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

    public Orders placeOrder(int portfolio_id, int stock_id, Orders orders_request){
        Portfolios portfolios = portfolioRepository.findById(portfolio_id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found."));
        Stocks stock = stocksRepository.findById(stock_id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found."));

        orders_request.setPortfolio(portfolios);
        orders_request.setStock(stock);
        orders_request.setStatus_code(0); // Pending
        orders_request.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        return ordersRepository.save(orders_request);
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
}