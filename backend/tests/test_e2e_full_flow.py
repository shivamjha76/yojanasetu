"""
YojanaSetu - Step 49: End-to-End Complete Citizen Flow Integration Test Suite
Simulates the complete user journey:
1. Landing Discovery & Health
2. Metadata Retrieval (Categories, States, Occupations)
3. Citizen Natural Language Profile Extraction (AI Setu Sahayak)
4. Deterministic Rule Engine Eligibility Evaluation (100% zero-hallucination)
5. Scheme Deep Dive & Explainability Checklist
6. Scheme Q&A via Grounded AI Explainer
7. Offline Pathway: Jan Seva Kendra / CSC Locator Lookup
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestCompleteCitizenE2EJourney:
    def test_01_platform_health_and_root_welcome(self):
        """Step 1: Citizen visits the platform - verify health and routing."""
        res = client.get("/api/health")
        assert res.status_code == 200
        health = res.json()
        assert health["status"] == "healthy"
        assert health["total_schemes_loaded"] >= 15
        assert health["dataset_status"] == "ready"

        res_root = client.get("/")
        assert res_root.status_code == 200
        assert "योजनासेतु" in res_root.json()["message"]

    def test_02_landing_discovery_and_metadata_bootstrap(self):
        """Step 2: Frontend loads categories, states, and trending schemes."""
        # 1. Categories
        cat_res = client.get("/api/metadata/categories")
        assert cat_res.status_code == 200
        cats = cat_res.json()["categories"]
        assert len(cats) >= 6
        cat_ids = [c["id"] for c in cats]
        assert "agriculture" in cat_ids
        assert "healthcare" in cat_ids
        assert "women_child" in cat_ids

        # 2. States
        states_res = client.get("/api/metadata/states")
        assert states_res.status_code == 200
        states = states_res.json()["states"]
        assert len(states) >= 10

        # 3. Explore Schemes catalog with search and filters
        schemes_res = client.get("/api/schemes?category=agriculture")
        assert schemes_res.status_code == 200
        agri_schemes = schemes_res.json()["schemes"]
        assert len(agri_schemes) >= 1
        assert any("kisan" in s["id"] for s in agri_schemes)

    def test_03_ai_assistant_voice_profile_extraction(self):
        """Step 3: Citizen speaks to Setu Sahayak in Hindi/English natural language."""
        voice_text = "मेरी आयु 28 वर्ष है, मध्य प्रदेश के भोपाल में 2 एकड़ जमीन पर खेती करती हूँ। मेरी वार्षिक आय 180000 रुपये है।"
        extract_res = client.post(
            "/api/assistant/extract-profile",
            json={"user_input": voice_text},
        )
        assert extract_res.status_code == 200
        data = extract_res.json()
        assert data["success"] is True
        profile = data["profile"]

        # Verify extracted demographics
        assert profile["age"] == 28
        assert profile["occupation"] == "farmer"
        assert profile["state"] == "Madhya Pradesh"
        assert profile["land_holding_acres"] == 2.0
        assert profile["annual_income"] == 180000.0

    def test_04_deterministic_eligibility_wizard_evaluation(self):
        """Step 4: Deterministic rule engine evaluates extracted profile with 100% precision."""
        citizen_profile = {
            "age": 28,
            "gender": "female",
            "state": "Madhya Pradesh",
            "district": "Bhopal",
            "area_type": "rural",
            "occupation": "farmer",
            "land_holding_acres": 2.0,
            "category": "obc",
            "annual_income": 180000.0,
            "marital_status": "married",
            "is_differently_abled": False,
            "ration_card_type": "bpl",
        }

        eval_res = client.post(
            "/api/eligibility/check?include_ineligible=true",
            json=citizen_profile,
        )
        assert eval_res.status_code == 200
        eval_data = eval_res.json()

        assert eval_data["total_schemes_evaluated"] >= 15
        assert eval_data["eligible_count"] >= 3

        eligible_ids = [s["scheme_id"] for s in eval_data["eligible_schemes"]]
        assert "pm-kisan" in eligible_ids
        assert "ladli-behna-yojana-mp" in eligible_ids
        assert "ayushman-bharat-pmjay" in eligible_ids

        # Check PM-Kisan match evidence
        pm_kisan_result = next(s for s in eval_data["eligible_schemes"] if s["scheme_id"] == "pm-kisan")
        assert pm_kisan_result["is_eligible"] is True
        assert pm_kisan_result["match_percentage"] == 100
        assert len(pm_kisan_result["matched_rules"]) > 0
        assert len(pm_kisan_result["required_documents"]) > 0

        # Check failing criteria on ineligible schemes (zero hallucination)
        ineligible_schemes = eval_data.get("ineligible_schemes", [])
        assert len(ineligible_schemes) > 0
        for inel in ineligible_schemes:
            assert inel["is_eligible"] is False
            assert len(inel["failing_rules"]) > 0
            assert len(inel["ineligibility_reasons_en"]) > 0

    def test_05_scheme_detail_and_document_verification(self):
        """Step 5: Citizen views full scheme detail page."""
        detail_res = client.get("/api/schemes/pm-kisan")
        assert detail_res.status_code == 200
        scheme = detail_res.json()

        assert scheme["id"] == "pm-kisan"
        assert "प्रधानमंत्री किसान" in scheme["name_hi"]
        assert "pmkisan.gov.in" in scheme["official_portal_url"]
        assert len(scheme["documents"]) >= 3
        # Ensure mandatory documents are specified
        mandatory_docs = [d for d in scheme["documents"] if d["is_mandatory"]]
        assert len(mandatory_docs) >= 1
        assert any("aadhaar" in d["id"].lower() for d in mandatory_docs)

    def test_06_scheme_explainer_grounded_qa(self):
        """Step 6: Citizen asks AI assistant a question about PM-Kisan rules."""
        qa_res = client.post(
            "/api/assistant/explain-scheme",
            json={
                "scheme_id": "pm-kisan",
                "user_question": "किस्तों में कुल कितना पैसा मिलता है और आधार जरूरी है?",
                "language": "hi",
            },
        )
        assert qa_res.status_code == 200
        qa_data = qa_res.json()
        assert qa_data["success"] is True
        assert qa_data["scheme_id"] == "pm-kisan"
        assert len(qa_data["answer"]) > 10
        assert "pmkisan.gov.in" in qa_data["official_portal_url"]
        assert len(qa_data["benefit_highlight"]) > 0

    def test_07_jan_seva_kendra_offline_assistance_path(self):
        """Step 7: Citizen discovers offline Jan Seva Kendra for assisted biometric eKYC."""
        # Search by PIN code (Bhopal MP Nagar)
        csc_res = client.get("/api/csc/search?pincode=462011")
        assert csc_res.status_code == 200
        csc_data = csc_res.json()

        assert csc_data["total"] >= 1
        center = csc_data["centers"][0]
        assert center["pincode"] == "462011"
        assert center["state"] == "Madhya Pradesh"
        assert "Rajesh Sharma" in center["vle_name"]
        assert "+91" in center["phone"]
        assert any("pm-kisan" in s.lower() for s in center["services"])
