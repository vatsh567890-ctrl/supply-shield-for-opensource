"""Security tests for endpoint rate limiting."""

import pytest

from app.security.rate_limit import check_rate_limit, reset_rate_limits


@pytest.mark.asyncio
async def test_rate_limit_allows_under_threshold():
    reset_rate_limits()
    key = "test:user:1"
    for _ in range(5):
        allowed, retry_after = await check_rate_limit(key, limit=5, window_seconds=60)
        assert allowed is True
        assert retry_after == 0


@pytest.mark.asyncio
async def test_rate_limit_blocks_over_threshold():
    reset_rate_limits()
    key = "test:user:2"
    for _ in range(3):
        allowed, _ = await check_rate_limit(key, limit=3, window_seconds=60)
        assert allowed is True

    # 4th request must be blocked
    allowed, retry_after = await check_rate_limit(key, limit=3, window_seconds=60)
    assert allowed is False
    assert retry_after > 0
