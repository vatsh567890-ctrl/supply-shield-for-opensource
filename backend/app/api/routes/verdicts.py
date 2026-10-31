"""Verdict detail and user override endpoints."""

from uuid import UUID

from fastapi import APIRouter

from app.api.schemas.verdicts import (
    CreateOverrideRequest,
    OverrideResponse,
    VerdictDetailResponse,
)

router = APIRouter(prefix="/verdicts", tags=["verdicts"])


@router.get("/{id}", response_model=VerdictDetailResponse)
async def get_verdict(id: UUID) -> VerdictDetailResponse:
    """Retrieve full verdict details, findings, overrides, and metadata.

    Implemented in Phase 7.
    """
    raise NotImplementedError("Get verdict endpoint is implemented in Phase 7")


@router.post("/{id}/overrides", response_model=OverrideResponse)
async def create_verdict_override(
    id: UUID,
    request: CreateOverrideRequest,
) -> OverrideResponse:
    """Submit accept/reject override with mandatory reason.

    Implemented in Phase 7.
    """
    raise NotImplementedError("Create override endpoint is implemented in Phase 7")
