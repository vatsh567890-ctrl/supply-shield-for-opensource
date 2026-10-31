"""Worker entrypoint for arq background processor.

Implemented in Phase 5.
"""

from app.queue.connection import get_redis_settings
from app.worker.tasks import run_analysis


class WorkerSettings:
    """arq Worker process configuration."""

    functions = [run_analysis]
    redis_settings = get_redis_settings()


if __name__ == "__main__":
    import asyncio

    from arq import run_worker

    asyncio.run(run_worker(WorkerSettings))  # type: ignore[arg-type]
