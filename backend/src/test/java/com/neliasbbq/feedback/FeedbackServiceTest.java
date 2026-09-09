package com.neliasbbq.feedback;

import com.neliasbbq.common.BadRequestException;
import com.neliasbbq.order.Order;
import com.neliasbbq.order.OrderRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FeedbackServiceTest {
    private final FeedbackRepository feedback = mock(FeedbackRepository.class);
    private final OrderRepository orders = mock(OrderRepository.class);
    private final FeedbackService service = new FeedbackService(feedback, orders);

    @Test void requiresAnOrderNumberAndRejectsMalformedValues() {
        for (String number : new String[]{null, "", " ", "123", "%%%%%%%%", "not-an-order"}) {
            assertThrows(BadRequestException.class, () -> service.create(request(number)));
        }
        verifyNoInteractions(orders, feedback);
    }

    @Test void rejectsUnknownAndAmbiguousNumbers() {
        when(orders.findIdsByNumber("12345678")).thenReturn(List.of());
        assertThrows(BadRequestException.class, () -> service.create(request("12345678")));
        when(orders.findIdsByNumber("12345678")).thenReturn(List.of(UUID.randomUUID(), UUID.randomUUID()));
        assertThrows(BadRequestException.class, () -> service.create(request("12345678")));
        verifyNoInteractions(feedback);
    }

    @Test void normalizesShortNumberAndLocksOrderBeforeCheckingAndSaving() {
        var order = new Order(BigDecimal.TEN, BigDecimal.ZERO, "");
        when(orders.findIdsByNumber("abcdef12")).thenReturn(List.of(order.getId()));
        when(orders.findByIdForUpdate(order.getId())).thenReturn(Optional.of(order));
        when(feedback.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        assertNotNull(service.create(request(" ABCDEF12 ")));
        var sequence = inOrder(orders, feedback);
        sequence.verify(orders).findIdsByNumber("abcdef12");
        sequence.verify(orders).findByIdForUpdate(order.getId());
        sequence.verify(feedback).existsByOrderId(order.getId());
        sequence.verify(feedback).save(argThat(value -> order.getId().equals(value.getOrderId())));
    }

    @Test void duplicateOrderReturnsConflictInsteadOfSavingAgain() {
        var order = new Order(BigDecimal.TEN, BigDecimal.ZERO, "");
        when(orders.findIdsByNumber(order.getId().toString())).thenReturn(List.of(order.getId()));
        when(orders.findByIdForUpdate(order.getId())).thenReturn(Optional.of(order));
        when(feedback.existsByOrderId(order.getId())).thenReturn(true);
        var error = assertThrows(ResponseStatusException.class, () -> service.create(request(order.getId().toString())));
        assertEquals(409, error.getStatusCode().value());
        assertEquals("Feedback has already been submitted for this order number.", error.getReason());
        verify(feedback, never()).save(any());
    }

    private CreateFeedbackRequest request(String number) { return new CreateFeedbackRequest(5, null, true, "Great", number); }
}
