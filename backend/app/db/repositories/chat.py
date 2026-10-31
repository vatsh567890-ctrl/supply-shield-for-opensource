"""Chat messages database repository."""

import uuid

from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models.chat_message import ChatMessage


class ChatMessageRepository:
    """Repository for managing chat message audit logs."""

    def __init__(self, session: Session | None = None) -> None:
        self.session = session

    async def log_message(
        self,
        *,
        user_id: uuid.UUID,
        source: str,
        message: str,
        verdict_id: uuid.UUID | None = None,
    ) -> None:
        """Write chat message entry, storing message text only if CHAT_LOG_TEXT=True."""
        settings = get_settings()
        stored_text = message if settings.CHAT_LOG_TEXT else None

        record = ChatMessage(
            id=uuid.uuid4(),
            user_id=user_id,
            source=source,
            message_length=len(message),
            message_text=stored_text,
            verdict_id=verdict_id,
        )

        if self.session is not None:
            self.session.add(record)
            try:
                self.session.commit()
            except Exception:
                self.session.rollback()
