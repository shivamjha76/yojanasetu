"""
Tests for Schemes Discovery REST API (GET /api/schemes).
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_all_schemes():
    response = client.get("/api/schemes")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 15
    assert len(data["schemes"]) == data["total"]
    assert data["limit"] == 50
    assert data["offset"] == 0


def test_search_schemes_by_keyword():
    response = client.get("/api/schemes?q=scholarship")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    for s in data["schemes"]:
        text = f"{s['name_en']} {s['short_summary_en']} {s['category']}".lower()
        assert "scholarship" in text


def test_search_schemes_by_category():
    response = client.get("/api/schemes?category=agriculture")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert all(s["category"] == "agriculture" for s in data["schemes"])


def test_search_schemes_by_state():
    # Madhya Pradesh
    response = client.get("/api/schemes?state=Madhya%20Pradesh")
    assert response.status_code == 200
    data = response.json()
    assert any(s["id"] == "ladli-behna-yojana-mp" for s in data["schemes"])

    # Rajasthan (should not contain MP state scheme)
    res_rj = client.get("/api/schemes?state=Rajasthan")
    assert res_rj.status_code == 200
    data_rj = res_rj.json()
    assert not any(s["id"] == "ladli-behna-yojana-mp" for s in data_rj["schemes"])


def test_pagination_params():
    response = client.get("/api/schemes?limit=4&offset=2")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 15
    assert len(data["schemes"]) == 4
    assert data["limit"] == 4
    assert data["offset"] == 2


def test_get_scheme_by_id_success():
    response = client.get("/api/schemes/pm-kisan")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "pm-kisan"
    assert "PM-KISAN" in data["name_en"]
    assert len(data["rules"]) >= 1
    assert len(data["documents"]) >= 1
    assert "official_portal_url" in data
    assert "application_steps_hi" in data
    assert "faqs" in data


def test_get_scheme_by_id_case_insensitive():
    response = client.get("/api/schemes/PM-KISAN")
    assert response.status_code == 200
    assert response.json()["id"] == "pm-kisan"


def test_get_scheme_by_id_not_found():
    response = client.get("/api/schemes/non-existent-id-12345")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
