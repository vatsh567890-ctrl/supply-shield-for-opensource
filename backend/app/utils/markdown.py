"""Markdown formatting utilities and GitHub output sanitization."""

import re

MENTION_REGEX = re.compile(r"@([a-zA-Z0-9_\-\/]+)")


def neutralize_mentions(text: str) -> str:
    """Neutralize @mentions by inserting a zero-width space (\u200b) after the @ symbol."""
    return MENTION_REGEX.sub("@\u200b\\1", text)


def escape_markdown(text: str) -> str:
    """Escape special markdown characters for safe rendering in GitHub comments."""
    special_chars = r"([\\`*_{}[\]()#+\-.!|])"
    return re.sub(special_chars, r"\\\1", text)


def format_github_text(text: str) -> str:
    """Neutralize mentions and escape markdown characters."""
    return escape_markdown(neutralize_mentions(text))
