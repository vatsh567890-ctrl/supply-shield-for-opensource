"""GitHub OAuth code exchange and user profile retrieval.

Implemented in Phase 2.
"""

from typing import Any


async def exchange_code_for_token(code: str) -> str:
    """Exchange temporary OAuth code for access token.

    Implemented in Phase 2.
    """
    raise NotImplementedError("OAuth code exchange is implemented in Phase 2")


async def fetch_user_profile(token: str) -> dict[str, Any]:
    """Retrieve authenticated user's GitHub profile.

    Implemented in Phase 2.
    """
    raise NotImplementedError("User profile fetching is implemented in Phase 2")


async def fetch_user_installations(token: str) -> list[dict[str, Any]]:
    """Retrieve GitHub App installations accessible by the user.

    Implemented in Phase 2.
    """
    raise NotImplementedError("User installations fetching is implemented in Phase 2")
