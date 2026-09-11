"""
Test Suite for CSC Jan Seva Kendra Locator API
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_all_csc_centers():
    """Verify listing all verified CSC Jan Seva Kendras."""
    response = client.get("/api/csc/centers")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "centers" in data
    assert data["total"] >= 10
    first = data["centers"][0]
    assert "vle_name" in first
    assert "center_name" in first
    assert "pincode" in first
    assert "phone" in first
    assert len(first["services"]) > 0


def test_search_csc_by_pincode():
    """Verify filtering by pincode prefix or exact."""
    response = client.get("/api/csc/search?pincode=462011")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(c["pincode"] == "462011" for c in data["centers"])


def test_search_csc_by_state_and_district():
    """Verify filtering by state and district."""
    response = client.get("/api/csc/search?state=Madhya Pradesh&district=Bhopal")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    for center in data["centers"]:
        assert center["state"] == "Madhya Pradesh"
        assert "Bhopal" in center["district"]


def test_search_csc_by_service():
    """Verify filtering by service offered (e.g., Ayushman)."""
    response = client.get("/api/csc/search?service=ayushman")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 5
    for center in data["centers"]:
        assert any("ayushman" in s.lower() for s in center["services"])


def test_search_csc_by_keyword():
    """Verify keyword query matching address or VLE name."""
    response = client.get("/api/csc/search?q=Hazratganj")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert "Hazratganj" in data["centers"][0]["center_name"] or "Hazratganj" in data["centers"][0]["address"]
