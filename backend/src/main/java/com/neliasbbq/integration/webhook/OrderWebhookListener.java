package com.neliasbbq.integration.webhook;

import com.neliasbbq.order.OrderCreatedEvent;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.time.Duration;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

@Component
public class OrderWebhookListener {
    private static final Logger log = LoggerFactory.getLogger(OrderWebhookListener.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String url;
    private final String secret;

    public OrderWebhookListener(RestClient.Builder builder, ObjectMapper objectMapper,
            @Value("${app.webhook.order-created-url}") String url, @Value("${app.webhook.secret}") String secret) {
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory();
        requestFactory.setReadTimeout(Duration.ofSeconds(5));
        this.restClient = builder.requestFactory(requestFactory).build();
        this.objectMapper = objectMapper; this.url = url; this.secret = secret;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publish(OrderCreatedEvent event) {
        if (url.isBlank()) return;
        try {
            String body = objectMapper.writeValueAsString(new WebhookPayload("order.created", 1, event.order()));
            RestClient.RequestBodySpec request = restClient.post().uri(url).contentType(MediaType.APPLICATION_JSON);
            if (!secret.isBlank()) request.header("X-Nelias-Signature", "sha256=" + sign(body));
            request.body(body).retrieve().toBodilessEntity();
        } catch (Exception exception) {
            log.error("Order webhook delivery failed for order {}: {}", event.order().id(), exception.getMessage());
        }
    }

    private String sign(String body) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
    }

    private record WebhookPayload(String event, int version, Object data) {}
}
