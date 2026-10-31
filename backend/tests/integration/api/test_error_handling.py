"""Integration tests for request IDs, logging, and error handling."""

import logging
import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_auth_routes_return_501_not_implemented():
    """Verify unimplemented auth routes return 501 NOT_IMPLEMENTED with valid UUID request_id."""
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test login endpoint
        resp_login = await client.get("/auth/github/login")
        assert resp_login.status_code == 501
        data_login = resp_login.json()
        assert data_login["error"]["code"] == "NOT_IMPLEMENTED"
        assert data_login["error"]["message"] == "GitHub sign-in is not configured yet."

        login_req_id = data_login["error"]["request_id"]
        assert login_req_id != "unknown"
        # Verify valid UUID format
        parsed_uuid = uuid.UUID(login_req_id)
        assert str(parsed_uuid) == login_req_id
        assert resp_login.headers.get("X-Request-ID") == login_req_id

        # Test callback endpoint
        resp_cb = await client.get("/auth/github/callback")
        assert resp_cb.status_code == 501
        data_cb = resp_cb.json()
        assert data_cb["error"]["code"] == "NOT_IMPLEMENTED"
        assert data_cb["error"]["message"] == "GitHub sign-in is not configured yet."

        cb_req_id = data_cb["error"]["request_id"]
        assert cb_req_id != "unknown"
        assert str(uuid.UUID(cb_req_id)) == cb_req_id
        assert resp_cb.headers.get("X-Request-ID") == cb_req_id


@pytest.mark.asyncio
async def test_forced_unhandled_exception_returns_500_with_uuid_and_logs(caplog):
    """Verify forced server exception returns 500 with a real UUID request_id and safe message."""

    async def _forced_crash():
        raise RuntimeError("CRITICAL_DATABASE_CRASH_SECRET_12345")

    # Add temporary route to test exception pipeline
    app.add_api_route("/test-forced-crash-endpoint", _forced_crash, methods=["GET"])

    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with caplog.at_level(logging.ERROR, logger="app.errors"):
            response = await client.get("/test-forced-crash-endpoint")

        assert response.status_code == 500
        data = response.json()

        # Must contain code INTERNAL_SERVER_ERROR and a safe message
        assert data["error"]["code"] == "INTERNAL_SERVER_ERROR"
        assert data["error"]["message"] == "An unexpected error occurred. Please try again later."

        # request_id must be a real UUID, never 'unknown'
        req_id = data["error"]["request_id"]
        assert req_id != "unknown"
        assert str(uuid.UUID(req_id)) == req_id
        assert response.headers.get("X-Request-ID") == req_id

        # Crucial security: must never return the exception text or traceback to the client
        raw_text = response.text
        assert "CRITICAL_DATABASE_CRASH_SECRET_12345" not in raw_text
        assert "Traceback" not in raw_text
        assert "RuntimeError" not in raw_text

        # Crucial logging: server-side log must contain the error and request_id
        found_log = False
        for record in caplog.records:
            if req_id in record.message:
                found_log = True
                break
        assert found_log, f"Expected request_id {req_id} to be recorded in server log"


@pytest.mark.asyncio
async def test_ready_endpoint_reports_missing_configuration_names_only():
    """Verify /ready reports missing Section 12 config variable names without revealing values."""
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert "missing_config" in data
        missing_vars = data["missing_config"]
        assert isinstance(missing_vars, list)

        # Every entry must be an uppercase configuration variable name
        for var_name in missing_vars:
            assert isinstance(var_name, str)
            assert var_name.isupper()
            assert not any(char in var_name for char in [":", "/", "=", " ", "\n"])
