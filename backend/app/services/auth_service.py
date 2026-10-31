"""Authentication service: OAuth code exchange, profile fetch, session persistence.

Implemented in Phase 2.
"""

from typing import Any


class AuthService:
    """Handles OAuth lifecycle and session creation."""

    async def complete_oauth_flow(self, code: str) -> tuple[Any, str]:
        raise NotImplementedError("AuthService is implemented in Phase 2")
