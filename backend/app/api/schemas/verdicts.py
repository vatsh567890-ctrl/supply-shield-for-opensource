"""Verdict, finding, and override schemas."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.api.schemas.common import StrictBaseModel


class FindingResponse(StrictBaseModel):
    """Detailed security finding."""

    id: UUID
    rule_id: str
    severity: str
    weight: int
    package_ecosystem: str | None
    package_name: str | None
    package_version: str | None
    file_path: str
    line_start: int | None
    line_end: int | None
    message: str
    evidence: str | None


class OverrideResponse(StrictBaseModel):
    """Verdict override record."""

    id: UUID
    verdict_id: UUID
    user_id: UUID
    action: Literal["accept", "reject"]
    reason: str
    created_at: datetime


class CreateOverrideRequest(StrictBaseModel):
    """Override submission payload."""

    action: Literal["accept", "reject"]
    reason: str = Field(..., min_length=1, max_length=500)


class VerdictDetailResponse(StrictBaseModel):
    """Full verdict response with findings and overrides."""

    id: UUID
    analysis_id: UUID
    repo_id: UUID
    score: int
    level: Literal["LOW", "MEDIUM", "HIGH"]
    rule_score: int
    llm_adjustment: int
    floor_applied: int | None
    ai_status: Literal["ok", "disabled", "unavailable"]
    intent_summary: str | None
    plain_english_explanation: str | None
    created_at: datetime
    findings: list[FindingResponse] = []
    overrides: list[OverrideResponse] = []
