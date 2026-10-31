"""Verdict, finding, and override database repository."""

from dataclasses import dataclass, field
from uuid import UUID

from sqlalchemy.orm import Session


@dataclass
class VerdictContext:
    """Safe verdict context view exposed to the chat assistant."""

    id: UUID
    repo_id: UUID
    score: int
    level: str
    floor_applied: int | None
    ai_status: str
    findings: list[dict[str, str]] = field(default_factory=list)


class VerdictRepository:
    """Repository handling Verdict, Finding, and Override entities."""

    _registry: dict[UUID, VerdictContext] = {}

    def __init__(self, session: Session | None = None) -> None:
        self.session = session

    @classmethod
    def register_test_verdict(cls, context: VerdictContext) -> None:
        """Register verdict context for test and in-memory execution."""
        cls._registry[context.id] = context

    @classmethod
    def clear_registry(cls) -> None:
        """Clear test registry."""
        cls._registry.clear()

    async def get_by_id(self, verdict_id: UUID) -> VerdictContext | None:
        """Fetch verdict by ID returning safe context view."""
        return self._registry.get(verdict_id)
