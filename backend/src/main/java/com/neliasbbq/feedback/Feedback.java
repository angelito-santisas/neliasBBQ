package com.neliasbbq.feedback;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "customer_feedback")
public class Feedback {
    @Id private UUID id;
    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "overall_rating") private int overallRating;
    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "food_quality_rating") private Integer foodQualityRating;
    @Column(name = "would_recommend") private boolean wouldRecommend;
    private String comments;
    private boolean anonymous;
    @Column(name = "order_id") private UUID orderId;
    @Column(name = "created_at") private OffsetDateTime createdAt;

    protected Feedback() {}
    public Feedback(int overallRating, Integer foodQualityRating, boolean wouldRecommend, String comments, UUID orderId) {
        this.id = UUID.randomUUID(); this.overallRating = overallRating; this.foodQualityRating = foodQualityRating;
        this.wouldRecommend = wouldRecommend; this.comments = comments; this.anonymous = false; this.orderId = orderId; this.createdAt = OffsetDateTime.now();
    }
    public UUID getId() { return id; }
    public UUID getOrderId() { return orderId; }
}
