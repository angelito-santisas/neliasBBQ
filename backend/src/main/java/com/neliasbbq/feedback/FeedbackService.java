package com.neliasbbq.feedback;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {
    private final FeedbackRepository repository;
    public FeedbackService(FeedbackRepository repository) { this.repository = repository; }

    @Transactional
    public UUID create(CreateFeedbackRequest request) {
        String comments = request.comments() == null ? "" : request.comments().trim();
        Feedback feedback = new Feedback(request.overallRating(), request.foodQualityRating(), request.wouldRecommend(), comments, request.anonymous());
        return repository.save(feedback).getId();
    }
}
