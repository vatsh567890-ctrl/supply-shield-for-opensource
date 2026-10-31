"""Ordered analysis pipeline, status transitions, and shadow ML integration."""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any

from app.analyzer.models import Finding
from app.analyzer.scoring import calculate_score
from app.config import get_settings
from app.db.repositories.ml_shadow import MLShadowRepository

logger = logging.getLogger("supplyshield.pipeline")


async def run_ml_shadow(
    session: AsyncSession,
    analysis_id: uuid.UUID,
    diff_data: Any,
) -> dict[str, Any] | None:
    """Execute ML risk classifier in shadow mode.

    Non-blocking / fail-open: Never raises an exception and never modifies
    verdicts, rule scores, or security floors.
    """
    settings = get_settings()
    if settings.ML_MODE == "off":
        logger.info("ML shadow mode is disabled (ML_MODE=off); continuing analysis without ML.")
        return None

    try:
        import numpy as np

        try:
            from app.ml.features import FEATURE_NAMES, extract_feature_vector
            from app.ml.model_loader import load_verified_model
        except ImportError:
            from ml.features import FEATURE_NAMES, extract_feature_vector  # type: ignore[no-redef]
            from ml.model_loader import load_verified_model  # type: ignore[no-redef]
    except Exception as import_err:
        logger.warning(
            "ML modules or dependencies not available (%s); continuing analysis without ML.",
            type(import_err).__name__,
        )
        return None

    start_time = time.perf_counter()
    try:
        model, scaler, manifest = load_verified_model()
        model_version = str(manifest.get("model_version", "1.0.0-shadow"))

        # Extract features and scale
        raw_vector = extract_feature_vector(diff_data)
        scaled_vector = scaler.transform(np.array([raw_vector], dtype=np.float32))

        # Predict calibrated probability
        probs = model.predict_proba(scaled_vector)[0]
        malicious_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        pred_label = 1 if malicious_prob >= 0.5 else 0

        # Extract top features
        top_features: list[dict[str, Any]] = []
        for i, val in enumerate(raw_vector):
            if val != 0.0:
                top_features.append(
                    {
                        "feature": FEATURE_NAMES[i],
                        "value": val,
                    }
                )

        duration_ms = (time.perf_counter() - start_time) * 1000.0

        repo = MLShadowRepository(session)
        shadow_record = await repo.create(
            analysis_id=analysis_id,
            model_version=model_version,
            probability=round(malicious_prob, 4),
            predicted_label=pred_label,
            top_features=top_features,
            execution_time_ms=round(duration_ms, 2),
        )
        logger.info(
            "ML shadow result saved for analysis %s: prob=%.4f label=%d in %.2fms",
            analysis_id,
            malicious_prob,
            pred_label,
            duration_ms,
        )
        return {
            "id": str(shadow_record.id),
            "probability": shadow_record.probability,
            "predicted_label": shadow_record.predicted_label,
        }
    except Exception as exc:
        # Strictly fail-safe: log warning and continue without breaking analysis
        duration_ms = (time.perf_counter() - start_time) * 1000.0
        logger.warning(
            "ML shadow mode execution encountered an error (analysis_id=%s) in %.2fms: %s",
            analysis_id,
            duration_ms,
            exc,
        )
        return None


async def execute_pipeline(
    analysis_id: uuid.UUID,
    session: AsyncSession | None = None,
    diff_data: Any | None = None,
    findings: list[Finding] | None = None,
) -> dict[str, Any]:
    """Execute analysis pipeline from PR diff to Check Run update.

    Rule scoring and floor application are calculated first.
    ML model runs strictly in shadow mode and cannot alter score, risk level, or floors.
    """
    if findings is None:
        findings = []

    # 1. Deterministic Rule Score & Security Floors
    final_score, risk_level, rule_score, floor_applied = calculate_score(findings)

    # 2. ML Risk Model in Shadow Mode
    shadow_result: dict[str, Any] | None = None
    if session is not None and diff_data is not None:
        shadow_result = await run_ml_shadow(session, analysis_id, diff_data)

    return {
        "analysis_id": str(analysis_id),
        "score": final_score,
        "risk_level": risk_level,
        "rule_score": rule_score,
        "floor_applied": floor_applied,
        "ml_shadow": shadow_result,
    }
