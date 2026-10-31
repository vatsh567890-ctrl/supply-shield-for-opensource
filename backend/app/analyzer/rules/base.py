"""Rule protocol definition for security analyzers."""

from typing import Protocol

from app.analyzer.models import DiffContext, Finding


class Rule(Protocol):
    """Protocol that all detection rules must implement."""

    rule_id: str

    def evaluate(self, context: DiffContext) -> list[Finding]:
        """Analyze a DiffContext and return detected findings."""
        ...
