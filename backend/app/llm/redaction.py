"""Secret pattern redaction for diff content prior to egress."""

from app.logging import SecretRedactionFilter


def redact_secrets(content: str) -> str:
    """Scrub known secret and token patterns from text content before sending to LLM."""
    return SecretRedactionFilter.redact_text(content)
