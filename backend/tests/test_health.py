"""
Tests for FastAPI application health check and system endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "YojanaSetu" in data["message"]
    assert data["health"] == "/api/health"


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "YojanaSetu Core API"
    assert data["dataset_status"] == "ready"
    assert data["total_schemes_loaded"] >= 15
    assert "timestamp" in data
