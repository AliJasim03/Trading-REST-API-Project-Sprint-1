package com.group418.StockProtfolioProject.entity;

import jakarta.persistence.*;

import java.sql.Date;

@Entity
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int price_id;
    private double price;
    private Date created_at;

    @ManyToOne
    @JoinColumn(name="stock_id", nullable = false)
    private Stocks stock;

    public PriceHistory() {
    }

    public PriceHistory(double price, Date created_at, Stocks stock) {
        this.price = price;
        this.created_at = created_at;
        this.stock = stock;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Date getCreated_at() {
        return created_at;
    }
}
