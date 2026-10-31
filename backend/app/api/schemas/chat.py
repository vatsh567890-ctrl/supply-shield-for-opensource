"""Pydantic schemas for chat endpoints."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Chat message request payload."""

    model_config = {"extra": "forbid"}

    message: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="User question for the SupplyShield help assistant (1 to 500 characters).",
    )
    verdict_id: UUID | None = Field(
        default=None,
        description="Optional verdict UUID to provide context for the question.",
    )


class ChatResponse(BaseModel):
    """Chat message response payload."""

    model_config = {"extra": "forbid"}

    reply: str = Field(
        ...,
        max_length=1200,
        description="Assistant reply in plain text.",
    )
    source: Literal["llm", "faq", "refused"] = Field(
        ...,
        description="Origin of the response: llm, faq, or refused.",
    )
    ai_status: Literal["ok", "disabled", "unavailable"] = Field(
        ...,
        description="Status of the AI system: ok, disabled, or unavailable.",
    )
