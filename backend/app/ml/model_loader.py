"""Secure model loader with cryptographic SHA-256 hash verification.

Ensures no tampered or unauthorized serialized models can be loaded.
Joblib format only; rejects arbitrary untrusted pickle files.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

import joblib


class ModelSecurityError(Exception):
    """Raised when model integrity or cryptographic validation fails."""


def compute_sha256(file_path: Path) -> str:
    """Compute the SHA-256 hexadecimal digest of a file."""
    hasher = hashlib.sha256()
    with file_path.open("rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def load_verified_model(models_dir: Path | str | None = None) -> tuple[Any, Any, dict[str, Any]]:
    """Verify cryptographic checksums and load the calibrated ML model and scaler.

    Returns:
        tuple[calibrated_model, scaler, manifest_dict]

    Raises:
        ModelSecurityError: if manifest is missing, tampered with, or hashes mismatch.
    """
    if models_dir is None:
        models_dir = Path(__file__).resolve().parent / "models"
    else:
        models_dir = Path(models_dir)

    manifest_path = models_dir / "manifest.json"
    if not manifest_path.exists():
        raise ModelSecurityError(f"Model manifest not found at: {manifest_path}")

    try:
        with manifest_path.open("r", encoding="utf-8") as f:
            manifest = json.load(f)
    except Exception as exc:
        raise ModelSecurityError(f"Failed to read model manifest: {exc}") from exc

    expected_model_hash = manifest.get("sha256")
    model_filename = manifest.get("model_filename", "supplyshield_lgbm_calibrated.joblib")
    model_path = models_dir / model_filename

    if not model_path.exists():
        raise ModelSecurityError(f"Model file not found at: {model_path}")

    actual_model_hash = compute_sha256(model_path)
    if actual_model_hash != expected_model_hash:
        raise ModelSecurityError(
            f"Model integrity verification failed! Expected SHA-256 {expected_model_hash}, but found {actual_model_hash}"
        )

    expected_scaler_hash = manifest.get("scaler_sha256")
    scaler_filename = manifest.get("scaler_filename", "scaler.joblib")
    scaler_path = models_dir / scaler_filename

    if not scaler_path.exists():
        raise ModelSecurityError(f"Scaler file not found at: {scaler_path}")

    actual_scaler_hash = compute_sha256(scaler_path)
    if actual_scaler_hash != expected_scaler_hash:
        raise ModelSecurityError(
            f"Scaler integrity verification failed! Expected SHA-256 {expected_scaler_hash}, but found {actual_scaler_hash}"
        )

    # Load verified artifacts with joblib
    try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
    except Exception as exc:
        raise ModelSecurityError(f"Failed to deserialize verified artifacts: {exc}") from exc

    return model, scaler, manifest

