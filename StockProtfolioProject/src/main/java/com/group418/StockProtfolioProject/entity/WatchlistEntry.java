package com.group418.StockProtfolioProject.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "watchlist")
public class WatchlistEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    private Stocks stock;

    private BigDecimal targetPrice;

    @Enumerated(EnumType.STRING)
    private AlertDirection alertDirection; // ABOVE or BELOW

    private Boolean notified = false; // track if alert sent
    
    public WatchlistEntry() {
    }
    // getters and setters
    public Long getId() {
        return id;
    } 
    public void setId(Long id) {
        this.id = id;
    }
    public Stocks getStock() {
        return stock;
    }
    public void setStock(Stocks stock) {
        this.stock = stock;
    }
    public BigDecimal getTargetPrice() {
        return targetPrice;
    }
    public void setTargetPrice(BigDecimal targetPrice) {
        this.targetPrice = targetPrice;
    }
    public AlertDirection getAlertDirection() {
        return alertDirection;
    }
    public void setAlertDirection(AlertDirection alertDirection) {
        this.alertDirection = alertDirection;
    }
    public Boolean getNotified() {
        return notified;
    }
    public void setNotified(Boolean notified) {
        this.notified = notified;
    }
}

