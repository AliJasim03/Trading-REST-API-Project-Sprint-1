package com.group418.StockProtfolioProject.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
public class Portfolios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name ="portfolio_id")
    private int portfolioId;
    @Column(name ="portfolio_name")
    private String portfolioName;
    private String description;
    private enum portfolioType {Personal, Retirement, Speculative};
    private enum riskProfile {Low, Medium, High};
    @Column(name ="initial_capital")
    private double initialCapital;
    @Column(name ="created_at")
    private Timestamp createdAt;

    /*@OneToMany(mappedBy = "portfolios")
    @JsonManagedReference
    private List<Orders> orders;*/

    public Portfolios() {}

    public Portfolios(int portfolioId, String portfolioName, String description, double initialCapital, Timestamp createdAt, List<Orders> orders) {
        this.portfolioId = portfolioId;
        this.portfolioName = portfolioName;
        this.description = description;
        this.initialCapital = initialCapital;
        this.createdAt = createdAt;
        //this.orders = orders;
    }

    public int getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(int portfolioId) {
        this.portfolioId = portfolioId;
    }

    public String getPortfolioName() {
        return portfolioName;
    }

    public void setPortfolioName(String portfolioName) {
        this.portfolioName = portfolioName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getInitialCapital() {
        return initialCapital;
    }

    public void setInitialCapital(double initialCapital) {
        this.initialCapital = initialCapital;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

  /*  public List<Orders> getOrders() {
        return orders;
    }

    public void setOrders(List<Orders> orders) {
        this.orders = orders;
    }*/
}
