package com.neliasbbq.order;

import com.neliasbbq.common.BadRequestException;
import com.neliasbbq.menu.MenuItem;
import com.neliasbbq.menu.MenuItemRepository;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    static final BigDecimal SERVICE_FEE = new BigDecimal("50.00");
    private final MenuItemRepository menuRepository;
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher events;

    public OrderService(MenuItemRepository menuRepository, OrderRepository orderRepository, ApplicationEventPublisher events) {
        this.menuRepository = menuRepository; this.orderRepository = orderRepository; this.events = events;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        Map<String, Integer> quantities = new LinkedHashMap<>();
        request.items().forEach(item -> quantities.merge(item.menuItemId(), item.quantity(), Integer::sum));
        if (quantities.values().stream().anyMatch(quantity -> quantity > 99)) throw new BadRequestException("Combined quantity for an item cannot exceed 99.");

        Map<String, MenuItem> menu = menuRepository.findAllById(quantities.keySet()).stream()
            .filter(MenuItem::isActive).collect(Collectors.toMap(MenuItem::getId, Function.identity()));
        if (menu.size() != quantities.size()) throw new BadRequestException("One or more menu items are unavailable.");

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
