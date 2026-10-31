"""Analysis service: creation, deduplication by (repo, pr, head_sha), and queueing.

Implemented in Phase 5.
"""

from typing import Any
from uuid import UUID


class AnalysisService:
    """Manages analysis lifecycle, idempotency, and job enqueueing."""

    async def create_and_enqueue_scan(
        self,
        repo_id: UUID,
        pr_number: int,
        head_sha: str,
        base_sha: str,
        source: str,
        delivery_id: str | None = None,
    ) -> Any:
        raise NotImplementedError("AnalysisService is implemented in Phase 5")
