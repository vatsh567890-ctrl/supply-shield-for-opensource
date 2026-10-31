"""Access control service: the exclusive authority for repository authorization decisions."""

from uuid import UUID


class AccessService:
    """Evaluates whether an authenticated user is authorized to access a repository."""

    _user_repo_grants: set[tuple[UUID, UUID]] = set()

    @classmethod
    def grant_access(cls, user_id: UUID, repo_id: UUID) -> None:
        """Grant a user explicit access to a repository."""
        cls._user_repo_grants.add((user_id, repo_id))

    @classmethod
    def revoke_access(cls, user_id: UUID, repo_id: UUID) -> None:
        """Revoke a user's access to a repository."""
        cls._user_repo_grants.discard((user_id, repo_id))

    @classmethod
    def clear_grants(cls) -> None:
        """Clear all grants (for test isolation)."""
        cls._user_repo_grants.clear()

    async def require_repo_access(self, user_id: UUID, repo_id: UUID) -> bool:
        """Evaluate if user_id is authorized to access repo_id."""
        return (user_id, repo_id) in self._user_repo_grants
