"""Core domain models for analysis findings, severity tiers, and diff contexts."""

from dataclasses import dataclass, field
from enum import StrEnum


class Severity(StrEnum):
    """Severity tier for a security finding."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass(frozen=True)
class Finding:
    """Security finding detected by an analysis rule."""

    rule_id: str
    severity: Severity
    weight: int
    message: str
    file_path: str
    line_start: int | None = None
    line_end: int | None = None
    evidence: str | None = None
    package_ecosystem: str | None = None
    package_name: str | None = None
    package_version: str | None = None


@dataclass
class DiffContext:
    """Represents compared changes between two package versions or commit trees."""

    target_type: str  # "package" or "pull_request"
    ecosystem: str | None = None
    package_name: str | None = None
    old_version: str | None = None
    new_version: str | None = None
    added_files: dict[str, bytes] = field(default_factory=dict)
    modified_files: dict[str, tuple[bytes, bytes]] = field(default_factory=dict)
    removed_files: dict[str, bytes] = field(default_factory=dict)
    metadata_delta: dict[str, tuple[object, object]] = field(default_factory=dict)


@dataclass
class ScanResult:
    """Result of running all rules over diff contexts."""

    findings: list[Finding]
    score: int
    level: str
    rule_score: int
    llm_adjustment: int = 0
    floor_applied: int | None = None
