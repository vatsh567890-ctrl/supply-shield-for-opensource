"""Override service: validates and records overrides with immutable audit log.

Implemented in Phase 7.
"""

from typing import Any
from uuid import UUID


class OverrideService:
    """Handles verdict manual acceptance and rejection overrides."""

    async def apply_override(
        self,
        verdict_id: UUID,
        user_id: UUID,
        action: str,
        reason: str,
        ip_hash: str | None = None,
    ) -> Any:
        raise NotImplementedError("OverrideService is implemented in Phase 7")
