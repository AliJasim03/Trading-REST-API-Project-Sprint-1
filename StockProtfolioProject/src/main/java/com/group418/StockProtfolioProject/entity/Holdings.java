package com.group418.StockProtfolioProject.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "holdings")
public class Holdings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "holding_id")
    private int holdingId;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "last_updated")
    private Timestamp lastUpdated;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolios portfolio;

    @ManyToOne
    @JoinColumn(name = "stock_id", nullable = false)
    private Stocks stock;

    public Holdings() {
    }

    public Holdings(int quantity, Portfolios portfolio, Stocks stock) {
        this.quantity = quantity;
        this.portfolio = portfolio;
        this.stock = stock;
        this.lastUpdated = new Timestamp(System.currentTimeMillis());
    }

    // Getters and Setters
    public int getHoldingId() {
        return holdingId;
    }

    public void setHoldingId(int holdingId) {
        this.holdingId = holdingId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Portfolios getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolios portfolio) {
        this.portfolio = portfolio;
    }

    public Stocks getStock() {
        return stock;
    }

    public void setStock(Stocks stock) {
        this.stock = stock;
    }
}