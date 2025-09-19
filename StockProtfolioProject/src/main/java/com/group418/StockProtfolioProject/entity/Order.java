package com.group418.StockProtfolioProject.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.sql.Timestamp;

@Entity
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int portfolio_id;
    private double price;
    private int volume;
    private enum buy_or_sell {BUY, SELL};
    private enum order_type {Market, Limit, Stop};
    private double fees;
    private int status_code; // 0 = pending, 1 = completed, 2 = cancelled
    private Timestamp created_at;

    public Order() {
    }

    public Order(int portfolio_id, double price, int volume, double fees, int status_code, Timestamp created_at) {
        this.portfolio_id = portfolio_id;
        this.price = price;
        this.volume = volume;
        this.fees = fees;
        this.status_code = status_code;
        this.created_at = created_at;
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

    public void setStatus_code(int status_code) {
        this.status_code = status_code;
    }
}
