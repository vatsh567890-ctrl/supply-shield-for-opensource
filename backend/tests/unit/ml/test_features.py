"""Unit tests for deterministic feature extraction.

Tests each of the 18 features in FEATURE_NAMES for non-zero and zero values.
"""

from ml.features import (
    FEATURE_NAMES,
    PackageDiffData,
    extract_features,
)


def test_feature_list_schema() -> None:
    """Verify all 18 features are present and properly named."""
    assert len(FEATURE_NAMES) == 18
    assert "install_hook_added" in FEATURE_NAMES
    assert "install_hook_modified" in FEATURE_NAMES
    assert "install_hook_length" in FEATURE_NAMES
    assert "dynamic_exec_count" in FEATURE_NAMES
    assert "encoded_payload_blob_count" in FEATURE_NAMES
    assert "max_entropy" in FEATURE_NAMES
    assert "new_network_hosts_count" in FEATURE_NAMES
    assert "raw_ip_flag" in FEATURE_NAMES
    assert "secret_env_reads_count" in FEATURE_NAMES
    assert "typosquat_min_distance" in FEATURE_NAMES
    assert "dropped_provenance_flag" in FEATURE_NAMES
    assert "binary_files_added" in FEATURE_NAMES
    assert "minified_long_line_files_added" in FEATURE_NAMES
    assert "file_count_delta" in FEATURE_NAMES
    assert "size_delta_bytes" in FEATURE_NAMES
    assert "dependency_count_delta" in FEATURE_NAMES
    assert "publish_to_analysis_hours" in FEATURE_NAMES
    assert "maintainer_count_change" in FEATURE_NAMES


def test_zero_features_baseline() -> None:
    """Verify an empty / identical diff yields zero/baseline values across all features."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="react",  # exact match on top packages -> distance 0
        old_version="18.2.0",
        new_version="18.2.0",
        old_files={"index.js": b"console.log('hi');\n"},
        new_files={"index.js": b"console.log('hi');\n"},
        old_manifest={"name": "react", "version": "18.2.0"},
        new_manifest={"name": "react", "version": "18.2.0"},
        top_packages=["react"],
    )
    feats = extract_features(diff)

    assert feats["install_hook_added"] == 0.0
    assert feats["install_hook_modified"] == 0.0
    assert feats["install_hook_length"] == 0.0
    assert feats["dynamic_exec_count"] == 0.0
    assert feats["encoded_payload_blob_count"] == 0.0
    assert feats["new_network_hosts_count"] == 0.0
    assert feats["raw_ip_flag"] == 0.0
    assert feats["secret_env_reads_count"] == 0.0
    assert feats["typosquat_min_distance"] == 0.0
    assert feats["dropped_provenance_flag"] == 0.0
    assert feats["binary_files_added"] == 0.0
    assert feats["minified_long_line_files_added"] == 0.0
    assert feats["file_count_delta"] == 0.0
    assert feats["size_delta_bytes"] == 0.0
    assert feats["dependency_count_delta"] == 0.0
    assert feats["maintainer_count_change"] == 0.0


def test_non_zero_install_hooks() -> None:
    """Verify install hook features are non-zero when hooks are added/modified."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        old_manifest={"scripts": {"build": "tsc"}},
        new_manifest={"scripts": {"build": "tsc", "postinstall": "node setup.js"}},
    )
    feats = extract_features(diff)
    assert feats["install_hook_added"] == 1.0
    assert feats["install_hook_length"] == float(len("node setup.js"))


def test_non_zero_dynamic_exec() -> None:
    """Verify dynamic_exec_count detects eval and dynamic Function."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        new_files={"index.js": b"eval('run()'); Function('return 1')();\n"},
    )
    feats = extract_features(diff)
    assert feats["dynamic_exec_count"] == 2.0


def test_non_zero_encoded_payload_and_entropy() -> None:
    """Verify encoded_payload_blob_count and max_entropy on base64 blob."""
    blob = b"const data = '" + (b"A" * 70) + b"=" * 2 + b"';\n"
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        new_files={"index.js": blob},
    )
    feats = extract_features(diff)
    assert feats["encoded_payload_blob_count"] >= 1.0
    assert feats["max_entropy"] > 0.0


def test_non_zero_network_hosts_and_raw_ip() -> None:
    """Verify new network hosts and raw IP detection."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        old_files={"index.js": b"const u = 'https://api.github.com';\n"},
        new_files={
            "index.js": b"const u = 'https://api.github.com'; const exfil = 'http://185.220.101.5/p';\n"
        },
    )
    feats = extract_features(diff)
    assert feats["new_network_hosts_count"] == 1.0
    assert feats["raw_ip_flag"] == 1.0


def test_non_zero_secret_env_reads() -> None:
    """Verify secret environment variable reads detection."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        new_files={
            "index.js": b"const k = process.env.AWS_SECRET_ACCESS_KEY;\nconst t = process.env.GITHUB_TOKEN;\n"
        },
    )
    feats = extract_features(diff)
    assert feats["secret_env_reads_count"] == 2.0


def test_non_zero_typosquat_distance() -> None:
    """Verify typosquat distance detects edit distance."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="lodashs",  # 1 edit away from lodash
        top_packages=["lodash"],
    )
    feats = extract_features(diff)
    assert feats["typosquat_min_distance"] == 1.0


def test_non_zero_dropped_provenance() -> None:
    """Verify dropped provenance flag when provenance file is removed in new version."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        old_files={".provenance": b"sig_data"},
        new_files={"index.js": b"code"},
    )
    feats = extract_features(diff)
    assert feats["dropped_provenance_flag"] == 1.0


def test_non_zero_binary_added() -> None:
    """Verify binary_files_added triggers on native binaries."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        new_files={"binding.node": b"\x7fELFbin", "native.so": b"\x7fELFbin"},
    )
    feats = extract_features(diff)
    assert feats["binary_files_added"] == 2.0


def test_non_zero_minified_long_lines() -> None:
    """Verify minified_long_line_files_added triggers on lines > 1000 chars."""
    long_line = b"var x = '" + (b"A" * 1200) + b"';\n"
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        new_files={"bundle.js": long_line},
    )
    feats = extract_features(diff)
    assert feats["minified_long_line_files_added"] == 1.0


def test_non_zero_deltas_and_timing() -> None:
    """Verify file, size, dependency deltas, hours, and maintainers changes."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="my-pkg",
        old_files={"a.js": b"1"},
        new_files={"a.js": b"1", "b.js": b"222"},
        old_manifest={"dependencies": {"dep1": "1.0.0"}},
        new_manifest={"dependencies": {"dep1": "1.0.0", "dep2": "2.0.0"}},
        published_at="2024-01-01T10:00:00Z",
        analysis_time="2024-01-01T15:00:00Z",
        old_maintainers=["alice"],
        new_maintainers=["alice", "bob"],
    )
    feats = extract_features(diff)
    assert feats["file_count_delta"] == 1.0
    assert feats["size_delta_bytes"] == 3.0
    assert feats["dependency_count_delta"] == 1.0
    assert feats["publish_to_analysis_hours"] == 5.0
    assert feats["maintainer_count_change"] == 1.0

