"""Repository data access repository.

Implemented in Phase 1 & 7.
"""

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession


class RepoRepository:
    """Repository handling Repo and Installation entity queries."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, repo_id: Any) -> Any:
        raise NotImplementedError("Repo repository is implemented in Phase 1")
