"""
Test Suite for YojanaSetu Assisted Mode / Operator Endpoints
Tests citizen registration by CSC operators/NGO workers, deterministic scheme evaluation,
application lifecycle status updates, and summary metrics.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


SAMPLE_CITIZEN_PAYLOAD = {
    "full_name": "रामेश्वर दयाल (Rameshwar Dayal)",
    "phone": "9876543210",
    "village_ward": "रामपुर ग्राम (Rampur Village)",
    "district": "Jaipur",
    "state": "Rajasthan",
    "operator_id": "vle_jaipur_01",
    "profile": {
        "age": 45,
        "gender": "male",
        "state": "Rajasthan",
        "district": "Jaipur",
        "area_type": "rural",
        "occupation": "farmer",
        "category": "obc",
        "annual_income": 120000.0,
        "land_holding_acres": 2.5,
        "ration_card_type": "bpl",
        "is_differently_abled": False,
        "marital_status": "married",
    },
}


def test_operator_create_and_list_citizen():
    """Verify creating an assisted citizen and listing them in operator dashboard."""
    # 1. Create citizen
    res = client.post("/api/operator/citizens", json=SAMPLE_CITIZEN_PAYLOAD)
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["full_name"] == "रामेश्वर दयाल (Rameshwar Dayal)"
    assert data["phone"] == "9876543210"
    assert data["village_ward"] == "रामपुर ग्राम (Rampur Village)"
    assert data["district"] == "Jaipur"
    citizen_id = data["id"]

    # 2. List citizens for operator
    list_res = client.get("/api/operator/citizens?operator_id=vle_jaipur_01")
    assert list_res.status_code == 200
    citizens = list_res.json()
    assert len(citizens) >= 1
    found = next((c for c in citizens if c["id"] == citizen_id), None)
    assert found is not None
    assert found["full_name"] == "रामेश्वर दयाल (Rameshwar Dayal)"

    # 3. Search citizens by keyword
    search_res = client.get("/api/operator/citizens?operator_id=vle_jaipur_01&search=9876543210")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data) >= 1
    assert any(c["id"] == citizen_id for c in search_data)


def test_operator_evaluate_citizen_schemes():
    """Verify deterministic eligibility evaluation for an assisted citizen."""
    # Create citizen
    res = client.post("/api/operator/citizens", json=SAMPLE_CITIZEN_PAYLOAD)
    assert res.status_code == 201
    citizen_id = res.json()["id"]

    # Evaluate schemes
    eval_res = client.get(f"/api/operator/citizens/{citizen_id}/eligibility")
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert "total_schemes_evaluated" in eval_data
    assert eval_data["total_schemes_evaluated"] >= 15
    assert "eligible_schemes_count" in eval_data
    assert eval_data["eligible_schemes_count"] > 0

    # Farmer should qualify for PM-KISAN
    eligible_ids = [s["scheme_id"] for s in eval_data["eligible_schemes"]]
    assert "pm-kisan" in eligible_ids


def test_operator_application_lifecycle_tracking():
    """Verify recording and updating application lifecycle status."""
    # Create citizen
    res = client.post("/api/operator/citizens", json=SAMPLE_CITIZEN_PAYLOAD)
    assert res.status_code == 201
    citizen_id = res.json()["id"]

    # Record application submitted
    app_payload = {
        "citizen_id": citizen_id,
        "scheme_id": "pm-kisan",
        "scheme_name": "प्रधानमंत्री किसान सम्मान निधि",
        "benefit_amount": "₹6,000 / वर्ष",
        "status": "submitted",
        "ref_number": "PMK-2026-98124",
        "notes": "आधार बायोमेट्रिक सत्यापन जन सेवा केंद्र पर पूरा हुआ।",
    }
    app_res = client.post("/api/operator/applications", json=app_payload)
    assert app_res.status_code == 200
    app_data = app_res.json()
    assert app_data["success"] is True
    assert app_data["application"]["status"] == "submitted"
    assert app_data["application"]["ref_number"] == "PMK-2026-98124"

    # Verify status appears in eligibility response
    eval_res = client.get(f"/api/operator/citizens/{citizen_id}/eligibility")
    assert eval_res.status_code == 200
    applications = eval_res.json()["applications"]
    assert len(applications) >= 1
    assert applications[0]["scheme_id"] == "pm-kisan"
    assert applications[0]["status"] == "submitted"


def test_operator_summary_metrics():
    """Verify operator summary analytics calculation."""
    res = client.get("/api/operator/summary?operator_id=vle_jaipur_01")
    assert res.status_code == 200
    data = res.json()
    assert "total_citizens" in data
    assert data["total_citizens"] >= 1
    assert "status_counts" in data
    assert "submitted" in data["status_counts"]
    assert "districts_covered" in data
    assert "Jaipur" in data["districts_covered"]


def test_operator_update_and_delete_citizen():
    """Verify editing citizen profile and deleting citizen record."""
    # 1. Create
    res = client.post("/api/operator/citizens", json=SAMPLE_CITIZEN_PAYLOAD)
    assert res.status_code == 201
    citizen_id = res.json()["id"]

    # 2. Update
    update_res = client.put(
        f"/api/operator/citizens/{citizen_id}",
        json={"full_name": "रामेश्वर दयाल शर्मा", "village_ward": "वार्ड 4, रामपुर"},
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["full_name"] == "रामेश्वर दयाल शर्मा"
    assert updated["village_ward"] == "वार्ड 4, रामपुर"

    # 3. Delete
    del_res = client.delete(f"/api/operator/citizens/{citizen_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 4. Verify 404 after deletion
    get_res = client.get(f"/api/operator/citizens/{citizen_id}")
    assert get_res.status_code == 404
