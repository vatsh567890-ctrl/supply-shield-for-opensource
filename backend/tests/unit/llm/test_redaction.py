"""Unit tests for secret redaction.

Implemented in Phase 6.
"""

from app.logging import SecretRedactionFilter


def test_secret_redaction_logging_filter():
    filter_ = SecretRedactionFilter()
    redacted = filter_.redact_text("Here is ghp_123456789012345678901234567890123456 token")
    assert "[REDACTED]" in redacted
    assert "ghp_" not in redacted
