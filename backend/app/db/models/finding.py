"""Finding model definition.

Implemented in Phase 1.
"""

from app.db.base import Base


class Finding(Base):
    """Detection finding entity.

    Fields: id (uuid), verdict_id, rule_id, severity, weight, package_ecosystem,
    package_name, package_version, file_path, line_start, line_end, message, evidence.
    """

    __tablename__ = "findings"
    __table_args__ = {"extend_existing": True}
