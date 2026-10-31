"""ML Shadow Results entity model for logging shadow predictions."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MLShadowResult(Base):
    """Database model for storing shadow ML model outputs."""

    __tablename__ = "ml_shadow_results"
    __table_args__ = {"extend_existing": True}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    model_version: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    probability: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    predicted_label: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    top_features: Mapped[dict[str, Any] | list[Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    execution_time_ms: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

