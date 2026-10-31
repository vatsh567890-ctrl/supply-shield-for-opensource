"""Current authenticated user profile and installations."""

from fastapi import APIRouter

from app.api.schemas.me import InstallationResponse, UserProfileResponse

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=UserProfileResponse)
async def get_me() -> UserProfileResponse:
    """Return authenticated user profile.

    Implemented in Phase 2.
    """
    raise NotImplementedError("User profile retrieval is implemented in Phase 2")


@router.get("/installations", response_model=list[InstallationResponse])
async def get_my_installations() -> list[InstallationResponse]:
    """Return GitHub App installations accessible by the current user.

    Implemented in Phase 2.
    """
    raise NotImplementedError("User installations retrieval is implemented in Phase 2")
