package com.group418.StockProtfolioProject.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Size;

import java.sql.Timestamp;

@Entity
public class Portfolio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Size(max=100)
    private String portfolio_name;
    @Size(max=255)
    private String description;
    private enum portfolio_type {Personal, Retirement, Speculative};
    private enum risk_profile {Low, Medium, High};
    private double initial_capital;
    private Timestamp created_at;

    public Portfolio() {}

    public Portfolio(String portfolio_name, String description, double initial_capital) {
        this.portfolio_name = portfolio_name;
        this.description = description;
        this.initial_capital = initial_capital;
        this.created_at = new Timestamp(System.currentTimeMillis());
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
