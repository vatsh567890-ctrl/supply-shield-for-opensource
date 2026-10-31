"""Repository routes for listing, verdict history, and trends."""

from fastapi import APIRouter

from app.api.schemas.common import Page
from app.api.schemas.repos import RepoSummaryResponse, RepoTrendsResponse
from app.api.schemas.verdicts import VerdictDetailResponse

router = APIRouter(prefix="/repos", tags=["repos"])


@router.get("", response_model=list[RepoSummaryResponse])
async def list_repos() -> list[RepoSummaryResponse]:
    """List repositories accessible by user with latest verdict status.

    Implemented in Phase 7.
    """
    raise NotImplementedError("List repos endpoint is implemented in Phase 7")


@router.get("/{owner}/{repo}/verdicts", response_model=Page[VerdictDetailResponse])
async def list_repo_verdicts(
    owner: str,
    repo: str,
    cursor: str | None = None,
    limit: int = 20,
) -> Page[VerdictDetailResponse]:
    """Paginated list of verdicts for a repository.

    Implemented in Phase 7.
    """
    raise NotImplementedError("Repository verdicts list is implemented in Phase 7")


@router.get("/{owner}/{repo}/trends", response_model=RepoTrendsResponse)
async def get_repo_trends(
    owner: str,
    repo: str,
    days: int = 30,
) -> RepoTrendsResponse:
    """Historical risk score trends and counts.

    Implemented in Phase 7.
    """
    raise NotImplementedError("Repository trends endpoint is implemented in Phase 7")
