"""
Tests for AI System Prompts and Prompt Builders
"""

import json
from app.core.prompts import (
    PROFILE_EXTRACTION_SYSTEM_PROMPT,
    SCHEME_EXPLAINER_SYSTEM_PROMPT,
    build_profile_extraction_prompt,
    build_scheme_explainer_prompt,
)


def test_profile_extraction_system_prompt_structure():
    """Verify system prompt contains all critical constraints, schema fields, and few-shot examples."""
    prompt = PROFILE_EXTRACTION_SYSTEM_PROMPT
    assert "Setu Sahayak" in prompt
    assert "NEVER determine or mention whether the citizen is eligible" in prompt
    assert "occupation" in prompt
    assert "annual_income" in prompt
    assert "FEW-SHOT EXAMPLES" in prompt
    assert "Gorakhpur" in prompt  # Few-shot 1
    assert "Bhopal" in prompt     # Few-shot 2
    assert "Jaipur" in prompt     # Few-shot 3


def test_build_profile_extraction_prompt():
    """Verify prompt builder formats citizen input properly."""
    user_text = "Main MP se ek aurat hu, 30 saal ki."
    prompt = build_profile_extraction_prompt(user_text)
    assert user_text in prompt
    assert "Extract the demographic profile JSON now:" in prompt


def test_scheme_explainer_prompt_generation():
    """Verify scheme explainer prompt packs verified scheme facts into structured context."""
    scheme_sample = {
        "id": "pm-kisan",
        "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
        "name_en": "PM Kisan Samman Nidhi",
        "benefit_amount_text": "₹6,000 प्रति वर्ष",
        "benefit_type": "direct_benefit_transfer",
        "ministry": "Ministry of Agriculture",
        "official_portal_url": "https://pmkisan.gov.in/",
        "documents": [{"name_hi": "आधार कार्ड", "name_en": "Aadhaar Card"}],
        "application_steps_hi": ["पोर्टल पर जाएं", "आधार नंबर दर्ज करें"],
    }

    prompt_hi = build_scheme_explainer_prompt(
        scheme_data=scheme_sample,
        user_question="मुझे पैसा कब मिलेगा?",
        language="hi",
    )
    assert "Verified Scheme Facts:" in prompt_hi
    assert "₹6,000 प्रति वर्ष" in prompt_hi
    assert "मुझे पैसा कब मिलेगा?" in prompt_hi
    assert "उत्तर हिंदी में सरल और स्पष्ट भाषा में दें।" in prompt_hi

    prompt_en = build_scheme_explainer_prompt(
        scheme_data=scheme_sample,
        user_question="How much money will I receive?",
        language="en",
    )
    assert "Respond in clear, accessible English." in prompt_en
    assert "How much money will I receive?" in prompt_en
