"""GitHub Pull Request metadata and file diff retrieval.

Implemented in Phase 4.
"""

from typing import Any


async def get_pull_request(
    installation_token: str,
    owner: str,
    repo: str,
    pull_number: int,
) -> dict[str, Any]:
    """Fetch PR metadata.

    Implemented in Phase 4.
    """
    raise NotImplementedError("PR metadata retrieval is implemented in Phase 4")


async def get_pull_request_files(
    installation_token: str,
    owner: str,
    repo: str,
    pull_number: int,
) -> list[dict[str, Any]]:
    """Fetch list of changed files and patch hunks in PR.

    Implemented in Phase 4.
    """
    raise NotImplementedError("PR files retrieval is implemented in Phase 4")
