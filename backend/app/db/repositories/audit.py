"""Audit log database repository.

Implemented in Phase 1 & 2.
"""

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession


class AuditRepository:
    """Repository handling immutable AuditLog records."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, **kwargs: Any) -> Any:
        raise NotImplementedError("Audit repository is implemented in Phase 1")
