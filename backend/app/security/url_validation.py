"""Strict GitHub pull request URL parsing and validation."""

import re

PR_URL_REGEX = re.compile(
    r"^https://github\.com/([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+)/pull/([1-9][0-9]*)$"
)


def parse_pr_url(url: str) -> tuple[str, str, int]:
    """Parse strictly validated GitHub PR URL into (owner, repo, pr_number).

    Implemented in Phase 5.
    """
    raise NotImplementedError("PR URL validation is implemented in Phase 5")
