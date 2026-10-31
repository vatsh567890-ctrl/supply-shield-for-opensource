"""RegistryClient protocol defining package metadata and download contracts."""

from typing import Any, Protocol


class RegistryClient(Protocol):
    """Protocol for fetching package metadata and artifacts from registries."""

    async def get_package_metadata(self, name: str) -> dict[str, Any]:
        """Fetch package metadata from the registry."""
        ...

    async def get_version_artifact_url(self, name: str, version: str) -> str:
        """Resolve download URL for package version artifact."""
        ...
