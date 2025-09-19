package com.group418.StockProtfolioProject.controller;

import com.group418.StockProtfolioProject.entity.Order;
import com.group418.StockProtfolioProject.service.OrdersService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrdersController {

    private final OrdersService ordersService;
    public OrdersController(OrdersService orderService) {
        this.ordersService = orderService;
    }

    // new order
    @PostMapping("/place")
    public ResponseEntity<Order> placeOrder(@RequestParam Integer portfolio_id,
                                            @RequestParam Integer stock_id,
                                            @RequestBody Order order_request){
        Order order = ordersService.placeOrder(portfolio_id, stock_id, order_request);
        return ResponseEntity.ok(order);
    }


}
