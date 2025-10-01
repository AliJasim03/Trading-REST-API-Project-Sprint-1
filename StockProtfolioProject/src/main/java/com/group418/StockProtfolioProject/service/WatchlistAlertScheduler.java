package com.group418.StockProtfolioProject.service;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import com.group418.StockProtfolioProject.repository.WatchlistRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class WatchlistAlertScheduler {

    private final WatchlistRepository watchlistRepository;
    private final LivePriceService livePriceService;

    public WatchlistAlertScheduler(WatchlistRepository watchlistRepository,
                                   LivePriceService livePriceService) {
        this.watchlistRepository = watchlistRepository;
        this.livePriceService = livePriceService;
    }

    @Scheduled(fixedRate = 60000) // every 1 min
    public void checkAlerts() {
        // Get all watchlist entries with alerts (including previously triggered ones)
        List<WatchlistEntry> allAlerts = watchlistRepository.findByTargetPriceIsNotNullAndAlertDirectionIsNotNull();

        for (WatchlistEntry entry : allAlerts) {
            try {
                Map<String, Object> priceData =
                        livePriceService.getCurrentPrice(entry.getStock().getStockTicker());

                BigDecimal currentPrice = (BigDecimal) priceData.get("price");
                boolean shouldAlert = checkShouldAlert(entry, currentPrice);

                if (shouldAlert) {
                    // send notification (log for now)
                    System.out.printf("ALERT: %s hit target %s at price %s%n",
                            entry.getStock().getStockTicker(),
                            entry.getTargetPrice(),
                            currentPrice);

                    // Update alert status
                    entry.setNotified(true);
                    entry.setLastTriggeredPrice(currentPrice);
                    entry.setLastTriggeredTime(java.time.LocalDateTime.now());
                    watchlistRepository.save(entry);
                }

            } catch (Exception e) {
                System.err.println("Error checking alert for " + entry.getStock().getStockTicker() + ": " + e.getMessage());
            }
        }
    }

    private boolean checkShouldAlert(WatchlistEntry entry, BigDecimal currentPrice) {
        boolean conditionMet = false;
        
        // Check if price condition is met
        switch (entry.getAlertDirection()) {
            case ABOVE:
                conditionMet = currentPrice.compareTo(entry.getTargetPrice()) >= 0;
                break;
            case BELOW:
                conditionMet = currentPrice.compareTo(entry.getTargetPrice()) <= 0;
                break;
        }
        
        // If condition is not met, no alert
        if (!conditionMet) {
            return false;
        }
        
        // If never triggered before, trigger now
        if (!entry.getNotified() || entry.getLastTriggeredPrice() == null) {
            return true;
        }
        
        // If already triggered, only re-trigger if price moved significantly away and came back
        BigDecimal lastPrice = entry.getLastTriggeredPrice();
        BigDecimal threshold = entry.getTargetPrice();
        
        // Calculate if price moved away significantly (5% or more)
        BigDecimal moveAwayThreshold = threshold.multiply(new BigDecimal("0.05")); // 5%
        boolean movedAwaySignificantly = false;
        
        switch (entry.getAlertDirection()) {
            case ABOVE:
                // For ABOVE alerts, check if price went significantly below target after last trigger
                movedAwaySignificantly = lastPrice.subtract(threshold).abs().compareTo(moveAwayThreshold) > 0 &&
                                        currentPrice.compareTo(threshold.subtract(moveAwayThreshold)) <= 0;
                break;
            case BELOW:
                // For BELOW alerts, check if price went significantly above target after last trigger  
                movedAwaySignificantly = lastPrice.subtract(threshold).abs().compareTo(moveAwayThreshold) > 0 &&
                                        currentPrice.compareTo(threshold.add(moveAwayThreshold)) >= 0;
                break;
        }
        
        return movedAwaySignificantly;
    }
}
