"""Extraction limits enforcing archive safety."""

from dataclasses import dataclass


@dataclass(frozen=True)
class ExtractionLimits:
    """Security thresholds for archive extraction."""

    max_files: int = 5000
    max_single_file_bytes: int = 20 * 1024 * 1024  # 20 MB
    max_total_uncompressed_bytes: int = 200 * 1024 * 1024  # 200 MB
    max_compression_ratio: float = 100.0  # 100:1
