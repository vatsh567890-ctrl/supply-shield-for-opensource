"""npm registry client: package metadata, tarball URLs, and attestations.

Implemented in Phase 4.
"""

from typing import Any


class NpmRegistryClient:
    """Client for querying the npm registry."""

    async def get_package_metadata(self, name: str) -> dict[str, Any]:
        raise NotImplementedError("NpmRegistryClient is implemented in Phase 4")

    async def get_version_artifact_url(self, name: str, version: str) -> str:
        raise NotImplementedError("NpmRegistryClient is implemented in Phase 4")
