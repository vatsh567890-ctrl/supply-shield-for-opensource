"""Verdict override model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class VerdictOverride(Base):
    """User verdict override entity.

    Fields: id (uuid), verdict_id, user_id, action, reason, created_at.
    """

    __tablename__ = "verdict_overrides"
    __table_args__ = {"extend_existing": True}
