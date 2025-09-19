package com.group418.StockProtfolioProject.entity;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
public class Portfolio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String portfolio_name;
    private String description;
    private enum portfolio_type {Personal, Retirement, Speculative};
    private enum risk_profile {Low, Medium, High};
    private double initial_capital;
    private Timestamp created_at;

    @OneToMany(mappedBy = "portfolio")
    private List<Orders> orders;

    public Portfolio() {}

    public Portfolio(int id, String portfolio_name, String description, double initial_capital, List<Orders> orders) {
        this.id = id;
        this.portfolio_name = portfolio_name;
        this.description = description;
        this.initial_capital = initial_capital;
        this.created_at = new Timestamp(System.currentTimeMillis());;
        this.orders = orders;
    }

    public String getPortfolio_name() {
        return portfolio_name;
    }

    public void setPortfolio_name(String portfolio_name) {
        this.portfolio_name = portfolio_name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getInitial_capital() {
        return initial_capital;
    }

    public void setInitial_capital(double initial_capital) {
        this.initial_capital = initial_capital;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

}
