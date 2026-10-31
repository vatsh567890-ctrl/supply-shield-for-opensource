"""User model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class User(Base):
    """User account entity.

    Fields: id (uuid), github_id (bigint, unique), login, avatar_url, created_at, last_login_at.
    """

    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}
