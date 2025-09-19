package com.group418.StockProtfolioProject.entity;


import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
public class Stocks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int stock_id;
    private String stock_symbol;
    private String stock_name;
    private String sector;  //ENUM MAYBE?
    private String market; // ENUM MAYBE?
    private String currency; //ENUM MAYBE?
    private String isin; // International Securities Identification Number
    private String cusip; // Committee on Uniform Securities Identification Procedures
    private Timestamp created_at;

    @OneToMany(mappedBy = "stock")
    private List<Order> orders;

    @OneToMany(mappedBy = "stock")
    private List<PriceHistory> priceHistory;

    public Stocks(){}

    public Stocks(int stock_id, String stock_symbol, String stock_name, String sector, String market, String currency, String isin, String cusip, List<Order> orders, List<PriceHistory> priceHistory) {
        this.stock_id = stock_id;
        this.stock_symbol = stock_symbol;
        this.stock_name = stock_name;
        this.sector = sector;
        this.market = market;
        this.currency = currency;
        this.isin = isin;
        this.cusip = cusip;
        this.created_at = new Timestamp(System.currentTimeMillis());;
        this.orders = orders;
        this.priceHistory = priceHistory;
    }

    public String getStock_symbol() {
        return stock_symbol;
    }

    public void setStock_symbol(String stock_symbol) {
        this.stock_symbol = stock_symbol;
    }

    public String getStock_name() {
        return stock_name;
    }

    public void setStock_name(String stock_name) {
        this.stock_name = stock_name;
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
        return created_at;
    }
}

