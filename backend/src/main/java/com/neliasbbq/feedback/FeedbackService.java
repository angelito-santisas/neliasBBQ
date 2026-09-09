package com.neliasbbq.feedback;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {
    private final FeedbackRepository repository;
    private final com.neliasbbq.order.OrderRepository orders;
    public FeedbackService(FeedbackRepository repository, com.neliasbbq.order.OrderRepository orders) {
        this.repository = repository; this.orders = orders;
    }

    @Transactional
    public UUID create(CreateFeedbackRequest request) {
        String number = request.orderNumber() == null ? "" : request.orderNumber().trim().toLowerCase(java.util.Locale.ROOT);
        if (!number.matches("(?:[0-9a-f]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})")) {
            throw new com.neliasbbq.common.BadRequestException("Enter the 8-character order number or full order ID.");
        }
        var matches = orders.findIdsByNumber(number);
        if (matches.isEmpty()) throw new com.neliasbbq.common.BadRequestException("Order number was not found. Check your order number and try again.");
        if (matches.size() > 1) throw new com.neliasbbq.common.BadRequestException("This short order number matches multiple orders. Enter the full order ID.");
        UUID orderId = matches.get(0);
        // Serialize feedback for this order, including short-ID and full-ID submissions.
        orders.findByIdForUpdate(orderId).orElseThrow(() -> new com.neliasbbq.common.BadRequestException("Order number was not found."));
        if (repository.existsByOrderId(orderId)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                "Feedback has already been submitted for this order number.");
        }
        String comments = request.comments() == null ? "" : request.comments().trim();
        Feedback feedback = new Feedback(request.overallRating(), request.foodQualityRating(), request.wouldRecommend(), comments, orderId);
        return repository.save(feedback).getId();
    }
}
