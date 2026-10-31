"""OSV.dev vulnerability database integration.

Implemented in Phase 4.
"""

from typing import Any


async def query_osv_vulnerabilities(
    ecosystem: str,
    package_name: str,
    version: str,
) -> list[dict[str, Any]]:
    """Query OSV.dev for known security advisories by package and version.

    Implemented in Phase 4.
    """
    raise NotImplementedError("OSV client is implemented in Phase 4")
