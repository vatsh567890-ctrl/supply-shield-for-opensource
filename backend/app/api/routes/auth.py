"""Authentication routes: GitHub OAuth login, callback, and logout."""

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from app.api.schemas.auth import LogoutResponse
from app.errors import NotImplementedAppError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/github/login")
async def github_login() -> RedirectResponse:
    """Redirect user to GitHub OAuth authorization.

    Implemented in Phase 2.
    """
    raise NotImplementedAppError("GitHub sign-in is not configured yet.")


@router.get("/github/callback")
async def github_callback() -> RedirectResponse:
    """Handle GitHub OAuth callback, set session cookie, and redirect.

    Implemented in Phase 2.
    """
    raise NotImplementedAppError("GitHub sign-in is not configured yet.")


@router.post("/logout", response_model=LogoutResponse)
async def logout() -> LogoutResponse:
    """Revoke current user session.

    Implemented in Phase 2.
    """
    raise NotImplementedAppError("Logout is implemented in Phase 2")
