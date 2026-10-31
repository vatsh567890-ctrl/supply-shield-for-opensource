"""Analysis model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class Analysis(Base):
    """Analysis scan run entity.

    Fields: id (uuid), repo_id, pr_number, head_sha, base_sha, source, delivery_id (unique, nullable),
    status, error_code, error_message, attempts, created_at, started_at, finished_at;
    unique (repo_id, pr_number, head_sha).
    """

    __tablename__ = "analyses"
    __table_args__ = {"extend_existing": True}
