"""PyPI registry client: JSON API, sdist, wheels, and provenance.

Implemented in Phase 4.
"""

from typing import Any


class PyPIRegistryClient:
    """Client for querying PyPI."""

    async def get_package_metadata(self, name: str) -> dict[str, Any]:
        raise NotImplementedError("PyPIRegistryClient is implemented in Phase 4")

    async def get_version_artifact_url(self, name: str, version: str) -> str:
        raise NotImplementedError("PyPIRegistryClient is implemented in Phase 4")
