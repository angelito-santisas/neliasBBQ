package com.neliasbbq.order;

import com.neliasbbq.common.BadRequestException;
import com.neliasbbq.menu.MenuItem;
import com.neliasbbq.menu.MenuItemRepository;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    static final BigDecimal SERVICE_FEE = new BigDecimal("50.00");
    private final MenuItemRepository menuRepository;
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher events;
    private final com.neliasbbq.store.StoreService store;

    public OrderService(MenuItemRepository menuRepository, OrderRepository orderRepository, ApplicationEventPublisher events, com.neliasbbq.store.StoreService store) {
        this.menuRepository = menuRepository; this.orderRepository = orderRepository; this.events = events;
        this.store = store;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        store.requireOpenForOrder();
        Map<String, Integer> quantities = new LinkedHashMap<>();
        request.items().forEach(item -> quantities.merge(item.menuItemId(), item.quantity(), Integer::sum));
        if (quantities.values().stream().anyMatch(quantity -> quantity > 99)) throw new BadRequestException("Combined quantity for an item cannot exceed 99.");

        // Check current availability without reserving portions: staff confirmation deducts stock.
        Map<String, MenuItem> menu = new LinkedHashMap<>();
        quantities.keySet().stream().sorted().forEach(id -> {
            MenuItem item = menuRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new BadRequestException("One or more menu items are unavailable."));
            item.checkStock(quantities.get(id));
            menu.put(id, item);
        });

        BigDecimal subtotal = quantities.entrySet().stream()
            .map(entry -> menu.get(entry.getKey()).getPrice().multiply(BigDecimal.valueOf(entry.getValue())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        String instructions = request.specialInstructions() == null ? "" : request.specialInstructions().trim();
        Order order = new Order(subtotal, SERVICE_FEE, instructions);
        quantities.forEach((id, quantity) -> {
            MenuItem item = menu.get(id);
            order.addItem(new OrderItem(id, item.getName(), item.getPrice(), quantity));
        });

        OrderResponse response = OrderResponse.from(orderRepository.save(order));
        events.publishEvent(new OrderCreatedEvent(response));
        return response;
    }
}
