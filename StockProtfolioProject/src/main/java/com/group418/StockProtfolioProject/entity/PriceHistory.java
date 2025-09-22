package com.group418.StockProtfolioProject.entity;

import jakarta.persistence.*;

import java.sql.Date;

@Entity
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    private int priceId;
    private double price;
    @Column(name = "created_at")
    private Date createdAt;

    @ManyToOne
    @JoinColumn(name="stock_id", nullable = false)
    private Stocks stock;

    public PriceHistory() {
    }

    public PriceHistory(double price, Date created_at, Stocks stock) {
        this.price = price;
        this.createdAt = created_at;
        this.stock = stock;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Date getCreated_at() {
        return createdAt;
    }

    public void setCreated_at(Date created_at) {
        this.createdAt = created_at;
    }
}
