package com.group418.StockProtfolioProject.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.repository.OrdersRepository;

import java.util.List;
import java.util.Random;

/**
 * Order Processing Simulator
 * 
 * This service simulates realistic order processing behavior similar to a trading exchange.
 * It automatically processes orders through different states:
 * 
 * 0: Initialized (just placed)
 * 1: Processing (sent to exchange, awaiting response)
 * 2: Filled (successfully completed)
 * 3: Rejected (failed to complete)
 */
@Service
public class OrderProcessingSimulator {
    
    private static final Logger LOG = LoggerFactory.getLogger(OrderProcessingSimulator.class);
    
    @Value("${order.simulator.failure.rate:10}")
    private int percentFailures = 10; // 10% failure rate by default
    
    @Value("${order.simulator.processing.delay.min:5}")
    private int minProcessingDelaySeconds = 5;
    
    @Value("${order.simulator.processing.delay.max:30}")
    private int maxProcessingDelaySeconds = 30;
    
    @Autowired
    private OrdersRepository ordersRepository;
    
    @Autowired
    private OrdersService ordersService;
    
    @Autowired
    private NotificationService notificationService;
    
    private final Random random = new Random();
    
    /**
     * Move orders from INITIALIZED (0) to PROCESSING (1)
     * Runs every 10 seconds to simulate sending orders to exchange
     */
    @Scheduled(fixedRateString = "${order.simulator.send.rate:10000}") // 10 seconds
    public void sendOrdersToExchange() {
        try {
            List<Orders> initializedOrders = ordersRepository.findByStatusCode(0);
            
            if (initializedOrders.isEmpty()) {
                LOG.debug("No initialized orders to process");
                return;
            }
            
            int processed = 0;
            for (Orders order : initializedOrders) {
                // Simulate some orders taking longer to send
                if (shouldProcessNow()) {
                    order.setStatusCode(1); // Set to PROCESSING
                    ordersRepository.save(order);
                    processed++;
                    
                    LOG.info("Order {} sent to exchange for processing", order.getOrderId());
                    
                    // Optional: Send notification that order is being processed
                    notificationService.notifySystem(
                        "Order Processing", 
                        String.format("Order #%d for %s is being processed by exchange", 
                                     order.getOrderId(), order.getStock().getStockTicker())
                    );
                }
            }
            
            if (processed > 0) {
                LOG.info("Sent {} orders to exchange for processing", processed);
            }
            
        } catch (Exception e) {
            LOG.error("Error in sendOrdersToExchange: ", e);
        }
    }
    
    /**
     * Process orders that are in PROCESSING (1) state
     * Moves them to either FILLED (2) or REJECTED (3)
     * Runs every 15 seconds to simulate exchange responses
     */
    @Scheduled(fixedRateString = "${order.simulator.fill.rate:15000}") // 15 seconds
    public void processExchangeResponses() {
        try {
            List<Orders> processingOrders = ordersRepository.findByStatusCode(1);
            
            if (processingOrders.isEmpty()) {
                LOG.debug("No processing orders to fill or reject");
                return;
            }
            
            int filled = 0;
            int rejected = 0;
            
            for (Orders order : processingOrders) {
                // Simulate random processing times
                if (shouldProcessNow()) {
                    boolean shouldReject = random.nextInt(100) < percentFailures;
                    
                    if (shouldReject) {
                        // Reject the order
                        String rejectionReason = getRandomRejectionReason();
                        ordersService.updateOrderStatus(order.getOrderId(), 3);
                        rejected++;
                        
                        LOG.info("Order {} rejected: {}", order.getOrderId(), rejectionReason);
                        
                    } else {
                        // Fill the order
                        ordersService.updateOrderStatus(order.getOrderId(), 2);
                        filled++;
                        
                        LOG.info("Order {} filled successfully", order.getOrderId());
                    }
                }
            }
            
            if (filled > 0 || rejected > 0) {
                LOG.info("Processed exchange responses: {} filled, {} rejected", filled, rejected);
            }
            
        } catch (Exception e) {
            LOG.error("Error in processExchangeResponses: ", e);
        }
    }
    
    /**
     * Simulate realistic processing delays
     * Not all orders are processed immediately
     */
    private boolean shouldProcessNow() {
        // 70% chance of processing in any given cycle
        return random.nextInt(100) < 70;
    }
    
    /**
     * Generate realistic rejection reasons
     */
    private String getRandomRejectionReason() {
        String[] reasons = {
            "Insufficient funds",
            "Market closed",
            "Price out of range",
            "Stock suspended",
            "Risk limits exceeded",
            "Invalid order size",
            "System timeout"
        };
        
        return reasons[random.nextInt(reasons.length)];
    }
    
    /**
     * Get current simulator statistics
     */
    public SimulatorStats getSimulatorStats() {
        long initialized = ordersRepository.countByStatusCode(0);
        long processing = ordersRepository.countByStatusCode(1);
        long filled = ordersRepository.countByStatusCode(2);
        long rejected = ordersRepository.countByStatusCode(3);
        
        return new SimulatorStats(initialized, processing, filled, rejected, percentFailures);
    }
    
    /**
     * Update simulation parameters
     */
    public void updateSimulatorSettings(int newFailureRate) {
        this.percentFailures = Math.max(0, Math.min(100, newFailureRate));
        LOG.info("Updated failure rate to {}%", this.percentFailures);
    }
    
    /**
     * Statistics class for simulator
     */
    public static class SimulatorStats {
        public final long initializedOrders;
        public final long processingOrders;
        public final long filledOrders;
        public final long rejectedOrders;
        public final int failureRate;
        
        public SimulatorStats(long initialized, long processing, long filled, long rejected, int failureRate) {
            this.initializedOrders = initialized;
            this.processingOrders = processing;
            this.filledOrders = filled;
            this.rejectedOrders = rejected;
            this.failureRate = failureRate;
        }
    }
}