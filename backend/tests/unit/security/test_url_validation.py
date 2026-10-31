"""Unit tests for GitHub PR URL validation.

Implemented in Phase 5.
"""

from app.security.url_validation import PR_URL_REGEX


def test_pr_url_regex():
    valid = "https://github.com/facebook/react/pull/12345"
    assert PR_URL_REGEX.match(valid) is not None

    invalid_http = "http://github.com/facebook/react/pull/12345"
    assert PR_URL_REGEX.match(invalid_http) is None

    invalid_query = "https://github.com/facebook/react/pull/12345?foo=bar"
    assert PR_URL_REGEX.match(invalid_query) is None
