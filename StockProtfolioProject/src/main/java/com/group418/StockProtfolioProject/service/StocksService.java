package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import com.group418.StockProtfolioProject.repository.StocksRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class StocksService {

    private final StocksRepository stocksRepository;

    public StocksService(StocksRepository stocksRepository) {
        this.stocksRepository = stocksRepository;
    }

    public List<Stocks> getAllStocks() {
        return stocksRepository.findAll();
    }

    public Stocks getStockById(Integer id) {
        return stocksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found with id: " + id));
    }

    public Stocks createStock(Stocks stock) {
        stock.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return stocksRepository.save(stock);
    }

    public Stocks updateStock(Integer id, Stocks stockDetails) {
        Stocks stock = getStockById(id);

        stock.setStockTicker(stockDetails.getStockTicker());
        stock.setStockName(stockDetails.getStockName());
        stock.setSector(stockDetails.getSector());
        stock.setMarket(stockDetails.getMarket());
        stock.setCurrency(stockDetails.getCurrency());
        stock.setIsin(stockDetails.getIsin());
        stock.setCusip(stockDetails.getCusip());

        return stocksRepository.save(stock);
    }

    public void deleteStock(Integer id) {
        Stocks stock = getStockById(id);
        stocksRepository.delete(stock);
    }
}