"""Unit and integration tests for ML shadow mode execution and verdict invariance."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.ml.features import PackageDiffData

from app.analyzer.models import Finding, Severity
from app.config import Settings
from app.worker.pipeline import execute_pipeline, run_ml_shadow


@pytest.fixture
def sample_findings() -> list[Finding]:
    return [
        Finding(
            rule_id="install_hook_added",
            severity=Severity.HIGH,
            weight=25,
            message="Install hook added",
            file_path="package.json",
        ),
        Finding(
            rule_id="network_new_host",
            severity=Severity.HIGH,
            weight=20,
            message="New network host",
            file_path="setup.js",
        ),
    ]


@pytest.fixture
def sample_diff() -> PackageDiffData:
    return PackageDiffData(
        ecosystem="npm",
        package_name="test-package",
        old_version="1.0.0",
        new_version="1.0.1",
        old_files={"index.js": b"console.log('hi');"},
        new_files={"index.js": b"console.log('hi');"},
    )


async def test_verdict_invariant_between_off_and_shadow(
    sample_findings: list[Finding],
    sample_diff: PackageDiffData,
) -> None:
    """Verify verdict score, level, and floor are 100% identical between off and shadow mode."""
    analysis_id = uuid.uuid4()
    mock_session = AsyncMock()
    mock_session.add = MagicMock()

    # 1. Run with ML_MODE="off"
    with patch("app.worker.pipeline.get_settings", return_value=Settings(ML_MODE="off")):
        result_off = await execute_pipeline(
            analysis_id=analysis_id,
            session=mock_session,
            diff_data=sample_diff,
            findings=sample_findings,
        )

    # 2. Run with ML_MODE="shadow"
    with patch("app.worker.pipeline.get_settings", return_value=Settings(ML_MODE="shadow")):
        result_shadow = await execute_pipeline(
            analysis_id=analysis_id,
            session=mock_session,
            diff_data=sample_diff,
            findings=sample_findings,
        )

    # Invariants: verdict fields must be identical
    assert result_off["score"] == result_shadow["score"] == 80
    assert result_off["risk_level"] == result_shadow["risk_level"] == "HIGH"
    assert result_off["rule_score"] == result_shadow["rule_score"]
    assert result_off["floor_applied"] == result_shadow["floor_applied"] == 80

    # In shadow mode, ml_shadow result is produced
    assert result_off["ml_shadow"] is None
    assert result_shadow["ml_shadow"] is not None
    assert "probability" in result_shadow["ml_shadow"]


async def test_shadow_record_creation(sample_diff: PackageDiffData) -> None:
    """Verify that run_ml_shadow creates and commits an MLShadowResult record."""
    analysis_id = uuid.uuid4()
    mock_session = AsyncMock()
    mock_session.add = MagicMock()

    with patch("app.worker.pipeline.get_settings", return_value=Settings(ML_MODE="shadow")):
        res = await run_ml_shadow(mock_session, analysis_id, sample_diff)

    assert res is not None
    assert "probability" in res
    assert "predicted_label" in res
    # Verify session.add and session.commit were called
    assert mock_session.add.called
    assert mock_session.commit.called


async def test_shadow_mode_fail_safe_on_error(
    sample_findings: list[Finding],
    sample_diff: PackageDiffData,
) -> None:
    """Verify that if the ML model raises an exception, the pipeline catches it and proceeds without failing."""
    analysis_id = uuid.uuid4()
    mock_session = AsyncMock()

    # Force model loader to raise an exception
    with (
        patch(
            "app.ml.model_loader.load_verified_model",
            side_effect=RuntimeError("Simulated Model Failure"),
        ),
        patch("app.worker.pipeline.get_settings", return_value=Settings(ML_MODE="shadow")),
    ):
        result = await execute_pipeline(
            analysis_id=analysis_id,
            session=mock_session,
            diff_data=sample_diff,
            findings=sample_findings,
        )

    # Pipeline must not crash, verdict must be intact, and ml_shadow must be None
    assert result["score"] == 80
    assert result["risk_level"] == "HIGH"
    assert result["floor_applied"] == 80
    assert result["ml_shadow"] is None
