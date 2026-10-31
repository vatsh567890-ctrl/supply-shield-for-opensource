"""Webhook payload and delivery schemas."""

from app.api.schemas.common import StrictBaseModel


class WebhookResponse(StrictBaseModel):
    """Webhook acceptance confirmation."""

    status: str = "accepted"
