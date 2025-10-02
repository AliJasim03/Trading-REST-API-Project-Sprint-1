package com.group418.StockProtfolioProject.service;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.entity.Stocks;
import com.group418.StockProtfolioProject.repository.OrdersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderProcessingSimulatorTest {

    @Mock
    private OrdersRepository ordersRepository;

    @Mock
    private OrdersService ordersService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderProcessingSimulator orderProcessingSimulator;

    @Mock
    private Orders mockOrder1;

    @Mock
    private Orders mockOrder2;

    @Mock
    private Stocks mockStock;

    @BeforeEach
    void setUp() {
        // Set default values for configurable properties
        ReflectionTestUtils.setField(orderProcessingSimulator, "percentFailures", 10);
        ReflectionTestUtils.setField(orderProcessingSimulator, "minProcessingDelaySeconds", 5);
        ReflectionTestUtils.setField(orderProcessingSimulator, "maxProcessingDelaySeconds", 30);
    }

    @Test
    void testSendOrdersToExchange_WithNoInitializedOrders() {
        // Arrange
        when(ordersRepository.findByStatusCode(0)).thenReturn(Collections.emptyList());

        // Act
        orderProcessingSimulator.sendOrdersToExchange();

        // Assert
        verify(ordersRepository, times(1)).findByStatusCode(0);
        verify(ordersRepository, never()).save(any(Orders.class));
        verify(notificationService, never()).notifySystem(anyString(), anyString());
    }

    @Test
    void testSendOrdersToExchange_HandlesException() {
        // Arrange
        when(ordersRepository.findByStatusCode(0)).thenThrow(new RuntimeException("Database error"));

        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> orderProcessingSimulator.sendOrdersToExchange());
    }

    @Test
    void testProcessExchangeResponses_WithNoProcessingOrders() {
        // Arrange
        when(ordersRepository.findByStatusCode(1)).thenReturn(Collections.emptyList());

        // Act
        orderProcessingSimulator.processExchangeResponses();

        // Assert
        verify(ordersRepository, times(1)).findByStatusCode(1);
        verify(ordersService, never()).updateOrderStatus(anyInt(), anyInt());
    }

    @Test
    void testProcessExchangeResponses_OrdersCanBeFilled() {
        // Arrange
        when(mockOrder1.getOrderId()).thenReturn(1);
        List<Orders> processingOrders = Collections.singletonList(mockOrder1);
        when(ordersRepository.findByStatusCode(1)).thenReturn(processingOrders);
        
        // Set failure rate to 0 to ensure orders are filled
        ReflectionTestUtils.setField(orderProcessingSimulator, "percentFailures", 0);

        // Act - call multiple times to increase chances of processing
        for (int i = 0; i < 5; i++) {
            orderProcessingSimulator.processExchangeResponses();
        }

        // Assert - at least one order should be filled (status 2)
        verify(ordersService, atLeastOnce()).updateOrderStatus(eq(1), eq(2));
    }

    @Test
    void testProcessExchangeResponses_OrdersCanBeRejected() {
        // Arrange
        when(mockOrder1.getOrderId()).thenReturn(1);
        List<Orders> processingOrders = Collections.singletonList(mockOrder1);
        when(ordersRepository.findByStatusCode(1)).thenReturn(processingOrders);
        
        // Set failure rate to 100 to ensure orders are rejected
        ReflectionTestUtils.setField(orderProcessingSimulator, "percentFailures", 100);

        // Act - call multiple times to increase chances of processing
        for (int i = 0; i < 5; i++) {
            orderProcessingSimulator.processExchangeResponses();
        }

        // Assert - at least one order should be rejected (status 3)
        verify(ordersService, atLeastOnce()).updateOrderStatus(eq(1), eq(3));
    }

    @Test
    void testProcessExchangeResponses_HandlesException() {
        // Arrange
        when(ordersRepository.findByStatusCode(1)).thenThrow(new RuntimeException("Database error"));

        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> orderProcessingSimulator.processExchangeResponses());
    }

    @Test
    void testGetSimulatorStats_ReturnsCorrectStats() {
        // Arrange
        when(ordersRepository.countByStatusCode(0)).thenReturn(5L);
        when(ordersRepository.countByStatusCode(1)).thenReturn(3L);
        when(ordersRepository.countByStatusCode(2)).thenReturn(100L);
        when(ordersRepository.countByStatusCode(3)).thenReturn(10L);

        // Act
        OrderProcessingSimulator.SimulatorStats stats = orderProcessingSimulator.getSimulatorStats();

        // Assert
        assertNotNull(stats);
        assertEquals(5L, stats.initializedOrders);
        assertEquals(3L, stats.processingOrders);
        assertEquals(100L, stats.filledOrders);
        assertEquals(10L, stats.rejectedOrders);
        assertEquals(10, stats.failureRate);

        verify(ordersRepository, times(1)).countByStatusCode(0);
        verify(ordersRepository, times(1)).countByStatusCode(1);
        verify(ordersRepository, times(1)).countByStatusCode(2);
        verify(ordersRepository, times(1)).countByStatusCode(3);
    }

    @Test
    void testGetSimulatorStats_WithZeroCounts() {
        // Arrange
        when(ordersRepository.countByStatusCode(anyInt())).thenReturn(0L);

        // Act
        OrderProcessingSimulator.SimulatorStats stats = orderProcessingSimulator.getSimulatorStats();

        // Assert
        assertNotNull(stats);
        assertEquals(0L, stats.initializedOrders);
        assertEquals(0L, stats.processingOrders);
        assertEquals(0L, stats.filledOrders);
        assertEquals(0L, stats.rejectedOrders);
    }

    @Test
    void testUpdateSimulatorSettings_ValidFailureRate() {
        // Act
        orderProcessingSimulator.updateSimulatorSettings(25);

        // Assert
        Object failureRate = ReflectionTestUtils.getField(orderProcessingSimulator, "percentFailures");
        assertEquals(25, failureRate);
    }

    @Test
    void testUpdateSimulatorSettings_ClampsTooHighValue() {
        // Act
        orderProcessingSimulator.updateSimulatorSettings(150);

        // Assert
        Object failureRate = ReflectionTestUtils.getField(orderProcessingSimulator, "percentFailures");
        assertEquals(100, failureRate);
    }

    @Test
    void testUpdateSimulatorSettings_ClampsTooLowValue() {
        // Act
        orderProcessingSimulator.updateSimulatorSettings(-10);

        // Assert
        Object failureRate = ReflectionTestUtils.getField(orderProcessingSimulator, "percentFailures");
        assertEquals(0, failureRate);
    }

    @Test
    void testUpdateSimulatorSettings_AcceptsBoundaryValues() {
        // Test 0
        orderProcessingSimulator.updateSimulatorSettings(0);
        Object failureRate = ReflectionTestUtils.getField(orderProcessingSimulator, "percentFailures");
        assertEquals(0, failureRate);

        // Test 100
        orderProcessingSimulator.updateSimulatorSettings(100);
        failureRate = ReflectionTestUtils.getField(orderProcessingSimulator, "percentFailures");
        assertEquals(100, failureRate);
    }

    @Test
    void testSimulatorStats_ConstructorAndFields() {
        // Act
        OrderProcessingSimulator.SimulatorStats stats = 
            new OrderProcessingSimulator.SimulatorStats(10L, 5L, 100L, 15L, 20);

        // Assert
        assertEquals(10L, stats.initializedOrders);
        assertEquals(5L, stats.processingOrders);
        assertEquals(100L, stats.filledOrders);
        assertEquals(15L, stats.rejectedOrders);
        assertEquals(20, stats.failureRate);
    }

    @Test
    void testSendOrdersToExchange_UpdatesStatusCorrectly() {
        // Arrange
        when(mockOrder1.getOrderId()).thenReturn(1);
        when(mockOrder1.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("TSLA");
        
        List<Orders> initializedOrders = Collections.singletonList(mockOrder1);
        when(ordersRepository.findByStatusCode(0)).thenReturn(initializedOrders);

        // Act
        orderProcessingSimulator.sendOrdersToExchange();

        // Assert - verify the order status was set to 1 (PROCESSING)
        ArgumentCaptor<Integer> statusCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(mockOrder1, atLeastOnce()).setStatusCode(statusCaptor.capture());
        
        List<Integer> capturedStatuses = statusCaptor.getAllValues();
        assertTrue(capturedStatuses.contains(1), "Order should be set to PROCESSING status (1)");
    }

    @Test
    void testProcessExchangeResponses_CallsUpdateOrderStatusWithCorrectValues() {
        // Arrange
        when(mockOrder1.getOrderId()).thenReturn(123);
        List<Orders> processingOrders = Collections.singletonList(mockOrder1);
        when(ordersRepository.findByStatusCode(1)).thenReturn(processingOrders);

        // Act - call multiple times to ensure processing happens
        for (int i = 0; i < 10; i++) {
            orderProcessingSimulator.processExchangeResponses();
        }

        // Assert - verify updateOrderStatus was called with order ID 123 and status 2 or 3
        ArgumentCaptor<Integer> orderIdCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> statusCaptor = ArgumentCaptor.forClass(Integer.class);
        
        verify(ordersService, atLeastOnce()).updateOrderStatus(
            orderIdCaptor.capture(), 
            statusCaptor.capture()
        );
        
        assertTrue(orderIdCaptor.getAllValues().contains(123));
        // Status should be either 2 (FILLED) or 3 (REJECTED)
        assertTrue(statusCaptor.getAllValues().stream().anyMatch(s -> s == 2 || s == 3));
    }

    @Test
    void testSendOrdersToExchange_SavesOrdersToRepository() {
        // Arrange
        when(mockOrder1.getOrderId()).thenReturn(1);
        when(mockOrder1.getStock()).thenReturn(mockStock);
        when(mockStock.getStockTicker()).thenReturn("AAPL");
        
        List<Orders> initializedOrders = Collections.singletonList(mockOrder1);
        when(ordersRepository.findByStatusCode(0)).thenReturn(initializedOrders);

        // Act - call multiple times to increase chances of processing
        for (int i = 0; i < 5; i++) {
            orderProcessingSimulator.sendOrdersToExchange();
        }

        // Assert - verify save was called at least once
        verify(ordersRepository, atLeastOnce()).save(mockOrder1);
    }

    @Test
    void testProcessExchangeResponses_MultipleOrders_ProcessedIndependently() {
        // Arrange
        when(mockOrder1.getOrderId()).thenReturn(1);
        when(mockOrder2.getOrderId()).thenReturn(2);
        
        List<Orders> processingOrders = Arrays.asList(mockOrder1, mockOrder2);
        when(ordersRepository.findByStatusCode(1)).thenReturn(processingOrders);
        
        // Set 50% failure rate for mixed results
        ReflectionTestUtils.setField(orderProcessingSimulator, "percentFailures", 50);

        // Act - call multiple times
        for (int i = 0; i < 10; i++) {
            orderProcessingSimulator.processExchangeResponses();
        }

        // Assert - both orders should have been processed at some point
        verify(ordersService, atLeastOnce()).updateOrderStatus(eq(1), anyInt());
        verify(ordersService, atLeastOnce()).updateOrderStatus(eq(2), anyInt());
    }
}