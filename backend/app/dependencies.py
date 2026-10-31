"""FastAPI dependency injection providers."""

from collections.abc import AsyncGenerator
from typing import Any

from fastapi import Request


async def get_db() -> AsyncGenerator[Any, None]:
    """Database session dependency.

    Implemented in Phase 1.
    """
    raise NotImplementedError("Database session dependency is implemented in Phase 1")
    yield None


async def get_session_user(request: Request) -> Any:
    """Extract authenticated user from server-side session cookie.

    Implemented in Phase 2.
    """
    raise NotImplementedError("Session authentication dependency is implemented in Phase 2")


async def require_repo_access(request: Request) -> Any:
    """Enforce authorization check that user has access to repo installation.

    Implemented in Phase 2.
    """
    raise NotImplementedError("Repository authorization dependency is implemented in Phase 2")
