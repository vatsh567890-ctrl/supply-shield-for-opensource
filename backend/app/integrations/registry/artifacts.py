"""Artifact download utility with strict size and time constraints.

Implemented in Phase 4.
"""


async def download_artifact(
    url: str,
    max_bytes: int = 50 * 1024 * 1024,
    timeout_seconds: float = 30.0,
) -> bytes:
    """Download package artifact enforcing byte caps and network timeouts.

    Implemented in Phase 4.
    """
    raise NotImplementedError("Artifact downloader is implemented in Phase 4")
