"""GitHub PR comment upsert using hidden HTML marker.

Implemented in Phase 4.
"""

HIDDEN_COMMENT_MARKER = "<!-- supplyshield:v1 -->"


async def upsert_pr_comment(
    installation_token: str,
    owner: str,
    repo: str,
    pull_number: int,
    body: str,
) -> None:
    """Find existing SupplyShield comment by marker and update, or create new.

    Implemented in Phase 4.
    """
    raise NotImplementedError("PR comment upsert is implemented in Phase 4")
