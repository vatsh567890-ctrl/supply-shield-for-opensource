"""Unit test for model SHA-256 hash validation and tamper protection."""

import json
import tempfile
from pathlib import Path

import pytest
from ml.model_loader import (
    ModelSecurityError,
    load_verified_model,
)


def test_verified_model_loads_cleanly() -> None:
    """Verify that the authentic model passes integrity validation."""
    model, scaler, manifest = load_verified_model()
    assert model is not None
    assert scaler is not None
    assert manifest["model_version"] == "1.0.0-shadow"


def test_altered_model_bytes_rejected() -> None:
    """Verify that tampering with model bytes raises ModelSecurityError."""
    # Find original models dir
    root_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    orig_models_dir = root_dir / "ml" / "models"
    if not orig_models_dir.exists():
        orig_models_dir = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "models"

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)

        # Copy authentic manifest and scaler
        manifest_data = json.loads((orig_models_dir / "manifest.json").read_text(encoding="utf-8"))
        (tmp_path / "manifest.json").write_text(json.dumps(manifest_data), encoding="utf-8")
        (tmp_path / "scaler.joblib").write_bytes((orig_models_dir / "scaler.joblib").read_bytes())

        # Create tampered model file (1 byte flipped)
        orig_bytes = (orig_models_dir / manifest_data["model_filename"]).read_bytes()
        tampered_bytes = bytearray(orig_bytes)
        tampered_bytes[-1] ^= 0xFF
        (tmp_path / manifest_data["model_filename"]).write_bytes(tampered_bytes)

        # Should fail integrity check
        with pytest.raises(ModelSecurityError, match="Model integrity verification failed"):
            load_verified_model(tmp_path)

