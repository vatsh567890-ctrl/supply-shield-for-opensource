"""Add ml_shadow_results table for ML shadow mode logging.

Revision ID: 0003_add_ml_shadow_results
Revises: 0002_add_chat_messages
Create Date: 2026-10-31 17:45:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0003_add_ml_shadow_results"
down_revision: str | None = "0002_add_chat_messages"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create ml_shadow_results table."""
    op.create_table(
        "ml_shadow_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("analysis_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("model_version", sa.String(length=64), nullable=False),
        sa.Column("probability", sa.Float(), nullable=False),
        sa.Column("predicted_label", sa.Integer(), nullable=False),
        sa.Column("top_features", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("execution_time_ms", sa.Float(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(
        "ix_ml_shadow_results_analysis_id",
        "ml_shadow_results",
        ["analysis_id"],
    )


def downgrade() -> None:
    """Drop ml_shadow_results table."""
    op.drop_index("ix_ml_shadow_results_analysis_id", table_name="ml_shadow_results")
    op.drop_table("ml_shadow_results")

