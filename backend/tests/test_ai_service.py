"""
Unit tests for AI Service Wrapper (Gemini, OpenAI, Mock provider)
"""

import json
import pytest
from app.core.config import Settings
from app.services.ai_service import AIService, AIServiceException


def test_ai_service_defaults_and_provider_info():
    """Verify default initialization and provider info metadata."""
    service = AIService(provider="mock", model="mock-model")
    info = service.get_provider_info()
    assert info["provider"] == "mock"
    assert info["model"] == "mock-model"
    assert info["is_configured"] is True
    assert info["fallback_available"] is True


def test_ai_service_mock_text_generation():
    """Verify mock generator returns conversational text."""
    service = AIService(provider="mock")
    response = service.generate("Namaste, mujhe yojana bataiye")
    assert "योजनासेतु सहायक" in response
    assert len(response) > 10


def test_ai_service_mock_json_extraction_farmer():
    """Verify mock generator correctly parses a Hindi/Hinglish farmer voice transcript into JSON."""
    service = AIService(provider="mock")
    prompt = "Main UP se hu, meri umar 45 saal hai, main ek kisan hu aur meri aamdani 80 hazar hai."
    response_json_str = service.generate(prompt, json_mode=True)
    
    data = json.loads(response_json_str)
    assert data["age"] == 45
    assert data["occupation"] == "farmer"
    assert data["state"] == "Uttar Pradesh"
    assert data["annual_income"] == 80000.0


def test_ai_service_mock_json_extraction_woman_homemaker():
    """Verify mock generator parses homemaker woman in MP."""
    service = AIService(provider="mock")
    prompt = "Main MP se ek aurat hu, 32 saal ki, ghar sambhalti hu."
    response_json_str = service.generate(prompt, json_mode=True)
    
    data = json.loads(response_json_str)
    assert data["age"] == 32
    assert data["gender"] == "female"
    assert data["occupation"] == "homemaker"
    assert data["state"] == "Madhya Pradesh"


def test_ai_service_graceful_fallback_on_unconfigured_key():
    """When Gemini/OpenAI key is missing or dummy, service should gracefully fall back to mock."""
    service = AIService(provider="gemini", gemini_api_key="")
    assert service.is_configured() is False

    # Should not raise an unhandled exception, but seamlessly fall back
    res = service.generate("Main kisan hu", json_mode=True)
    data = json.loads(res)
    assert data["occupation"] == "farmer"


@pytest.mark.anyio
async def test_ai_service_async_generation():
    """Verify async generation method works with AnyIO."""
    service = AIService(provider="mock")
    res = await service.generate_async("Mujhe yojana janani hai")
    assert "योजनासेतु" in res
