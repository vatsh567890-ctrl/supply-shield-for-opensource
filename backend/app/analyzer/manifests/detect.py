"""Detects modified dependency manifests and parses version deltas.

Implemented in Phase 3.
"""

from typing import NamedTuple


class DependencyDelta(NamedTuple):
    """Represents a detected version bump in a dependency."""

    ecosystem: str
    name: str
    old_version: str | None
    new_version: str


def detect_dependency_changes(
    changed_files: dict[str, tuple[bytes | None, bytes | None]],
) -> list[DependencyDelta]:
    """Inspect changed files to detect package manifest and lockfile version bumps.

    Implemented in Phase 3.
    """
    raise NotImplementedError("detect_dependency_changes is implemented in Phase 3")
