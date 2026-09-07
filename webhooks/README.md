# Webhooks

When `ORDER_WEBHOOK_URL` is configured, the backend sends `order.created` after the database transaction commits. If `ORDER_WEBHOOK_SECRET` is set, `X-Nelias-Signature` contains an HMAC SHA-256 signature of the raw JSON body.

Delivery is currently best-effort. Add persistent retries and idempotent consumers before relying on it for fulfillment.
