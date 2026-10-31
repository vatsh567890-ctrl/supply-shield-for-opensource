"""Webhook signature verification using HMAC-SHA256 and constant-time comparison."""


def verify_webhook_signature(payload: bytes, signature_header: str | None, secret: str) -> bool:
    """Verify GitHub X-Hub-Signature-256 header against raw payload.

    Implemented in Phase 5.
    """
    raise NotImplementedError("Webhook signature verification is implemented in Phase 5")
