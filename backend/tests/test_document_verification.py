"""
Tests for AI Document Verification API (POST /api/documents/verify).
"""

import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_verify_document_success():
    """Verify a valid document returns status 'verified' with high confidence."""
    fake_image_bytes = b"fake_valid_aadhaar_card_image_content_12345"
    files = {
        "file": ("aadhaar_front.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")
    }
    data = {
        "scheme_id": "pm-kisan",
        "document_type": "aadhaar",
        "language": "hi",
    }
    response = client.post("/api/documents/verify", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "verified"
    assert res["is_eligible"] is True
    assert res["confidence_score"] >= 0.90
    assert "सत्यापित" in res["title_hi"]
    assert res["extracted_data"]["document_number_masked"] is not None


def test_verify_document_ineligible_rejected():
    """Verify an ineligible document (e.g. over-income) returns status 'rejected' with clear reasons."""
    fake_image_bytes = b"fake_high_income_certificate_file_data"
    files = {
        "file": ("income_over_income_reject.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")
    }
    data = {
        "scheme_id": "pm-kisan",
        "document_type": "income_certificate",
        "language": "hi",
    }
    response = client.post("/api/documents/verify", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "rejected"
    assert res["is_eligible"] is False
    assert len(res["reason_hi"]) > 0
    assert len(res["reason_en"]) > 0
    assert res["extracted_data"]["annual_income"] is not None


def test_verify_document_unclear_image():
    """Verify a blurry image returns status 'unclear_image' with guidance to retry."""
    fake_image_bytes = b"fake_blurry_photo_data"
    files = {
        "file": ("blurry_document_scan.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")
    }
    data = {
        "scheme_id": "pm-kisan",
        "document_type": "land_records",
        "language": "hi",
    }
    response = client.post("/api/documents/verify", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "unclear_image"
    assert res["is_eligible"] is False
    assert "स्पष्ट" in res["title_hi"] or "धुंधली" in res["reason_hi"]
    assert res["suggestion_hi"] is not None


def test_verify_document_wrong_document():
    """Verify an irrelevant document returns status 'wrong_document'."""
    fake_image_bytes = b"fake_random_selfie_data"
    files = {
        "file": ("random_photo.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")
    }
    data = {
        "scheme_id": "pm-kisan",
        "document_type": "aadhaar",
        "language": "hi",
    }
    response = client.post("/api/documents/verify", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "wrong_document"
    assert res["is_eligible"] is False


def test_verify_document_scheme_not_found():
    """Verify 404 is returned when scheme ID does not exist."""
    fake_image_bytes = b"fake_file_content"
    files = {
        "file": ("document.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")
    }
    data = {
        "scheme_id": "non-existent-scheme-xyz",
        "document_type": "aadhaar",
    }
    response = client.post("/api/documents/verify", files=files, data=data)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_verify_document_empty_file():
    """Verify 400 is returned when empty file is uploaded."""
    files = {
        "file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")
    }
    data = {
        "scheme_id": "pm-kisan",
        "document_type": "aadhaar",
    }
    response = client.post("/api/documents/verify", files=files, data=data)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()
