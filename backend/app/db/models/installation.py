"""Installation and user_installations model definitions.

Implemented in Phase 1.
"""

from app.db.base import Base


class Installation(Base):
    """GitHub App installation entity.

    Fields: id (uuid), github_installation_id (bigint, unique), account_login, account_type, suspended_at, created_at.
    """

    __tablename__ = "installations"
    __table_args__ = {"extend_existing": True}


class UserInstallation(Base):
    """Many-to-many relationship between users and accessible installations.

    Fields: user_id, installation_id, refreshed_at (composite key).
    """

    __tablename__ = "user_installations"
    __table_args__ = {"extend_existing": True}
