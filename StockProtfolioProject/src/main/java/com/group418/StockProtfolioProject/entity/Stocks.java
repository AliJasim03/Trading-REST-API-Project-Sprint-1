package com.group418.StockProtfolioProject.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CurrentTimestamp;

import java.sql.Timestamp;

@Entity
public class Stocks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int stock_id;
    private String stock_symbol;
    @Size(max=100)
    @NotNull
    private String stock_name;
    @Size(max=50)
    private String sector;  //ENUM MAYBE?
    @Size(max=20)
    private String market; // ENUM MAYBE?
    private enum currency{USD, EUR, JPY, GBP, AUD, CAD, CHF, CNY, HKD, NZD}; //ENUM MAYBE?
    @Size(max=12)
    private String isin;
    @Size(max=9)
    private String cusip;
    @CurrentTimestamp
    private Timestamp created_at;

    public Stocks(){}

    public Stocks(String stock_symbol, String stock_name, String sector, String market, String isin, String cusip) {
        this.stock_symbol = stock_symbol;
        this.stock_name = stock_name;
        this.sector = sector;
        this.market = market;
        this.isin = isin;
        this.cusip = cusip;
        this.created_at = new Timestamp(System.currentTimeMillis());
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

