"""Compare two FileTree instances and generate DiffContext.

Implemented in Phase 3.
"""

from app.analyzer.diff.tree import FileTree
from app.analyzer.models import DiffContext


def compare_trees(
    old_tree: FileTree,
    new_tree: FileTree,
    *,
    ecosystem: str | None = None,
    package_name: str | None = None,
    old_version: str | None = None,
    new_version: str | None = None,
) -> DiffContext:
    """Compute added, removed, and modified files between old and new trees.

    Implemented in Phase 3.
    """
    raise NotImplementedError("compare_trees is implemented in Phase 3")
