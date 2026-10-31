"""Analysis request and response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.api.schemas.common import StrictBaseModel


class CreateAnalysisRequest(StrictBaseModel):
    """PR URL payload for triggering a manual scan."""

    pr_url: str = Field(..., max_length=500)


class CreateAnalysisResponse(StrictBaseModel):
    """Accepted analysis creation response."""

    analysis_id: UUID


class AnalysisStatusResponse(StrictBaseModel):
    """Analysis status polling response."""

    id: UUID
    repo_id: UUID
    pr_number: int
    head_sha: str
    status: str
    error_code: str | None = None
    error_message: str | None = None
    verdict_id: UUID | None = None
    created_at: datetime
    started_at: datetime | None = None
    finished_at: datetime | None = None
