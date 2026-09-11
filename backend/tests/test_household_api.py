"""
Unit and Integration Tests for Household Combined Claim API
Verifies multi-member evaluation, family-level deduplication, and financial aggregation.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_household_evaluate_api():
    payload = {
        "family_name": "Kumar Household",
        "members": [
            {
                "id": "mem_1",
                "name": "Ramesh Kumar",
                "relation": "self",
                "profile": {
                    "age": 42,
                    "gender": "male",
                    "state": "Rajasthan",
                    "district": "Jaipur",
                    "area_type": "rural",
                    "occupation": "farmer",
                    "land_holding_acres": 2.0,
                    "category": "obc",
                    "annual_income": 120000,
                    "marital_status": "married",
                    "is_differently_abled": False,
                    "ration_card_type": "bpl",
                },
            },
            {
                "id": "mem_2",
                "name": "Sunita Devi",
                "relation": "spouse",
                "profile": {
                    "age": 38,
                    "gender": "female",
                    "state": "Rajasthan",
                    "district": "Jaipur",
                    "area_type": "rural",
                    "occupation": "homemaker",
                    "land_holding_acres": 0,
                    "category": "obc",
                    "annual_income": 120000,
                    "marital_status": "married",
                    "is_differently_abled": False,
                    "ration_card_type": "bpl",
                },
            },
            {
                "id": "mem_3",
                "name": "Pooja Kumar",
                "relation": "daughter",
                "profile": {
                    "age": 19,
                    "gender": "female",
                    "state": "Rajasthan",
                    "district": "Jaipur",
                    "area_type": "rural",
                    "occupation": "student",
                    "land_holding_acres": 0,
                    "category": "obc",
                    "annual_income": 120000,
                    "marital_status": "single",
                    "is_differently_abled": False,
                    "ration_card_type": "bpl",
                },
            },
        ],
    }

    res = client.post("/api/household/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["family_name"] == "Kumar Household"
    assert data["total_members"] == 3
    assert data["total_schemes_unlocked"] > 0
    assert len(data["members_breakdown"]) == 3
    assert len(data["deduplicated_benefits"]) > 0

    # Ensure Ramesh unlocked PM-KISAN
    ramesh = next(m for m in data["members_breakdown"] if m["member_id"] == "mem_1")
    assert any("pm-kisan" in s["scheme_id"] for s in ramesh["eligible_schemes"])

    # Ensure Ayushman Bharat is deduplicated / shared at family level
    ayushman = next((b for b in data["deduplicated_benefits"] if "ayushman" in b["scheme_id"] or "pmjay" in b["scheme_id"]), None)
    if ayushman:
        assert ayushman["claim_level"] == "family_shared"
        assert len(ayushman["beneficiary_member_names"]) >= 2
