"""Input budgeting and prioritized truncation for LLM prompt context.

Implemented in Phase 6.
"""

from typing import Any


def truncate_context(
    findings: list[Any],
    hunks: list[str],
    max_tokens: int = 60000,
) -> str:
    """Prioritize and truncate diff input within token budget with explicit markers.

    Implemented in Phase 6.
    """
    raise NotImplementedError("truncate_context is implemented in Phase 6")
