"""LLM cache model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class LLMCache(Base):
    """LLM completion response cache entity.

    Fields: cache_key (pk), response (jsonb), created_at, expires_at.
    """

    __tablename__ = "llm_cache"
    __table_args__ = {"extend_existing": True}
