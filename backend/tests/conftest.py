"""Pytest configuration and common test fixtures."""

import os

import pytest
from httpx import ASGITransport, AsyncClient

# Enforce development environment for tests
os.environ["APP_ENV"] = "development"
os.environ["ALLOW_MOCK_AUTH"] = "true"
os.environ["SESSION_SECRET"] = "test_session_secret_at_least_32_bytes_long_random"
os.environ["GITHUB_APP_WEBHOOK_SECRET"] = "test_webhook_secret_for_tests"
os.environ["GITHUB_OAUTH_CLIENT_ID"] = "test_oauth_client_id"
os.environ["GITHUB_OAUTH_CLIENT_SECRET"] = "test_oauth_client_secret"

from app.main import app


@pytest.fixture
async def async_client():
    """Async test HTTP client bound to FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
