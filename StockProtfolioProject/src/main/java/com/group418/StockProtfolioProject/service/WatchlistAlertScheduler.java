package com.group418.StockProtfolioProject.service;
import com.group418.StockProtfolioProject.entity.WatchlistEntry;
import com.group418.StockProtfolioProject.repository.WatchlistRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
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
        List<WatchlistEntry> pendingAlerts = watchlistRepository.findByNotifiedFalse();

        for (WatchlistEntry entry : pendingAlerts) {
            try {
                Map<String, Object> priceData =
                        livePriceService.getCurrentPrice(entry.getStock().getStockTicker());

                BigDecimal currentPrice = (BigDecimal) priceData.get("price");
                boolean shouldAlert = false;

                switch (entry.getAlertDirection()) {
                    case ABOVE:
                        shouldAlert = currentPrice.compareTo(entry.getTargetPrice()) >= 0;
                        break;
                    case BELOW:
                        shouldAlert = currentPrice.compareTo(entry.getTargetPrice()) <= 0;
                        break;
                }

                if (shouldAlert) {
                    // send notification (log for now)
                    System.out.printf("ALERT: %s hit target %s at price %s%n",
                            entry.getStock().getStockTicker(),
                            entry.getTargetPrice(),
                            currentPrice);

                    // mark as notified
                    entry.setNotified(true);
                    watchlistRepository.save(entry);
                }

            } catch (Exception e) {
                System.err.println("Error checking alert for " + entry.getStock().getStockTicker() + ": " + e.getMessage());
            }
        }
    }
}
