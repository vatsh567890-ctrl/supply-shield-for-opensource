"""Verdict model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class Verdict(Base):
    """Analysis verdict entity.

    Fields: id (uuid), analysis_id (unique), repo_id, score, level, rule_score,
    llm_adjustment, floor_applied, ai_status, intent_summary, plain_english_explanation, created_at.
    """

    __tablename__ = "verdicts"
    __table_args__ = {"extend_existing": True}
