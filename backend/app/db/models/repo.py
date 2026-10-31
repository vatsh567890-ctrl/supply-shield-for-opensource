"""Repository model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class Repo(Base):
    """Monitored repository entity.

    Fields: id (uuid), installation_id, github_repo_id (bigint, unique), owner, name, default_branch, policy (jsonb), created_at.
    """

    __tablename__ = "repos"
    __table_args__ = {"extend_existing": True}
