"""Initial database schema migration stub.

Revision ID: 0001_initial
Revises: None
Create Date: 2026-10-30 00:00:00.000000
"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply initial migration schema (Implemented in Phase 1)."""
    # Schema definitions for users, sessions, installations, repos, analyses, verdicts, findings, etc.
    pass


def downgrade() -> None:
    """Revert initial migration schema (Implemented in Phase 1)."""
    pass
