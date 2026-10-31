"""Redis fixed-window rate limiter with in-memory fallback."""

import time

from app.config import get_settings

# In-memory fallback tracking: key -> (count, expiry_timestamp)
_memory_cache: dict[str, tuple[int, float]] = {}


def reset_rate_limits() -> None:
    """Clear in-memory rate limit counters (used in testing)."""
    _memory_cache.clear()


async def check_rate_limit(key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
    """Check fixed-window rate limit counter in Redis with graceful in-memory fallback.

    Returns:
        tuple[bool, int]: (is_allowed, retry_after_seconds)
    """
    settings = get_settings()

    try:
        import redis.asyncio as aioredis

        client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=0.2,
            socket_timeout=0.2,
        )
        try:
            current = await client.incr(key)
            if current == 1:
                await client.expire(key, window_seconds)
            ttl = await client.ttl(key)
            closer = getattr(client, "aclose", client.close)
            await closer()
            if current > limit:
                return False, max(1, ttl)
            return True, 0
        except Exception:
            closer = getattr(client, "aclose", client.close)
            await closer()
            raise
    except Exception:
        # Fall back to in-memory rate limiter if Redis is offline
        now = time.time()
        record = _memory_cache.get(key)
        if not record or now > record[1]:
            _memory_cache[key] = (1, now + window_seconds)
            return True, 0

        count, expiry = record
        if count >= limit:
            retry_after = max(1, int(expiry - now))
            return False, retry_after

        _memory_cache[key] = (count + 1, expiry)
        return True, 0


async def check_chat_rate_limits(user_id: str) -> tuple[bool, int]:
    """Enforce chat limits: 20 per 10 minutes and 200 per day.

    Returns:
        tuple[bool, int]: (is_allowed, retry_after_seconds)
    """
    # 20 per 10 minutes (600s)
    ok_10m, retry_10m = await check_rate_limit(f"chat:10m:{user_id}", limit=20, window_seconds=600)
    if not ok_10m:
        return False, retry_10m

    # 200 per 1 day (86400s)
    ok_1d, retry_1d = await check_rate_limit(f"chat:1d:{user_id}", limit=200, window_seconds=86400)
    if not ok_1d:
        return False, retry_1d

    return True, 0
