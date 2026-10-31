"""Safe extraction of tgz, zip, and whl archives with security limit enforcement.

Implemented in Phase 3.
"""

from app.analyzer.diff.tree import FileTree
from app.analyzer.extraction.limits import ExtractionLimits


def safe_extract_archive(
    archive_bytes: bytes,
    archive_format: str,
    limits: ExtractionLimits | None = None,
) -> FileTree:
    """Extract an archive into an in-memory FileTree enforcing all security limits.

    Implemented in Phase 3.
    """
    raise NotImplementedError("safe_extract_archive is implemented in Phase 3")
