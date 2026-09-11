"""
Citizen Profile Extractor & Sanitizer Service
Guarantees 100% deterministic schema validation on LLM entity extraction output.
Safely converts conversational Hindi/Hinglish/English into validated CitizenProfile instances.

Rule: "We use AI to understand the citizen, NOT to make eligibility decisions."
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field, ValidationError

from app.models.schemas import CitizenProfile
from app.core.prompts import PROFILE_EXTRACTION_SYSTEM_PROMPT, build_profile_extraction_prompt
from app.services.ai_service import ai_service

logger = logging.getLogger("yojanasetu.profile_extractor")

# Valid Enum Mappings
VALID_OCCUPATIONS = {
    "student",
    "farmer",
    "unemployed",
    "employed_private",
    "employed_government",
    "business_self_employed",
    "homemaker",
    "daily_wage_laborer",
    "artisan_craftsperson",
    "other",
}

OCCUPATION_SYNONYMS = {
    "kisan": "farmer",
    "kheti": "farmer",
    "agriculture": "farmer",
    "cultivator": "farmer",
    "krishak": "farmer",
    "padhai": "student",
    "college": "student",
    "school": "student",
    "learner": "student",
    "vidyarthi": "student",
    "chhatra": "student",
    "housewife": "homemaker",
    "grihini": "homemaker",
    "ghar": "homemaker",
    "berojgar": "unemployed",
    "jobless": "unemployed",
    "naukri dhundh": "unemployed",
    "vendor": "daily_wage_laborer",
    "thela": "daily_wage_laborer",
    "rehdi": "daily_wage_laborer",
    "mazdoor": "daily_wage_laborer",
    "laborer": "daily_wage_laborer",
    "labourer": "daily_wage_laborer",
    "worker": "daily_wage_laborer",
    "artisan": "artisan_craftsperson",
    "karigar": "artisan_craftsperson",
    "weaver": "artisan_craftsperson",
    "shopkeeper": "business_self_employed",
    "dukan": "business_self_employed",
    "vyapar": "business_self_employed",
    "business": "business_self_employed",
    "self-employed": "business_self_employed",
    "private job": "employed_private",
    "company": "employed_private",
    "sarkari": "employed_government",
    "govt": "employed_government",
}

VALID_CATEGORIES = {"general", "obc", "sc", "st", "ews"}

VALID_GENDERS = {"male", "female", "transgender", "all"}

VALID_RATION_CARDS = {"antyodaya", "bpl", "apl", "none"}

STATE_ALIASES = {
    "mp": "Madhya Pradesh",
    "madhya pradesh": "Madhya Pradesh",
    "up": "Uttar Pradesh",
    "uttar pradesh": "Uttar Pradesh",
    "bihar": "Bihar",
    "rajasthan": "Rajasthan",
    "rj": "Rajasthan",
    "delhi": "Delhi",
    "maharashtra": "Maharashtra",
    "mh": "Maharashtra",
    "gujarat": "Gujarat",
    "jharkhand": "Jharkhand",
    "punjab": "Punjab",
    "haryana": "Haryana",
    "west bengal": "West Bengal",
    "wb": "West Bengal",
    "karnataka": "Karnataka",
    "tamil nadu": "Tamil Nadu",
    "tn": "Tamil Nadu",
    "kerala": "Kerala",
    "odisha": "Odisha",
    "orissa": "Odisha",
    "assam": "Assam",
    "chhattisgarh": "Chhattisgarh",
    "cg": "Chhattisgarh",
    "uttarakhand": "Uttarakhand",
    "uk": "Uttarakhand",
    "himachal pradesh": "Himachal Pradesh",
    "hp": "Himachal Pradesh",
    "all india": "All India",
}


class ProfileExtractionResult(BaseModel):
    """Encapsulates the extracted CitizenProfile along with confidence and audit fields."""
    profile: CitizenProfile
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Extraction confidence score")
    detected_fields: List[str] = Field(default_factory=list, description="Fields explicitly extracted from input")
    missing_or_defaulted_fields: List[str] = Field(default_factory=list, description="Fields filled with sensible defaults")
    raw_input: str


def clean_llm_json_output(raw_text: str) -> str:
    """Removes markdown code fences and isolates JSON payload."""
    cleaned = raw_text.strip()

    # Remove ```json and ``` code fences
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    # Extract JSON between first '{' and last '}'
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        cleaned = cleaned[start_idx : end_idx + 1]

    return cleaned


def parse_income_string(income_val: Any) -> float:
    """Converts strings like '1.5 lakh', '80 hazar', '1,20,000' or float to float."""
    if isinstance(income_val, (int, float)):
        return float(max(0.0, float(income_val)))

    text = str(income_val).lower().replace(",", "").strip()
    match = re.search(r"(\d+(?:\.\d+)?)", text)
    if not match:
        return 120000.0

    val = float(match.group(1))
    if "lakh" in text or "लाख" in text:
        return val * 100000.0
    elif "hazar" in text or "हजार" in text or "k" in text:
        return val * 1000.0
    return float(max(0.0, val))


def sanitize_profile_dict(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str], List[str]]:
    """
    Sanitizes raw dictionary extracted by LLM and tracks detected vs defaulted fields.
    Returns: (sanitized_dict, detected_fields, defaulted_fields)
    """
    detected: List[str] = []
    defaulted: List[str] = []
    sanitized: Dict[str, Any] = {}

    # 1. Age
    raw_age = raw.get("age")
    if raw_age is not None:
        try:
            parsed_age = int(raw_age)
            if 0 <= parsed_age <= 120:
                sanitized["age"] = parsed_age
                detected.append("age")
            else:
                sanitized["age"] = 30
                defaulted.append("age")
        except (ValueError, TypeError):
            sanitized["age"] = 30
            defaulted.append("age")
    else:
        sanitized["age"] = 30
        defaulted.append("age")

    # 2. Gender
    raw_gender = str(raw.get("gender", "")).lower().strip()
    if raw_gender in ("female", "mahila", "woman", "aurat", "f"):
        sanitized["gender"] = "female"
        detected.append("gender")
    elif raw_gender in ("male", "purush", "man", "aadmi", "m"):
        sanitized["gender"] = "male"
        detected.append("gender")
    elif raw_gender in ("transgender", "kinnar", "tritiya"):
        sanitized["gender"] = "transgender"
        detected.append("gender")
    else:
        sanitized["gender"] = "male"
        defaulted.append("gender")

    # 3. State
    raw_state = str(raw.get("state", "")).lower().strip()
    matched_state = "All India"
    for alias, canonical in STATE_ALIASES.items():
        if alias == raw_state or alias in raw_state:
            matched_state = canonical
            break
    sanitized["state"] = matched_state
    if matched_state != "All India" and raw_state:
        detected.append("state")
    else:
        defaulted.append("state")

    # 4. District
    sanitized["district"] = raw.get("district")
    if sanitized["district"]:
        detected.append("district")

    # 5. Area Type
    raw_area = str(raw.get("area_type", "")).lower().strip()
    if raw_area in ("rural", "urban", "semi-urban"):
        sanitized["area_type"] = raw_area
        detected.append("area_type")
    else:
        sanitized["area_type"] = None

    # 6. Occupation
    raw_occ = str(raw.get("occupation", "")).lower().strip()
    matched_occ = "other"
    if raw_occ in VALID_OCCUPATIONS:
        matched_occ = raw_occ
        detected.append("occupation")
    else:
        for syn, canonical in OCCUPATION_SYNONYMS.items():
            if syn in raw_occ:
                matched_occ = canonical
                detected.append("occupation")
                break
    if matched_occ == "other" and "occupation" not in detected:
        defaulted.append("occupation")
    sanitized["occupation"] = matched_occ

    # 7. Category
    raw_cat = str(raw.get("category", "")).lower().strip()
    if raw_cat in VALID_CATEGORIES:
        sanitized["category"] = raw_cat
        detected.append("category")
    else:
        sanitized["category"] = "general"
        defaulted.append("category")

    # 8. Annual Income
    if "annual_income" in raw and raw["annual_income"] is not None:
        sanitized["annual_income"] = parse_income_string(raw["annual_income"])
        detected.append("annual_income")
    else:
        sanitized["annual_income"] = 120000.0
        defaulted.append("annual_income")

    # 9. Marital Status
    raw_ms = str(raw.get("marital_status", "")).lower().strip()
    if raw_ms in ("single", "married", "widowed", "divorced"):
        sanitized["marital_status"] = raw_ms
        detected.append("marital_status")
    else:
        sanitized["marital_status"] = None

    # 10. Differently Abled
    raw_divyang = raw.get("is_differently_abled")
    if isinstance(raw_divyang, bool):
        sanitized["is_differently_abled"] = raw_divyang
        if raw_divyang:
            detected.append("is_differently_abled")
    else:
        sanitized["is_differently_abled"] = False

    # 11. Ration Card Type
    raw_rc = str(raw.get("ration_card_type", "")).lower().strip()
    if raw_rc in VALID_RATION_CARDS:
        sanitized["ration_card_type"] = raw_rc
        if raw_rc != "none":
            detected.append("ration_card_type")
    else:
        sanitized["ration_card_type"] = "none"

    # 12. Land holding
    raw_land = raw.get("land_holding_acres")
    if raw_land is not None:
        try:
            sanitized["land_holding_acres"] = float(raw_land)
            detected.append("land_holding_acres")
        except (ValueError, TypeError):
            sanitized["land_holding_acres"] = None
    else:
        sanitized["land_holding_acres"] = None

    return sanitized, detected, defaulted


class ProfileExtractorService:
    """
    High-fidelity service to extract and sanitize CitizenProfile from raw conversational statements.
    """

    def __init__(self, ai_client=None):
        self.ai_client = ai_client or ai_service

    def extract_profile(self, user_text: str) -> ProfileExtractionResult:
        """
        Synchronously extracts and validates citizen profile from user input.
        """
        prompt = build_profile_extraction_prompt(user_text)
        raw_llm_response = self.ai_client.generate(
            prompt=prompt,
            system_instruction=PROFILE_EXTRACTION_SYSTEM_PROMPT,
            json_mode=True,
        )

        return self._process_and_validate(raw_llm_response, user_text)

    async def extract_profile_async(self, user_text: str) -> ProfileExtractionResult:
        """
        Asynchronously extracts and validates citizen profile from user input.
        """
        prompt = build_profile_extraction_prompt(user_text)
        raw_llm_response = await self.ai_client.generate_async(
            prompt=prompt,
            system_instruction=PROFILE_EXTRACTION_SYSTEM_PROMPT,
            json_mode=True,
        )

        return self._process_and_validate(raw_llm_response, user_text)

    def _process_and_validate(self, raw_llm_response: str, user_text: str) -> ProfileExtractionResult:
        """Cleans, parses, sanitizes, and verifies Pydantic schema guarantee."""
        cleaned_json = clean_llm_json_output(raw_llm_response)

        try:
            raw_dict = json.loads(cleaned_json)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to decode LLM response into JSON: {e}. Raw: {raw_llm_response}")
            raw_dict = {}

        sanitized_dict, detected_fields, defaulted_fields = sanitize_profile_dict(raw_dict)

        # Construct guaranteed valid Pydantic model
        try:
            profile = CitizenProfile.model_validate(sanitized_dict)
        except ValidationError as e:
            logger.error(f"Unexpected validation error during profile sanitization: {e}")
            # Emergency absolute fallback
            profile = CitizenProfile(
                age=30,
                gender="male",
                state="All India",
                occupation="other",
                category="general",
                annual_income=120000.0,
                is_differently_abled=False,
                ration_card_type="none",
            )

        # Core fields: age, gender, state, occupation, category, annual_income (6 core fields)
        core_fields = {"age", "gender", "state", "occupation", "category", "annual_income"}
        detected_core_count = len([f for f in detected_fields if f in core_fields])
        confidence_score = round(detected_core_count / len(core_fields), 2)

        return ProfileExtractionResult(
            profile=profile,
            confidence_score=confidence_score,
            detected_fields=detected_fields,
            missing_or_defaulted_fields=defaulted_fields,
            raw_input=user_text,
        )


# Global singleton instance
profile_extractor = ProfileExtractorService()
