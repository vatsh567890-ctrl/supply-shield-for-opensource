"""Gemini LLM provider implementation.

Implemented in Phase 6.
"""

from typing import TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class GeminiProvider:
    """Gemini API provider using structured outputs."""

    def __init__(self, api_key: str, model: str = "gemini-1.5-pro") -> None:
        self.api_key = api_key
        self.model = model

    async def complete_json(
        self,
        system: str,
        user: str,
        schema: type[T],
        *,
        max_output_tokens: int = 2048,
    ) -> T:
        raise NotImplementedError("GeminiProvider is implemented in Phase 6")
