"""Integration tests for health and root probe endpoints."""

import pytest


@pytest.mark.asyncio
async def test_root_endpoint(async_client):
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "SupplyShield API"
    assert data["status"] == "ok"
    assert data["docs_url"] == "/docs"
    assert data["health_url"] == "/health"
    assert "X-Request-ID" in response.headers


@pytest.mark.asyncio
async def test_health_endpoint(async_client):
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert "X-Request-ID" in response.headers


@pytest.mark.asyncio
async def test_ready_endpoint(async_client):
    response = await async_client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert "missing_config" in data
    assert isinstance(data["missing_config"], list)
    assert "X-Request-ID" in response.headers
