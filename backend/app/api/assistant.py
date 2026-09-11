"""
AI Assistant API Routes (Setu Sahayak)
Endpoints for conversational demographic profile extraction and AI assistance.

Golden Rule:
"We use AI to understand the citizen, NOT to make eligibility decisions."
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.models.schemas import CitizenProfile
from app.services.ai_service import ai_service
from app.services.profile_extractor import profile_extractor, ProfileExtractionResult

logger = logging.getLogger("yojanasetu.assistant_api")

router = APIRouter()


class ProfileExtractRequest(BaseModel):
    user_input: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Conversational statement in Hindi, Hinglish, or English (e.g. from voice-to-text mic)",
        examples=["मैं मध्य प्रदेश से हूँ, 35 साल की महिला, घर संभालती हूँ, बीपीएल कार्ड है।"],
    )


class ProfileExtractResponse(BaseModel):
    success: bool = True
    profile: CitizenProfile
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    detected_fields: List[str]
    missing_or_defaulted_fields: List[str]
    raw_input: str
    suggested_clarifications_hi: List[str] = Field(default_factory=list)
    suggested_clarifications_en: List[str] = Field(default_factory=list)


def _generate_clarification_suggestions(missing_fields: List[str]) -> tuple[List[str], List[str]]:
    """Generates polite prompts in Hindi and English for fields that were not detected."""
    hi_suggestions = []
    en_suggestions = []

    field_map = {
        "annual_income": (
            "कृपया अपनी वार्षिक पारिवारिक आय (Annual Income) की पुष्टि करें।",
            "Please confirm your annual household income.",
        ),
        "state": (
            "कृपया अपने राज्य (State) का नाम चुनें।",
            "Please select your state of residence.",
        ),
        "occupation": (
            "कृपया अपना मुख्य व्यवसाय (Occupation) चुनें।",
            "Please confirm your primary occupation.",
        ),
        "category": (
            "कृपया अपनी सामाजिक श्रेणी (General / OBC / SC / ST / EWS) बताएं।",
            "Please verify your social category (General / OBC / SC / ST / EWS).",
        ),
        "ration_card_type": (
            "क्या आपके पास कोई राशन कार्ड (BPL / अंत्योदय) है?",
            "Do you have a ration card (BPL / Antyodaya)?",
        ),
    }

    for field in missing_fields:
        if field in field_map:
            hi, en = field_map[field]
            hi_suggestions.append(hi)
            en_suggestions.append(en)

    return hi_suggestions, en_suggestions


@router.get(
    "/assistant/status",
    summary="Get Setu Sahayak AI assistant engine status",
)
def get_assistant_status():
    """Returns the operational status of the conversational AI provider."""
    info = ai_service.get_provider_info()
    return {
        "status": "ready",
        "assistant_name": "Setu Sahayak (सेतु सहायक)",
        "provider": info["provider"],
        "model": info["model"],
        "is_configured": info["is_configured"],
        "supports_voice_extraction": True,
    }


@router.post(
    "/assistant/extract-profile",
    response_model=ProfileExtractResponse,
    summary="Extract structured demographic profile from natural voice/text statement",
)
async def extract_profile_from_text(request: ProfileExtractRequest):
    """
    Parses natural language (Hindi, Hinglish, English) from citizen voice/text
    and returns a guaranteed valid CitizenProfile with confidence scoring.
    """
    try:
        extraction_result: ProfileExtractionResult = await profile_extractor.extract_profile_async(
            request.user_input
        )

        hi_clarifications, en_clarifications = _generate_clarification_suggestions(
            extraction_result.missing_or_defaulted_fields
        )

        return ProfileExtractResponse(
            success=True,
            profile=extraction_result.profile,
            confidence_score=extraction_result.confidence_score,
            detected_fields=extraction_result.detected_fields,
            missing_or_defaulted_fields=extraction_result.missing_or_defaulted_fields,
            raw_input=extraction_result.raw_input,
            suggested_clarifications_hi=hi_clarifications,
            suggested_clarifications_en=en_clarifications,
        )

    except Exception as e:
        logger.error(f"Error during profile extraction: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process citizen statement: {str(e)}",
        )


class SchemeExplainRequest(BaseModel):
    scheme_id: str = Field(..., description="ID of the scheme to explain (e.g. 'pm-kisan')")
    user_question: str = Field(..., min_length=3, max_length=1000, description="Citizen query regarding the scheme")
    language: str = Field(default="hi", description="Language of explanation ('hi' or 'en')")


class SchemeExplainResponse(BaseModel):
    success: bool = True
    scheme_id: str
    scheme_name: str
    official_portal_url: str
    benefit_highlight: str
    answer: str


@router.post(
    "/assistant/explain-scheme",
    response_model=SchemeExplainResponse,
    summary="Answer citizen questions grounded strictly on verified scheme facts",
)
async def explain_scheme(request: SchemeExplainRequest):
    """
    Answers questions about a specific scheme using verified facts from official registry.
    Prevents hallucination by strictly grounding the LLM in scheme records.
    """
    from app.services.scheme_service import scheme_service
    from app.core.prompts import SCHEME_EXPLAINER_SYSTEM_PROMPT, build_scheme_explainer_prompt

    scheme = scheme_service.get_by_id(request.scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{request.scheme_id}' was not found in verified registry.",
        )

    lang = "en" if request.language.lower() == "en" else "hi"
    scheme_dict = scheme.model_dump()
    prompt = build_scheme_explainer_prompt(
        scheme_data=scheme_dict,
        user_question=request.user_question,
        language=lang,
    )

    answer = await ai_service.generate_async(
        prompt=prompt,
        system_instruction=SCHEME_EXPLAINER_SYSTEM_PROMPT,
        json_mode=False,
    )

    scheme_name = scheme.name_hi if lang == "hi" else scheme.name_en

    return SchemeExplainResponse(
        success=True,
        scheme_id=scheme.id,
        scheme_name=scheme_name,
        official_portal_url=scheme.official_portal_url,
        benefit_highlight=scheme.benefit_amount_text,
        answer=answer.strip(),
    )

