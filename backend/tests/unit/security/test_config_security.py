"""Tests for security configuration validation, mock auth fail-closed, and secret handling."""

import logging

import pytest

from app.config import Settings, validate_startup_config


def test_production_refuses_allow_mock_auth():
    """Startup must refuse to run when APP_ENV=production and ALLOW_MOCK_AUTH=True."""
    settings = Settings(
        APP_ENV="production",
        ALLOW_MOCK_AUTH=True,
        SESSION_SECRET="prod_secret_32_bytes_at_least_secure",
        GITHUB_APP_WEBHOOK_SECRET="webhook_secret",
        GITHUB_OAUTH_CLIENT_ID="oauth_id",
        GITHUB_OAUTH_CLIENT_SECRET="oauth_secret",
        GITHUB_APP_ID="12345",
        GITHUB_APP_PRIVATE_KEY="key",
    )
    with pytest.raises(RuntimeError, match="Startup refused.*ALLOW_MOCK_AUTH"):
        validate_startup_config(settings)


def test_production_fails_when_secrets_missing_and_names_variables_never_values():
    """In production, startup fails and names the missing variables, never their values."""
    settings = Settings(
        APP_ENV="production",
        ALLOW_MOCK_AUTH=False,
        SESSION_SECRET=None,
        GITHUB_APP_WEBHOOK_SECRET=None,
        GITHUB_OAUTH_CLIENT_ID=None,
        GITHUB_OAUTH_CLIENT_SECRET=None,
        GITHUB_APP_ID="0",
        GITHUB_APP_PRIVATE_KEY=None,
    )
    with pytest.raises(RuntimeError) as exc_info:
        validate_startup_config(settings)

    err_msg = str(exc_info.value)
    assert "Missing required production configuration variables:" in err_msg
    assert "SESSION_SECRET" in err_msg
    assert "GITHUB_APP_WEBHOOK_SECRET" in err_msg
    assert "GITHUB_OAUTH_CLIENT_ID" in err_msg
    assert "GITHUB_OAUTH_CLIENT_SECRET" in err_msg
    # Confirm no secret values are leaked
    assert "None" not in err_msg


def test_production_fails_when_secrets_equal_known_dev_values():
    """In production, startup refuses to run if required secret equals a known dev placeholder."""
    settings = Settings(
        APP_ENV="production",
        ALLOW_MOCK_AUTH=False,
        SESSION_SECRET="generate-with-openssl-rand-hex-32",
        GITHUB_APP_WEBHOOK_SECRET="your-github-app-webhook-secret",
        GITHUB_OAUTH_CLIENT_ID="your-github-oauth-client-id",
        GITHUB_OAUTH_CLIENT_SECRET="your-github-oauth-client-secret",
        GITHUB_APP_ID="your-github-app-id",
        GITHUB_APP_PRIVATE_KEY="real_prod_key_data",
    )
    with pytest.raises(RuntimeError) as exc_info:
        validate_startup_config(settings)

    err_msg = str(exc_info.value)
    assert "Insecure development values detected in production for variables:" in err_msg
    assert "SESSION_SECRET" in err_msg
    assert "GITHUB_APP_WEBHOOK_SECRET" in err_msg
    # Must name the variable, never print its value
    assert "generate-with-openssl-rand-hex-32" not in err_msg
    assert "your-github-app-webhook-secret" not in err_msg


def test_development_logs_warning_for_missing_variables(caplog):
    """In development, missing variables log a warning naming the variables."""
    settings = Settings(
        APP_ENV="development",
        ALLOW_MOCK_AUTH=False,
        SESSION_SECRET=None,
        GITHUB_APP_WEBHOOK_SECRET=None,
        GITHUB_OAUTH_CLIENT_ID=None,
        GITHUB_OAUTH_CLIENT_SECRET=None,
        GITHUB_APP_ID="0",
        GITHUB_APP_PRIVATE_KEY=None,
    )
    with caplog.at_level(logging.WARNING, logger="app.config"):
        validate_startup_config(settings)

    warning_records = [r for r in caplog.records if r.name == "app.config"]
    assert len(warning_records) >= 1
    msg = warning_records[0].message
    assert "Missing or empty Section 12 configuration variables:" in msg
    assert "SESSION_SECRET" in msg
    assert "GITHUB_APP_WEBHOOK_SECRET" in msg


def test_mock_auth_combinations():
    """Verify all four combinations of APP_ENV and ALLOW_MOCK_AUTH."""
    # 1. production + ALLOW_MOCK_AUTH=True -> refuses startup
    s1 = Settings(
        APP_ENV="production",
        ALLOW_MOCK_AUTH=True,
        SESSION_SECRET="prod_secret_32_bytes_at_least_secure",
        GITHUB_APP_WEBHOOK_SECRET="webhook_secret",
        GITHUB_OAUTH_CLIENT_ID="oauth_id",
        GITHUB_OAUTH_CLIENT_SECRET="oauth_secret",
        GITHUB_APP_ID="12345",
        GITHUB_APP_PRIVATE_KEY="key",
    )
    with pytest.raises(RuntimeError, match="Startup refused"):
        validate_startup_config(s1)

    # 2. production + ALLOW_MOCK_AUTH=False with valid config -> succeeds
    s2 = Settings(
        APP_ENV="production",
        ALLOW_MOCK_AUTH=False,
        SESSION_SECRET="prod_secret_32_bytes_at_least_secure",
        GITHUB_APP_WEBHOOK_SECRET="webhook_secret",
        GITHUB_OAUTH_CLIENT_ID="oauth_id",
        GITHUB_OAUTH_CLIENT_SECRET="oauth_secret",
        GITHUB_APP_ID="12345",
        GITHUB_APP_PRIVATE_KEY="key",
    )
    validate_startup_config(s2)  # Should not raise

    # 3. development + ALLOW_MOCK_AUTH=False -> succeeds startup (mock auth rejected at endpoints)
    s3 = Settings(APP_ENV="development", ALLOW_MOCK_AUTH=False)
    validate_startup_config(s3)

    # 4. development + ALLOW_MOCK_AUTH=True -> succeeds startup (mock auth allowed at endpoints)
    s4 = Settings(APP_ENV="development", ALLOW_MOCK_AUTH=True)
    validate_startup_config(s4)


def test_honest_status_complete_modules_contain_no_not_implemented_error():
    """CI check: Any module listed as Complete in docs/status.md must contain zero NotImplementedError."""
    import sys
    from pathlib import Path

    # __file__ is backend/tests/unit/security/test_config_security.py (5 levels deep from root)
    root_dir = Path(__file__).resolve().parents[4]
    scripts_dir = root_dir / "scripts"
    if str(scripts_dir) not in sys.path:
        sys.path.insert(0, str(scripts_dir))
    import check_module_status

    assert check_module_status.verify_module_status() is True
