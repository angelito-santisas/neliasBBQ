package com.neliasbbq.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFeedbackRequest(
    @NotNull @Min(1) @Max(5) Integer overallRating,
    @Min(1) @Max(5) Integer foodQualityRating,
    @NotNull Boolean wouldRecommend,
    @Size(max = 1000) String comments,
    @jakarta.validation.constraints.NotBlank @Size(max = 36) String orderNumber
) {}
