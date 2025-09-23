package com.group418.StockProtfolioProject.entity;

import jakarta.persistence.*;

import java.sql.Timestamp;


@Entity
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    private int priceId;
    private double price;
    @Column(name = "created_at")
    private java.sql.Timestamp createdAt;

    @ManyToOne
    @JoinColumn(name="stock_id", nullable = false)
    private Stocks stock;

    public PriceHistory() {
    }

    public PriceHistory(double price, Timestamp created_at, Stocks stock, int priceId) {
        this.priceId = priceId;
        this.price = price;
        this.createdAt = created_at;
        this.stock = stock;
    }

    public int getPriceId() {
        return priceId;
    }

    public void setPriceId(int priceId) {
        this.priceId = priceId;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public java.sql.Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.sql.Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Stocks getStock() {
        return stock;
    }
    public void setStock(Stocks stock) {
        this.stock = stock;
    }
}
