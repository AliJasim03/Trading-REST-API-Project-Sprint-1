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
    public enum PortfolioStatus { ACTIVE, CLOSED }
    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable=false)
    private PortfolioStatus status = PortfolioStatus.ACTIVE;
    @Column(name ="initial_capital")
    private double initialCapital;
    @Column(name ="created_at")
    private Timestamp createdAt;
    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Holdings> holdings;

    public Portfolios() {}

    public Portfolios(int portfolioId, String portfolioName, String description, double initialCapital, Timestamp createdAt, List<Orders> orders) {
        this.portfolioId = portfolioId;
        this.portfolioName = portfolioName;
        this.description = description;
        this.initialCapital = initialCapital;
        this.createdAt = createdAt;
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

    public List<Holdings> getHoldings() {
        return holdings;
    }
    
    public void setHoldings(List<Holdings> holdings) {
        this.holdings = holdings;
    }
    public PortfolioStatus getStatus() {
        return status;
    }
    public void setStatus(PortfolioStatus status) {
        this.status = status;
    }
}
