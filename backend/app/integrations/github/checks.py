"""GitHub Check Run management.

Implemented in Phase 4.
"""

from typing import Any


async def create_check_run(
    installation_token: str,
    owner: str,
    repo: str,
    head_sha: str,
    name: str = "SupplyShield Security Scan",
) -> int:
    """Create in_progress Check Run and return its check run ID.

    Implemented in Phase 4.
    """
    raise NotImplementedError("Check run creation is implemented in Phase 4")


async def update_check_run(
    installation_token: str,
    owner: str,
    repo: str,
    check_run_id: int,
    conclusion: str,
    output: dict[str, Any],
) -> None:
    """Update Check Run status, conclusion, and details output.

    Implemented in Phase 4.
    """
    raise NotImplementedError("Check run update is implemented in Phase 4")
