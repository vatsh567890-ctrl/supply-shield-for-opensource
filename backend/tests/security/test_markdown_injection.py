"""Security tests for markdown injection and @mention ping neutralization."""

from app.utils.markdown import format_github_text, neutralize_mentions


def test_markdown_and_mention_injection():
    # Attempted ping injection
    payload = "@channel @everyone @here please look at this"
    sanitized = neutralize_mentions(payload)
    assert "@\u200bchannel" in sanitized
    assert "@\u200beveryone" in sanitized
    assert "@\u200bhere" in sanitized

    # Markdown injection
    formatted = format_github_text("Test [malicious](javascript:alert(1))")
    assert r"\[malicious\]\(javascript:alert\(1\)\)" in formatted
