"""Anthropic LLM provider implementation.

Implemented in Phase 6.
"""

from typing import TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class AnthropicProvider:
    """Anthropic Claude provider using tool-use / json schema."""

    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022") -> None:
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
        raise NotImplementedError("AnthropicProvider is implemented in Phase 6")
