"""Common Pydantic schema models."""

from datetime import datetime
from typing import TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class StrictBaseModel(BaseModel):
    """Base model forbidding unexpected extra fields."""

    model_config = ConfigDict(extra="forbid")


class ErrorBody(StrictBaseModel):
    """Standard error response structure."""

    code: str
    message: str
    request_id: str


class Timestamps(StrictBaseModel):
    """Common timestamp mixin."""

    created_at: datetime


class Page[T](StrictBaseModel):
    """Generic pagination wrapper."""

    items: list[T]
    next_cursor: str | None = None
    total_count: int | None = Field(default=None)
