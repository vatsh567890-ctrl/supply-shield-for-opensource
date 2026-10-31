"""Session model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class Session(Base):
    """User session entity.

    Fields: id (uuid), user_id, token_hash (unique), created_at, expires_at, revoked_at, user_agent_hash.
    """

    __tablename__ = "sessions"
    __table_args__ = {"extend_existing": True}
