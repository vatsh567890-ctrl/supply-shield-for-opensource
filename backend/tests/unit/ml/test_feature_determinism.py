"""Unit test verifying that feature extraction is strictly deterministic."""

from ml.features import (
    FEATURE_NAMES,
    PackageDiffData,
    extract_feature_vector,
)


def test_repeated_runs_produce_identical_feature_vectors() -> None:
    """Verify that 10 consecutive feature extractions on the same diff produce identical numbers."""
    diff = PackageDiffData(
        ecosystem="npm",
        package_name="test-package",
        old_version="1.0.0",
        new_version="1.1.0",
        old_files={
            "package.json": b'{"name": "test-package", "version": "1.0.0"}',
            "index.js": b"module.exports = { val: 1 };\n",
        },
        new_files={
            "package.json": b'{"name": "test-package", "version": "1.1.0", "scripts": {"postinstall": "node setup.js"}}',
            "index.js": b"eval('run()');\nconst secret = process.env.AWS_SECRET_ACCESS_KEY;\nconst h = 'http://185.220.101.5/p';\n",
            "setup.js": b"console.log('setup');\n",
        },
        published_at="2024-05-01T12:00:00Z",
        analysis_time="2024-05-01T14:30:00Z",
        old_maintainers=["dev_a"],
        new_maintainers=["dev_a", "dev_b"],
        top_packages=["react", "lodash", "test-package"],
    )

    baseline_vector = extract_feature_vector(diff)
    assert len(baseline_vector) == len(FEATURE_NAMES)

    for run_idx in range(10):
        current_vector = extract_feature_vector(diff)
        assert current_vector == baseline_vector, (
            f"Feature divergence on iteration {run_idx}: {current_vector} != {baseline_vector}"
        )

