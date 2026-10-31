"""Add chat_messages table for AI chatbot logging.

Revision ID: 0002_add_chat_messages
Revises: 0001_initial
Create Date: 2026-10-31 14:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0002_add_chat_messages"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create chat_messages table."""
    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("message_length", sa.Integer(), nullable=False),
        sa.Column("message_text", sa.Text(), nullable=True),
        sa.Column("verdict_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_index(
        "ix_chat_messages_user_id",
        "chat_messages",
        ["user_id"],
    )


def downgrade() -> None:
    """Drop chat_messages table."""
    op.drop_index("ix_chat_messages_user_id", table_name="chat_messages")
    op.drop_table("chat_messages")

