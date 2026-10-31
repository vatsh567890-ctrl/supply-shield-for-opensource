"""Audit log model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class AuditLog(Base):
    """Immutable audit trail entity.

    Fields: id (bigserial), actor_user_id (nullable), action, target_type, target_id,
    metadata (jsonb), ip_hash, created_at.
    """

    __tablename__ = "audit_logs"
    __table_args__ = {"extend_existing": True}
