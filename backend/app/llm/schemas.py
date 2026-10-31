"""LLM output validation schemas."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LLMConcern(BaseModel):
    """Specific concern identified by LLM."""

    model_config = ConfigDict(extra="forbid")

    title: str = Field(..., max_length=80)
    explanation: str = Field(..., max_length=300)
    file: str | None = Field(default=None, max_length=260)


class ReviewOutput(BaseModel):
    """Structured LLM review output strictly validated with extra='forbid'."""

    model_config = ConfigDict(extra="forbid")

    intent_summary: str = Field(..., max_length=300)
    plain_english_explanation: str = Field(..., max_length=800)
    concerns: list[LLMConcern] = Field(default_factory=list, max_length=10)
    suggested_adjustment: int = Field(..., ge=-10, le=10)
    confidence: Literal["low", "medium", "high"]
