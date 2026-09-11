"""
Unit tests for Profile Extractor & Sanitizer Service
"""

import pytest
from app.services.profile_extractor import (
    clean_llm_json_output,
    parse_income_string,
    sanitize_profile_dict,
    profile_extractor,
    ProfileExtractionResult,
)
from app.models.schemas import CitizenProfile


def test_clean_llm_json_output():
    """Verify markdown fences and external commentary are stripped properly."""
    # With markdown fence
    fenced = "```json\n{\"age\": 25, \"gender\": \"male\"}\n```"
    assert clean_llm_json_output(fenced) == '{"age": 25, "gender": "male"}'

    # With pre-text and post-text
    wrapped = "Sure, here is the extracted citizen profile:\n{\"age\": 40}\nHope this helps!"
    assert clean_llm_json_output(wrapped) == '{"age": 40}'


def test_parse_income_string():
    """Verify various Indian currency and language expressions are accurately parsed into floats."""
    assert parse_income_string("1.5 lakh") == 150000.0
    assert parse_income_string("2.5 Lakhs") == 250000.0
    assert parse_income_string("80 hazar") == 80000.0
    assert parse_income_string("50,000") == 50000.0
    assert parse_income_string(180000) == 180000.0
    assert parse_income_string("invalid") == 120000.0  # default fallback


def test_sanitize_profile_dict_normalization():
    """Verify colloquial occupations and state aliases are normalized to strict schema enums."""
    raw = {
        "age": "35",
        "gender": "Mahila",
        "state": "MP",
        "occupation": "Kisan",
        "category": "OBC",
        "annual_income": "1 lakh",
        "is_differently_abled": False,
        "ration_card_type": "BPL",
    }
    sanitized, detected, defaulted = sanitize_profile_dict(raw)

    assert sanitized["age"] == 35
    assert sanitized["gender"] == "female"
    assert sanitized["state"] == "Madhya Pradesh"
    assert sanitized["occupation"] == "farmer"
    assert sanitized["category"] == "obc"
    assert sanitized["annual_income"] == 100000.0
    assert sanitized["ration_card_type"] == "bpl"

    assert "age" in detected
    assert "gender" in detected
    assert "state" in detected
    assert "occupation" in detected
    assert "annual_income" in detected


def test_profile_extractor_end_to_end_guarantee():
    """Verify profile_extractor returns guaranteed valid Pydantic model and confidence metrics."""
    input_text = "Main MP se ek mahila hu, umar 32 saal, kheti karti hu, 1.5 lakh aamdani hai."
    result = profile_extractor.extract_profile(input_text)

    assert isinstance(result, ProfileExtractionResult)
    assert isinstance(result.profile, CitizenProfile)
    assert result.profile.age == 32
    assert result.profile.gender == "female"
    assert result.profile.state == "Madhya Pradesh"
    assert result.profile.occupation == "farmer"
    assert result.confidence_score > 0.5
    assert result.raw_input == input_text


@pytest.mark.anyio
async def test_profile_extractor_async():
    """Verify async extraction method."""
    input_text = "Main Bihar se 21 saal ka student hu."
    result = await profile_extractor.extract_profile_async(input_text)

    assert isinstance(result.profile, CitizenProfile)
    assert result.profile.age == 21
    assert result.profile.occupation == "student"
    assert result.profile.state == "Bihar"
