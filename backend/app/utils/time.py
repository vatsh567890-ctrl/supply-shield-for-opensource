"""Time and UTC date utilities."""

from datetime import UTC, datetime


def utc_now() -> datetime:
    """Return the current time in UTC with explicit timezone info."""
    return datetime.now(UTC)
