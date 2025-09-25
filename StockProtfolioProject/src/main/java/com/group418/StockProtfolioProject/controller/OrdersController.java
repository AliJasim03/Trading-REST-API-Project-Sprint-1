package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.Orders;
import com.group418.StockProtfolioProject.service.OrdersService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrdersController {

    private final OrdersService ordersService;

    public OrdersController(OrdersService orderService) {
        this.ordersService = orderService;
    }

    // place order
    @PostMapping("/place")
    public ResponseEntity<Orders> placeOrder(@RequestParam Integer portfolio_id,
                                             @RequestParam Integer stock_id,
                                             @RequestBody Orders orders_request){
        Orders orders = ordersService.placeOrder(portfolio_id, stock_id, orders_request);
        return ResponseEntity.ok(orders);
    }

    // get history
    @GetMapping("/history")
    public ResponseEntity<List<Orders>> getTradingHistory(@RequestParam Integer portfolio_id) {
        List<Orders> history = ordersService.getTradingHistory(portfolio_id);
        return ResponseEntity.ok(history);
    }

    // get order status
    @GetMapping("/{order_id}/status")
    public ResponseEntity<Orders> getOrderStatus(@PathVariable Integer order_id) {
        Orders orders = ordersService.getOrderStatus(order_id);
        return ResponseEntity.ok(orders);
    }

    // get all orders (useful for admin/debugging)
    @GetMapping
    public ResponseEntity<List<Orders>> getAllOrders() {
        List<Orders> orders = ordersService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // update order status
    @PutMapping("/{order_id}/status")
    public ResponseEntity<Orders> updateOrderStatus(@PathVariable Integer order_id, @RequestParam Integer status) {
        Orders updatedOrder = ordersService.updateOrderStatus(order_id, status);
        return ResponseEntity.ok(updatedOrder);
    }
}