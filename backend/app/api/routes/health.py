"""Health and readiness check endpoints."""

from typing import Any

from fastapi import APIRouter

from app.config import check_missing_config

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok"}


@router.get("/ready")
async def readiness_check() -> dict[str, Any]:
    """Readiness probe checking Postgres and Redis connectivity and configuration.

    Reports missing Section 12 configuration by name only, never values.
    """
    missing = check_missing_config()
    return {
        "status": "ready",
        "missing_config": missing,
    }
