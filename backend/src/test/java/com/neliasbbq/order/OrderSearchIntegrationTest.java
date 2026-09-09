package com.neliasbbq.order;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional(readOnly = true)
@EnabledIfEnvironmentVariable(named = "SUPABASE_INTEGRATION_TESTS", matches = "true")
class OrderSearchIntegrationTest {
    @Autowired OrderRepository orders;

    @Test void searchesPersistedPendingOrdersByShortAndFullNumber() {
        var pending = orders.findTop100ByStatusOrderByCreatedAtAsc("submitted");
        if (pending.isEmpty()) {
            assertTrue(orders.searchPending("").isEmpty());
            return;
        }
        String id = pending.get(0).getId().toString();
        var exact = orders.searchPending(id);
        assertEquals(1, exact.size());
        assertEquals(id, exact.get(0).getId().toString());
        assertTrue(orders.searchPending(id.substring(0, 8)).stream().anyMatch(order -> order.getId().toString().equals(id)));
    }
}
