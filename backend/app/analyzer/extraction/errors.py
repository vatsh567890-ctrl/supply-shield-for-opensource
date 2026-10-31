"""Archive extraction security errors."""


class ArchiveSecurityError(Exception):
    """Raised when an archive violates safety limits or structure rules."""

    pass


class ZipBombError(ArchiveSecurityError):
    """Raised when compression ratio or uncompressed size exceeds threshold."""

    pass


class PathTraversalError(ArchiveSecurityError):
    """Raised when archive contains relative or absolute directory traversal."""

    pass


class UnsupportedEntryError(ArchiveSecurityError):
    """Raised when archive contains symlinks, hardlinks, or device files."""

    pass
