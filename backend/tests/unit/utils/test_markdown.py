"""Tests for markdown escaping and @mention neutralization."""

from app.utils.markdown import escape_markdown, format_github_text, neutralize_mentions


def test_neutralize_mentions():
    text = "Hello @everyone and @maintainer/team"
    neutralized = neutralize_mentions(text)
    assert "@\u200beveryone" in neutralized
    assert "@\u200bmaintainer/team" in neutralized
    assert "@everyone" not in neutralized


def test_escape_markdown():
    text = "Danger: *bold* and `code` and [link](url)"
    escaped = escape_markdown(text)
    assert r"\*bold\*" in escaped
    assert r"\`code\`" in escaped


def test_format_github_text():
    text = "Ping @admin on *alert*"
    formatted = format_github_text(text)
    assert "@\u200badmin" in formatted
