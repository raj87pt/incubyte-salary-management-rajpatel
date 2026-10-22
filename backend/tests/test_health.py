"""Smoke test: verify the app starts and the health endpoint works."""


async def test_health_check_returns_healthy(client):
    """GET /health should return status 'healthy'."""
    response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
