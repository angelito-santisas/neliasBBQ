package com.neliasbbq.order;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff/orders")
public class StaffOrderController {
    private final StaffOrderService orders;
    public StaffOrderController(StaffOrderService orders) { this.orders = orders; }
    @GetMapping public List<OrderResponse> pending(@RequestParam(defaultValue = "") String number) { return orders.pending(number); }
    @PostMapping("/{id}/cancel") public OrderResponse cancel(@PathVariable UUID id, java.security.Principal principal) {
        return orders.cancel(id, principal.getName());
    }
    @PostMapping("/{id}/confirm") public OrderResponse confirm(@PathVariable UUID id, java.security.Principal principal) {
        return orders.confirm(id, principal.getName());
    }
}
