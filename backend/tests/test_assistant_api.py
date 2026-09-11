"""
Tests for AI Assistant API (/api/assistant/*)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_assistant_status():
    """Verify assistant status route returns operational information."""
    response = client.get("/api/assistant/status")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "ready"
    assert "Setu Sahayak" in data["assistant_name"]
    assert "provider" in data
    assert "model" in data
    assert data["supports_voice_extraction"] is True


def test_extract_profile_hindi_input():
    """Verify extraction endpoint correctly parses conversational Hindi."""
    payload = {
        "user_input": "मैं मध्य प्रदेश के भोपाल से 32 वर्ष की महिला हूँ, घर संभालती हूँ और बीपीएल कार्ड है।"
    }
    response = client.post("/api/assistant/extract-profile", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    profile = data["profile"]
    assert profile["age"] == 32
    assert profile["gender"] == "female"
    assert profile["state"] == "Madhya Pradesh"
    assert profile["occupation"] == "homemaker"
    assert data["confidence_score"] > 0.4
    assert len(data["detected_fields"]) >= 3


def test_extract_profile_hinglish_farmer():
    """Verify extraction endpoint correctly parses conversational Hinglish."""
    payload = {
        "user_input": "Main UP se ek kisan hu, 45 saal umar hai aur salana aamdani 80 hazar hai."
    }
    response = client.post("/api/assistant/extract-profile", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    profile = data["profile"]
    assert profile["age"] == 45
    assert profile["occupation"] == "farmer"
    assert profile["state"] == "Uttar Pradesh"
    assert profile["annual_income"] == 80000.0


def test_extract_profile_with_clarifications():
    """When some fields are not provided, API returns bilingual clarification prompts."""
    payload = {
        "user_input": "Main padhai kar raha hu college me."
    }
    response = client.post("/api/assistant/extract-profile", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert len(data["missing_or_defaulted_fields"]) > 0
    assert len(data["suggested_clarifications_hi"]) > 0
    assert len(data["suggested_clarifications_en"]) > 0


def test_extract_profile_validation_error():
    """Text too short should trigger a 422 Unprocessable Entity validation error."""
    payload = {"user_input": "hi"}  # min_length is 3
    response = client.post("/api/assistant/extract-profile", json=payload)
    assert response.status_code == 422
