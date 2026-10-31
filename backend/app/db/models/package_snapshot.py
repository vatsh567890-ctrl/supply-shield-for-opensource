"""Package snapshot model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class PackageSnapshot(Base):
    """Captured registry package snapshot entity.

    Fields: id (uuid), ecosystem, name, version, published_at, maintainers (jsonb),
    has_provenance (bool), tarball_sha256, captured_at; unique (ecosystem, name, version).
    """

    __tablename__ = "package_snapshots"
    __table_args__ = {"extend_existing": True}
