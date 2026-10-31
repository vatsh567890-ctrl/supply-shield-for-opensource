"""Worker task definitions.

Implemented in Phase 5.
"""

from uuid import UUID


async def run_analysis(ctx: dict[str, object], analysis_id: str | UUID) -> None:
    """Execute analysis pipeline for a queued job.

    Implemented in Phase 5.
    """
    raise NotImplementedError("run_analysis task is implemented in Phase 5")
