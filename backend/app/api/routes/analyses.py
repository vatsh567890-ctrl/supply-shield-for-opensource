"""Analysis endpoints for manual PR scan submission and progress polling."""

from uuid import UUID

from fastapi import APIRouter, status

from app.api.schemas.analyses import (
    AnalysisStatusResponse,
    CreateAnalysisRequest,
    CreateAnalysisResponse,
)

router = APIRouter(prefix="/analyses", tags=["analyses"])


@router.post("", response_model=CreateAnalysisResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_analysis(request: CreateAnalysisRequest) -> CreateAnalysisResponse:
    """Trigger manual PR analysis.

    Implemented in Phase 5.
    """
    raise NotImplementedError("Create analysis endpoint is implemented in Phase 5")


@router.get("/{id}", response_model=AnalysisStatusResponse)
async def get_analysis(id: UUID) -> AnalysisStatusResponse:
    """Retrieve analysis status, errors, and verdict reference.

    Implemented in Phase 5.
    """
    raise NotImplementedError("Get analysis endpoint is implemented in Phase 5")
