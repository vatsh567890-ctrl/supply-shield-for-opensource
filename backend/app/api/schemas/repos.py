"""Repository schemas."""

from datetime import datetime
from uuid import UUID

from app.api.schemas.common import StrictBaseModel


class RepoSummaryResponse(StrictBaseModel):
    """Repository item with latest verdict status."""

    id: UUID
    installation_id: UUID
    github_repo_id: int
    owner: str
    name: str
    default_branch: str
    latest_score: int | None = None
    latest_level: str | None = None
    last_analyzed_at: datetime | None = None
    created_at: datetime


class TrendPoint(StrictBaseModel):
    """Daily trend metrics."""

    date: str
    max_score: int
    count: int


class RepoTrendsResponse(StrictBaseModel):
    """Repository trend series over time."""

    trends: list[TrendPoint]
