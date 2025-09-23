package com.group418.StockProtfolioProject.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
//@Table(name="orders")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private int orderId;
    private double price;
    private int volume;
    @Enumerated(EnumType.STRING)
    @Column(name = "buy_or_sell")
    private BuySellType buyOrSell;
    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private OrderType orderType;
    private double fees;
    @Column(name = "status_code")
    private int statusCode; // 0 = pending, 1 = completed, 2 = cancelled
    @Column(name = "created_at")
    private Timestamp createdAt;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name="portfolio_id", nullable=false)
    private Portfolios portfolios;

    @ManyToOne
    @JoinColumn(name="stock_id", nullable=false)
    private Stocks stock;

    public enum BuySellType { BUY, SELL }
    public enum OrderType { Market, Limit, Stop }

    public Orders() {
    }


    public Orders(int orderId, double price, int volume, BuySellType buyOrSell, OrderType orderType, double fees, int statusCode, Timestamp createdAt, Portfolios portfolios, Stocks stock) {
        this.orderId = orderId;
        this.price = price;
        this.volume = volume;
        this.buyOrSell = buyOrSell;
        this.orderType = orderType;
        this.fees = fees;
        this.statusCode = statusCode;
        this.portfolios = portfolios;
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.stock = stock;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
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
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public BuySellType getBuy_or_sell() {
        return buyOrSell;
    }

    public void setBuy_or_sell(BuySellType buy_or_sell) {
        this.buyOrSell = buy_or_sell;
    }

    public OrderType getOrder_type() {
        return orderType;
    }

    public void setOrder_type(OrderType order_type) {
        this.orderType = order_type;
    }

    public void setStatus_code(int status_code) {
        this.statusCode = status_code;
    }

    public Portfolios getPortfolio() {
        return portfolios;
    }

    public void setPortfolio(Portfolios portfolios) {
        this.portfolios = portfolios;
    }

    public Stocks getStock() {
        return stock;
    }

    public void setStock(Stocks stock) {
        this.stock = stock;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
