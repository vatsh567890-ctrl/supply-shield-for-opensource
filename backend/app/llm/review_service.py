"""LLM review service orchestrating prompts, provider calls, retries, and caching.

Implemented in Phase 6.
"""

from typing import Any

from app.llm.schemas import ReviewOutput

PROMPT_VERSION = "v1.0.0"


class ReviewService:
    """Manages LLM review execution with caching and validation fallbacks."""

    async def review_diff(self, context: Any, findings: list[Any]) -> ReviewOutput | None:
        raise NotImplementedError("ReviewService is implemented in Phase 6")
