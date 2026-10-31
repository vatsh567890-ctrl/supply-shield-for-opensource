"""Redis connection settings for arq job queue.

Implemented in Phase 5.
"""

from arq.connections import RedisSettings

from app.config import get_settings


def get_redis_settings() -> RedisSettings:
    """Return arq Redis connection settings from application config."""
    settings = get_settings()
    return RedisSettings.from_dsn(settings.REDIS_URL)
