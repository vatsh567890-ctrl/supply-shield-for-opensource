"""LLMProvider protocol definition and provider resolution."""

from typing import Protocol, TypeVar

from pydantic import BaseModel

from app.config import get_settings

T = TypeVar("T", bound=BaseModel)


class LLMProvider(Protocol):
    """Protocol for LLM structured output completions."""

    async def complete_json(
        self,
        system: str,
        user: str,
        schema: type[T],
        *,
        max_output_tokens: int = 2048,
    ) -> T:
        """Call LLM provider and return validated structured output."""
        ...


_override_provider: LLMProvider | None = None


def set_llm_provider(provider: LLMProvider | None) -> None:
    """Set global LLM provider override (used for testing)."""
    global _override_provider
    _override_provider = provider


def reset_llm_provider() -> None:
    """Reset provider override to None."""
    global _override_provider
    _override_provider = None


def get_llm_provider() -> LLMProvider | None:
    """Return configured LLM provider or None if disabled."""
    if _override_provider is not None:
        return _override_provider

    settings = get_settings()
    if settings.LLM_PROVIDER == "none" or not settings.LLM_API_KEY:
        return None

    if settings.LLM_PROVIDER == "gemini":
        from app.llm.providers.gemini import GeminiProvider

        return GeminiProvider(api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL)

    if settings.LLM_PROVIDER == "anthropic":
        from app.llm.providers.anthropic import AnthropicProvider

        return AnthropicProvider(api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL)

    return None
