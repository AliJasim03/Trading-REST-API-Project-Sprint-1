package com.group418.StockProtfolioProject.entity;


import jakarta.persistence.*;
import org.hibernate.annotations.Table;

import java.sql.Timestamp;

@Entity
//@Table(name="orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int portfolio_id;
    private double price;
    private int volume;

    private BuySellType buy_or_sell;
    private OrderType order_type;
    private double fees;
    private int status_code; // 0 = pending, 1 = completed, 2 = cancelled
    private Timestamp created_at;

    @ManyToOne
    @JoinColumn(name="portfolio_id", nullable=false)
    private Portfolio portfolio;

    @ManyToOne
    @JoinColumn(name="stock_id", nullable=false)
    private Stocks stock;

    public enum BuySellType { BUY, SELL }
    public enum OrderType { Market, Limit, Stop }

    public Order() {
    }

    public Order(int id, int portfolio_id, double price, int volume, BuySellType buy_or_sell, OrderType order_type, double fees, int status_code, Portfolio portfolio, Stocks stock) {
        this.id = id;
        this.portfolio_id = portfolio_id;
        this.price = price;
        this.volume = volume;
        this.buy_or_sell = buy_or_sell;
        this.order_type = order_type;
        this.fees = fees;
        this.status_code = status_code;
        this.created_at = new Timestamp(System.currentTimeMillis());
        this.portfolio = portfolio;
        this.stock = stock;
    }

    public int getPortfolio_id() {
        return portfolio_id;
    }

    public void setPortfolio_id(int portfolio_id) {
        this.portfolio_id = portfolio_id;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getVolume() {
        return volume;
    }

    public void setVolume(int volume) {
        this.volume = volume;
    }

    public double getFees() {
        return fees;
    }

    public void setFees(double fees) {
        this.fees = fees;
    }

    public int getStatus_code() {
        return status_code;
    }

    public BuySellType getBuy_or_sell() {
        return buy_or_sell;
    }

    public void setBuy_or_sell(BuySellType buy_or_sell) {
        this.buy_or_sell = buy_or_sell;
    }

    public OrderType getOrder_type() {
        return order_type;
    }

    public void setOrder_type(OrderType order_type) {
        this.order_type = order_type;
    }

    public void setStatus_code(int status_code) {
        this.status_code = status_code;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public Stocks getStock() {
        return stock;
    }

    public void setStock(Stocks stock) {
        this.stock = stock;
    }
}
