"""Shared HTTP client with SSRF host validation, timeouts, retries, and size caps.

Implemented in Phase 4.
"""

from typing import Any

import httpx


async def safe_request(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    content: bytes | None = None,
    json: Any = None,
    max_response_bytes: int = 50 * 1024 * 1024,
    timeout_seconds: float = 30.0,
) -> httpx.Response:
    """Execute outbound HTTP request strictly adhering to SSRF host allowlist and size caps.

    Implemented in Phase 4.
    """
    raise NotImplementedError("SSRF-safe HTTP client is implemented in Phase 4")
