package com.group418.StockProtfolioProject.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.sql.Date;

@Entity
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int price_id;
    private double price;
    private Date recorded_at;

    public PriceHistory() {
    }

    public PriceHistory(double price, Date recorded_at) {
        this.price = price;
        this.recorded_at = recorded_at;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Date getCreated_at() {
        return recorded_at;
    }
}
