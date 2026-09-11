"""
Unit tests for Scheme Prose Ingestion Tool / Pipeline
Verifies raw gazette text extraction, JSON rule formation, schema validation, and catalog persistence safety.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ingest_scheme_prose_success():
    sample_gazette_prose = """
    MUKHYAMANTRI YUVA SAMBAL YOJANA 2026
    Government of Rajasthan introduces special financial assistance to educated unemployed youth.
    Eligibility Criteria:
    1. Applicant must be a resident of Rajasthan.
    2. Age must be between 21 to 35 years.
    3. Annual family income must not exceed 2.0 Lakhs.
    4. Applicant must be unemployed and actively enrolled in state skill program.
    Financial Assistance:
    Selected male candidates will receive ₹4,000 per month, and female/differently-abled candidates will receive ₹4,500 per month.
    """

    payload = {
        "raw_text": sample_gazette_prose,
        "scheme_id_override": "mukhyamantri-yuva-sambal-test",
        "category_hint": "skills_employment",
        "save_to_catalog": False,  # Dry run test
    }

    res = client.post("/api/schemes/ingest", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["success"] is True
    assert data["validation_passed"] is True
    assert data["rules_count"] >= 1
    assert data["parsed_scheme"]["id"] == "mukhyamantri-yuva-sambal-test"
    assert data["parsed_scheme"]["category"] == "skills_employment"

    # Ensure extracted rules contain age or income
    fields_extracted = [r["field"] for r in data["parsed_scheme"]["rules"]]
    assert "age" in fields_extracted or "annual_income" in fields_extracted


def test_ingest_scheme_prose_empty_fails():
    res = client.post("/api/schemes/ingest", json={"raw_text": "short"})
    assert res.status_code == 422 or res.status_code == 400
