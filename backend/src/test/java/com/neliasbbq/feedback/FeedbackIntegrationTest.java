package com.neliasbbq.feedback;

import com.neliasbbq.order.Order;
import com.neliasbbq.order.OrderRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@EnabledIfEnvironmentVariable(named = "SUPABASE_INTEGRATION_TESTS", matches = "true")
class FeedbackIntegrationTest {
    @Autowired OrderRepository orders;
    @Autowired FeedbackRepository feedback;
    @Autowired FeedbackService service;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;

    @Test void linksFeedbackAndRejectsTheSameOrderUsingFullOrShortNumber() {
        // Synthetic order and feedback stay inside this rolled-back transaction; no checkout/webhook.
        var order = orders.saveAndFlush(new Order(BigDecimal.ZERO, BigDecimal.ZERO, "QA rollback-only feedback test"));
        String number = order.getId().toString();
        var id = service.create(new CreateFeedbackRequest(5, 4, true, "QA rollback-only feedback", number));
        feedback.flush();
        assertEquals(order.getId(), feedback.findById(id).orElseThrow().getOrderId());
        assertEquals(1, jdbc.queryForObject("select count(*) from customer_feedback where order_id = ?", Integer.class, order.getId()));
        var error = assertThrows(org.springframework.web.server.ResponseStatusException.class,
            () -> service.create(new CreateFeedbackRequest(4, null, true, "Duplicate", number.substring(0, 8))));
        assertEquals(409, error.getStatusCode().value());
    }

    @Test void databaseAlsoRejectsDuplicateFeedback() {
        var order = orders.saveAndFlush(new Order(BigDecimal.ZERO, BigDecimal.ZERO, "QA rollback-only uniqueness test"));
        feedback.saveAndFlush(new Feedback(5, null, true, "First", order.getId()));
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class,
            () -> feedback.saveAndFlush(new Feedback(4, null, true, "Duplicate", order.getId())));
    }
}
