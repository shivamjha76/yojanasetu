"""
Tests for Eligibility Evaluation API (POST /api/eligibility/check).
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_eligibility_check_student_profile():
    payload = {
        "age": 20,
        "gender": "female",
        "state": "Madhya Pradesh",
        "occupation": "student",
        "category": "obc",
        "annual_income": 180000.0,
        "ration_card_type": "bpl",
        "is_differently_abled": False,
    }
    response = client.post("/api/eligibility/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_schemes_evaluated"] == 15
    assert data["eligible_count"] >= 5
    assert data["ineligible_schemes"] is None  # default include_ineligible=False

    # Top scheme should have match_percentage == 100
    top_scheme = data["eligible_schemes"][0]
    assert top_scheme["is_eligible"] is True
    assert top_scheme["match_percentage"] == 100
    assert len(top_scheme["matched_rules"]) >= 1
    assert len(top_scheme["required_documents"]) >= 1


def test_eligibility_check_with_ineligible_flag():
    payload = {
        "age": 45,
        "gender": "male",
        "state": "Uttar Pradesh",
        "occupation": "farmer",
        "category": "general",
        "annual_income": 120000.0,
        "is_differently_abled": False,
    }
    response = client.post("/api/eligibility/check?include_ineligible=true", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["eligible_count"] >= 1
    assert data["ineligible_schemes"] is not None
    assert len(data["ineligible_schemes"]) > 0

    # Ineligible schemes should contain failure reasons
    for inel in data["ineligible_schemes"]:
        assert inel["is_eligible"] is False
        assert len(inel["failing_rules"]) >= 1
        assert len(inel["ineligibility_reasons_hi"]) >= 1


def test_eligibility_check_category_filter():
    payload = {
        "age": 21,
        "gender": "female",
        "state": "Rajasthan",
        "occupation": "student",
        "category": "sc",
        "annual_income": 150000.0,
        "is_differently_abled": False,
    }
    response = client.post("/api/eligibility/check?category=education_scholarships", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Scanned schemes should only be education_scholarships (3 schemes)
    assert data["total_schemes_evaluated"] == 3
    assert all(s["category"] == "education_scholarships" for s in data["eligible_schemes"])


def test_eligibility_check_validation_error():
    # Age missing or invalid
    bad_payload = {
        "age": -5,
        "gender": "unknown_gender",
        "state": "Delhi",
        "occupation": "student",
        "category": "general",
        "annual_income": -100,
    }
    response = client.post("/api/eligibility/check", json=bad_payload)
    assert response.status_code == 422  # Unprocessable Entity
