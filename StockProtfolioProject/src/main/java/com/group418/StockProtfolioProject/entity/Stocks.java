package com.group418.StockProtfolioProject.entity;


import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
public class Stocks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_id")
    private int stockId;
    @Column(name = "stock_ticker")
    private String stockTicker;
    @Column(name = "stock_name")
    private String stockName;
    private String sector;  //ENUM MAYBE?
    private String market; // ENUM MAYBE?
    private String currency; //ENUM MAYBE?
    private String isin; // International Securities Identification Number
    private String cusip; // Committee on Uniform Securities Identification Procedures
    @Column(name = "created_at")
    private Timestamp createdAt;

    @OneToMany(mappedBy = "stock")
    private List<Orders> orders;

    @OneToMany(mappedBy = "stock")
    private List<PriceHistory> priceHistory;

    public Stocks(){}


    public Stocks(int stockId, String stockSymbol, String stockName, String sector, String market, String currency, String isin, String cusip, Timestamp createdAt, List<Orders> orders, List<PriceHistory> priceHistory) {
        this.stockId = stockId;
        this.stockTicker = stockSymbol;
        this.stockName = stockName;
        this.sector = sector;
        this.market = market;
        this.currency = currency;
        this.isin = isin;
        this.cusip = cusip;

        this.createdAt = new Timestamp(System.currentTimeMillis());;
        this.orders = orders;
        this.priceHistory = priceHistory;
    }

    public String getStockTicker() {
        return stockTicker;
    }

    public void setStockTicker(String stockTicker) {
        this.stockTicker = stockTicker;
    }

    public String getStockName() {
        return stockName;
    }

    public void setStockName(String stockName) {
        this.stockName = stockName;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getMarket() {
        return market;
    }

    public void setMarket(String market) {
        this.market = market;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getIsin() {
        return isin;
    }

    public void setIsin(String isin) {
        this.isin = isin;
    }

    public String getCusip() {
        return cusip;
    }

    public void setCusip(String cusip) {
        this.cusip = cusip;
    }

    public Timestamp getCreated_at() {
        return createdAt;
    }
}

