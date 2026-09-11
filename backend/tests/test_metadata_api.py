"""
Test suite for Metadata API endpoints (/api/metadata/*)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_categories():
    """Verify category metadata returns all categories with bilingual names, icons, and counts."""
    response = client.get("/api/metadata/categories")
    assert response.status_code == 200
    data = response.json()

    assert "total_categories" in data
    assert "categories" in data
    assert data["total_categories"] == len(data["categories"])
    assert data["total_categories"] >= 8

    # Check structure of categories
    categories_by_id = {cat["id"]: cat for cat in data["categories"]}
    assert "agriculture" in categories_by_id
    assert "education_scholarships" in categories_by_id
    assert "social_security_pensions" in categories_by_id

    agri = categories_by_id["agriculture"]
    assert agri["name_en"] == "Agriculture & Farming"
    assert agri["name_hi"] == "कृषि एवं किसान कल्याण"
    assert agri["icon"] == "Sprout"
    assert agri["color"] == "#16a34a"
    assert agri["scheme_count"] >= 1  # PM-Kisan is present in dataset


def test_get_states():
    """Verify states metadata returns list of Indian states with scheme indicators."""
    response = client.get("/api/metadata/states")
    assert response.status_code == 200
    data = response.json()

    assert "total_states" in data
    assert "states" in data
    assert data["total_states"] == len(data["states"])
    assert data["total_states"] >= 28

    state_map = {st["name"]: st["has_state_schemes"] for st in data["states"]}
    assert "All India" in state_map
    assert "Madhya Pradesh" in state_map
    assert state_map["Madhya Pradesh"] is True
    assert state_map["Bihar"] is False


def test_get_occupations():
    """Verify occupations metadata returns standard occupations for eligibility filtering."""
    response = client.get("/api/metadata/occupations")
    assert response.status_code == 200
    data = response.json()

    assert "total_occupations" in data
    assert "occupations" in data
    assert data["total_occupations"] == len(data["occupations"])
    assert data["total_occupations"] >= 8

    occ_ids = [occ["id"] for occ in data["occupations"]]
    assert "farmer" in occ_ids
    assert "student" in occ_ids
    assert "unemployed" in occ_ids
    assert "daily_wage_laborer" in occ_ids

    # Check first item schema
    first = data["occupations"][0]
    assert "id" in first
    assert "name_en" in first
    assert "name_hi" in first
    assert "icon" in first
