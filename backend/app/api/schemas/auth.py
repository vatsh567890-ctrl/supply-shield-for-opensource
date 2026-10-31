"""Authentication schemas."""

from app.api.schemas.common import StrictBaseModel


class LogoutResponse(StrictBaseModel):
    """Logout success confirmation."""

    success: bool = True
