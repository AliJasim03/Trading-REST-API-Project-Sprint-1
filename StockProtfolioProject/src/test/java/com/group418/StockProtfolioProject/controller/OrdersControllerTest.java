package com.group418.StockProtfolioProject.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.service.OrdersService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class OrdersControllerTest {

    private OrdersService ordersService;
    private OrdersController ordersController;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        ordersService = mock(OrdersService.class);
        ordersController = new OrdersController(ordersService);
        mockMvc = MockMvcBuilders.standaloneSetup(ordersController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testPlaceOrder_returnsOrder() throws Exception {
        Orders request = new Orders();
        request.setPrice(10.5);
        request.setVolume(100);

        Orders returned = new Orders();
        returned.setPrice(10.5);
        returned.setVolume(100);

        when(ordersService.placeOrder(eq(1), eq(2), ArgumentMatchers.any(Orders.class))).thenReturn(returned);

        mockMvc.perform(post("/orders/place")
                        .param("portfolio_id", "1")
                        .param("stock_id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.price").value(10.5))
                .andExpect(jsonPath("$.volume").value(100));

        verify(ordersService, times(1)).placeOrder(eq(1), eq(2), ArgumentMatchers.any(Orders.class));
    }

    @Test
    void testGetTradingHistory_returnsList() throws Exception {
        Orders o = new Orders();
        o.setPrice(1.0);
        List<Orders> list = Collections.singletonList(o);

        when(ordersService.getTradingHistory(1)).thenReturn(list);

        mockMvc.perform(get("/orders/history")
                        .param("portfolio_id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].price").value(1.0));

        verify(ordersService, times(1)).getTradingHistory(1);
    }

    @Test
    void testGetOrderStatus_returnsOrder() throws Exception {
        Orders o = new Orders();
        o.setPrice(5.25);

        when(ordersService.getOrderStatus(123)).thenReturn(o);

        mockMvc.perform(get("/orders/123/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(5.25));

        verify(ordersService, times(1)).getOrderStatus(123);
    }
}
