"""Pytest configuration and common test fixtures."""

import os

import pytest
from httpx import ASGITransport, AsyncClient

# Enforce development environment for tests
os.environ["APP_ENV"] = "development"
os.environ["SESSION_SECRET"] = "test_session_secret_at_least_32_bytes_long_random"

from app.main import app


@pytest.fixture
async def async_client():
    """Async test HTTP client bound to FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
