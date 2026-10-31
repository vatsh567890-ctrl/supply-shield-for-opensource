"""User and session database repository.

Implemented in Phase 1 & 2.
"""

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession


class UserRepository:
    """Repository handling User and Session data persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: Any) -> Any:
        raise NotImplementedError("User repository is implemented in Phase 1")
