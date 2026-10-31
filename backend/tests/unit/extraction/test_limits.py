"""Unit tests for extraction limits.

Implemented in Phase 3.
"""

from app.analyzer.extraction.limits import ExtractionLimits


def test_extraction_limits_defaults():
    limits = ExtractionLimits()
    assert limits.max_files == 5000
    assert limits.max_compression_ratio == 100.0
