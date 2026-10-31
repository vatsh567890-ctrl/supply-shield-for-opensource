"""ChatMessage model definition."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ChatMessage(Base):
    """Chat message log entity.

    Records user ID, timestamp, source ('llm' | 'faq' | 'refused'), and message length.
    Stores message text only when CHAT_LOG_TEXT is enabled. Never logs cookies or credentials.
    """

    __tablename__ = "chat_messages"
    __table_args__ = {"extend_existing": True}

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    message_length: Mapped[int] = mapped_column(Integer, nullable=False)
    message_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    verdict_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
