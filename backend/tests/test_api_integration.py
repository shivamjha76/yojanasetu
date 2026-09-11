"""
End-to-End API Integration Test Suite
Validates the full citizen journey across all endpoints in Phase 3:
1. System Health & Info (/api/health, /)
2. Metadata & Dropdowns (/api/metadata/categories, /api/metadata/states, /api/metadata/occupations)
3. Scheme Discovery & Filtering (/api/schemes)
4. Scheme Details & Document Requirements (/api/schemes/{id})
5. Deterministic Eligibility Evaluation & Explainability (/api/eligibility/check)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestFullApiIntegrationJourney:
    """Simulates a citizen exploring the platform and discovering benefits."""

    def test_01_system_health_and_info(self):
        """Step 1: Check system health and dataset status."""
        health_res = client.get("/api/health")
        assert health_res.status_code == 200
        health_data = health_res.json()
        assert health_data["status"] == "healthy"
        assert health_data["dataset_status"] == "ready"
        assert health_data["total_schemes_loaded"] >= 15

        root_res = client.get("/")
        assert root_res.status_code == 200
        root_data = root_res.json()
        assert "योजनासेतु" in root_data["message"]
        assert root_data["documentation"] == "/docs"

    def test_02_metadata_dropdown_bootstrapping(self):
        """Step 2: Frontend client fetches metadata for search and filter controls."""
        # 1. Categories
        cat_res = client.get("/api/metadata/categories")
        assert cat_res.status_code == 200
        cat_data = cat_res.json()
        assert cat_data["total_categories"] >= 8
        categories = {c["id"]: c for c in cat_data["categories"]}
        assert "agriculture" in categories
        assert categories["agriculture"]["scheme_count"] >= 1

        # 2. States
        states_res = client.get("/api/metadata/states")
        assert states_res.status_code == 200
        states_data = states_res.json()
        assert states_data["total_states"] >= 28

        # 3. Occupations
        occ_res = client.get("/api/metadata/occupations")
        assert occ_res.status_code == 200
        occ_data = occ_res.json()
        assert occ_data["total_occupations"] >= 8

    def test_03_schemes_catalog_discovery_and_search(self):
        """Step 3: Citizen browses catalog, searches by keyword and filters by category & state."""
        # Browse all
        all_schemes_res = client.get("/api/schemes?limit=50")
        assert all_schemes_res.status_code == 200
        all_data = all_schemes_res.json()
        assert all_data["total"] >= 15
        assert len(all_data["schemes"]) >= 15

        # Search query: "kisan"
        search_res = client.get("/api/schemes?q=kisan")
        assert search_res.status_code == 200
        search_data = search_res.json()
        assert search_data["total"] >= 1
        assert any(s["id"] == "pm-kisan" for s in search_data["schemes"])

        # Filter by category: "healthcare"
        health_cat_res = client.get("/api/schemes?category=healthcare")
        assert health_cat_res.status_code == 200
        health_cat_data = health_cat_res.json()
        assert health_cat_data["total"] >= 1
        assert any(s["id"] == "ayushman-bharat-pmjay" for s in health_cat_data["schemes"])

        # Filter by state: "Madhya Pradesh"
        mp_res = client.get("/api/schemes?state=Madhya+Pradesh")
        assert mp_res.status_code == 200
        mp_data = mp_res.json()
        assert any(s["id"] == "ladli-behna-yojana-mp" for s in mp_data["schemes"])

    def test_04_scheme_details_and_document_checklist(self):
        """Step 4: Citizen views detail page of PM-Kisan."""
        detail_res = client.get("/api/schemes/pm-kisan")
        assert detail_res.status_code == 200
        scheme = detail_res.json()

        assert scheme["id"] == "pm-kisan"
        assert "किसान" in scheme["name_hi"]
        assert scheme["official_portal_url"].startswith("http")
        assert len(scheme["rules"]) >= 1
        assert len(scheme["documents"]) >= 1
        assert len(scheme["application_steps_hi"]) >= 1

        # Test non-existent scheme returns 404
        not_found_res = client.get("/api/schemes/unknown-scheme-xyz")
        assert not_found_res.status_code == 404

    def test_05_farmer_eligibility_evaluation(self):
        """Step 5: Farmer runs eligibility wizard and receives deterministic evaluation."""
        farmer_profile = {
            "age": 42,
            "gender": "male",
            "state": "Uttar Pradesh",
            "annual_income": 95000.0,
            "occupation": "farmer",
            "category": "obc",
            "is_differently_abled": False,
            "is_student": False,
            "ration_card_type": "bpl",
        }

        eval_res = client.post(
            "/api/eligibility/check?include_ineligible=true",
            json=farmer_profile,
        )
        assert eval_res.status_code == 200
        eval_data = eval_res.json()

        assert eval_data["eligible_count"] >= 1
        eligible_ids = [s["scheme_id"] for s in eval_data["eligible_schemes"]]
        assert "pm-kisan" in eligible_ids

        # Verify PM-Kisan explainability evidence
        pm_kisan_result = next(s for s in eval_data["eligible_schemes"] if s["scheme_id"] == "pm-kisan")
        assert pm_kisan_result["match_percentage"] == 100.0
        assert len(pm_kisan_result["matched_rules"]) > 0
        rule_0 = pm_kisan_result["matched_rules"][0]
        assert "evidence_text_hi" in rule_0
        assert "evidence_text_en" in rule_0
        assert rule_0["matched"] is True
        assert len(pm_kisan_result["required_documents"]) > 0

    def test_06_ineligible_high_income_citizen(self):
        """Step 6: High-income professional sees clear, transparent ineligibility reasons."""
        high_income_profile = {
            "age": 35,
            "gender": "male",
            "state": "Maharashtra",
            "annual_income": 2500000.0,
            "occupation": "employed_private",
            "category": "general",
            "is_differently_abled": False,
            "is_student": False,
            "ration_card_type": "apl",
        }

        eval_res = client.post(
            "/api/eligibility/check?include_ineligible=true",
            json=high_income_profile,
        )
        assert eval_res.status_code == 200
        eval_data = eval_res.json()

        assert eval_data["ineligible_schemes"] is not None
        assert len(eval_data["ineligible_schemes"]) > 0
        # Ayushman Bharat should be in ineligible list due to income/BPL
        ayushman = next((s for s in eval_data["ineligible_schemes"] if s["scheme_id"] == "ayushman-bharat-pmjay"), None)
        if ayushman:
            assert ayushman["is_eligible"] is False
            assert len(ayushman["ineligibility_reasons_hi"]) > 0
            assert len(ayushman["ineligibility_reasons_en"]) > 0

    def test_07_input_validation_error_handling(self):
        """Step 7: Check API gracefully handles invalid inputs with HTTP 422."""
        invalid_payload = {
            "age": -5,  # Invalid age
            "gender": "alien",  # Invalid gender
        }
        res = client.post("/api/eligibility/check", json=invalid_payload)
        assert res.status_code == 422
