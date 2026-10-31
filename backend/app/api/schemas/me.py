"""User and installation response schemas for /me endpoints."""

from datetime import datetime
from uuid import UUID

from app.api.schemas.common import StrictBaseModel


class UserProfileResponse(StrictBaseModel):
    """Current authenticated user profile."""

    id: UUID
    github_id: int
    login: str
    avatar_url: str | None
    created_at: datetime
    last_login_at: datetime | None


class InstallationResponse(StrictBaseModel):
    """GitHub App installation item."""

    id: UUID
    github_installation_id: int
    account_login: str
    account_type: str
    suspended_at: datetime | None
    created_at: datetime
