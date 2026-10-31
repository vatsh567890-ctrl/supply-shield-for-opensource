"""Unit test for label leakage prevention."""

from app.ml.features import (
    FEATURE_NAMES,
    PackageDiffData,
    extract_features,
)


def test_features_ignore_advisories_and_labels() -> None:
    """Verify that advisory IDs, malware tags, and label metadata are completely ignored by feature extraction."""
    # Create diff data containing malicious annotations in metadata
    diff_with_leakage = PackageDiffData(
        ecosystem="npm",
        package_name="test-lib",
        old_version="1.0.0",
        new_version="1.0.1",
        old_files={"index.js": b"module.exports = 1;"},
        new_files={"index.js": b"module.exports = 1;"},
        old_manifest={
            "name": "test-lib",
            "version": "1.0.0",
            # Injected label leakage attempts
            "advisory": "GHSA-xxxx-yyyy-zzzz",
            "malware_tag": "CRITICAL_MALWARE",
            "description": "MALICIOUS PACKAGE DO NOT USE",
            "label": 1,
        },
        new_manifest={
            "name": "test-lib",
            "version": "1.0.1",
            "advisory": "GHSA-xxxx-yyyy-zzzz",
            "malware_tag": "CRITICAL_MALWARE",
            "description": "MALICIOUS PACKAGE DO NOT USE",
            "label": 1,
        },
    )

    clean_diff = PackageDiffData(
        ecosystem="npm",
        package_name="test-lib",
        old_version="1.0.0",
        new_version="1.0.1",
        old_files={"index.js": b"module.exports = 1;"},
        new_files={"index.js": b"module.exports = 1;"},
        old_manifest={"name": "test-lib", "version": "1.0.0"},
        new_manifest={"name": "test-lib", "version": "1.0.1"},
    )

    feats_with_leakage = extract_features(diff_with_leakage)
    feats_clean = extract_features(clean_diff)

    # Invariant: Features extracted must be 100% identical regardless of advisory or label fields
    for name in FEATURE_NAMES:
        assert feats_with_leakage[name] == feats_clean[name], f"Feature {name} leaked metadata!"
