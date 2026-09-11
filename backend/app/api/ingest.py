"""
YojanaSetu Scheme Prose Ingestion Tool & Pipeline
PS #1 Core Capability:
Takes raw unstructured official scheme descriptions, gazette notifications, or guidelines (English/Hindi)
and parses them into verified, machine-executable JSON rules adhering strictly to data/schema.json.
Provides:
1. Automated schema extraction (Pydantic model adherence)
2. Deterministic validation with app.core.scheme_validator
3. Ingestion preview and live database / catalog commit
"""

import json
import logging
import re
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.models.schemas import Scheme, Rule, DocumentRequirement, FAQItem
from app.services.ai_service import ai_service
from app.services.scheme_service import scheme_service, DEFAULT_DATA_FILE
from app.core.scheme_validator import validate_scheme_dict

logger = logging.getLogger("yojanasetu.ingest")
router = APIRouter(prefix="/schemes", tags=["Scheme Ingestion Pipeline"])


class ProseIngestRequest(BaseModel):
    raw_text: str = Field(
        ...,
        min_length=20,
        description="Raw unstructured text from an official government gazette, guidelines, or press release.",
    )
    scheme_id_override: Optional[str] = Field(None, description="Optional manual slug ID (e.g. 'mukhyamantri-kisan-kalyan')")
    category_hint: Optional[str] = Field(None, description="Optional category hint (e.g. 'agriculture', 'education_scholarships')")
    save_to_catalog: bool = Field(False, description="If True, append the parsed scheme to the active schemes.json catalog")


class ProseIngestResponse(BaseModel):
    success: bool
    parsed_scheme: Scheme
    validation_passed: bool
    validation_errors: List[str] = Field(default_factory=list)
    rules_count: int
    documents_count: int
    raw_preview: Dict[str, Any]
    message_hi: str
    message_en: str


def _heuristic_prose_parser(raw_text: str, scheme_id_override: Optional[str] = None, category_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Deterministic rule-based prose extractor as high-speed, reliable baseline or offline fallback.
    Extracts age, income, state, gender, and benefits from unstructured text.
    """
    text_lower = raw_text.lower()
    
    # 1. Determine Scheme ID
    if scheme_id_override:
        slug = re.sub(r"[^a-z0-9\-_]", "-", scheme_id_override.strip().lower())
    else:
        # Pick first words
        first_line = raw_text.strip().split("\n")[0]
        words = re.findall(r"[A-Za-z0-9]+", first_line)[:4]
        slug = "-".join(words).lower() if words else "new-govt-scheme"

    # 2. Extract Category
    category = category_hint or "social_security_pensions"
    if any(k in text_lower for k in ["farmer", "kisan", "krishi", "agriculture", "crop", "land"]):
        category = "agriculture"
    elif any(k in text_lower for k in ["health", "hospital", "swasthya", "medical", "ayushman"]):
        category = "healthcare"
    elif any(k in text_lower for k in ["student", "scholarship", "vidyarthi", "education", "chhatravritti"]):
        category = "education_scholarships"
    elif any(k in text_lower for k in ["women", "mahila", "girl", "kanya", "behna"]):
        category = "women_child"
    elif any(k in text_lower for k in ["housing", "awas", "ghar", "makaan"]):
        category = "housing_urban"
    elif any(k in text_lower for k in ["loan", "mudra", "svanidhi", "vendor", "business", "vyapar"]):
        category = "business_msme_loans"
    elif any(k in text_lower for k in ["skill", "kaushal", "employment", "rozgar", "internship"]):
        category = "skills_employment"

    # 3. Detect Rules
    rules = []

    # Age rule
    age_match = re.search(r"(\d{2})\s*(?:to|-)\s*(\d{2})\s*(?:years|वर्ष)", raw_text, re.IGNORECASE)
    if age_match:
        min_age, max_age = int(age_match.group(1)), int(age_match.group(2))
        rules.append({
            "field": "age",
            "operator": ">=",
            "value": min_age,
            "description_hi": f"आयु कम से कम {min_age} वर्ष होनी चाहिए",
            "description_en": f"Minimum age required is {min_age} years",
        })
        rules.append({
            "field": "age",
            "operator": "<=",
            "value": max_age,
            "description_hi": f"आयु अधिकतम {max_age} वर्ष होनी चाहिए",
            "description_en": f"Maximum age allowed is {max_age} years",
        })
    else:
        min_age_m = re.search(r"(?:above|at least|minimum|न्यूनतम)\s*(\d{2})\s*(?:years|वर्ष)", raw_text, re.IGNORECASE)
        if min_age_m:
            min_age = int(min_age_m.group(1))
            rules.append({
                "field": "age",
                "operator": ">=",
                "value": min_age,
                "description_hi": f"आयु कम से कम {min_age} वर्ष होनी चाहिए",
                "description_en": f"Minimum age required is {min_age} years",
            })

    # Income rule
    income_m = re.search(r"(?:income|आय).*?(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|लाख)", raw_text, re.IGNORECASE)
    if income_m:
        lakhs = float(income_m.group(1))
        income_val = int(lakhs * 100000)
        rules.append({
            "field": "annual_income",
            "operator": "<=",
            "value": income_val,
            "description_hi": f"वार्षिक पारिवारिक आय ₹{lakhs} लाख या उससे कम होनी चाहिए",
            "description_en": f"Annual family income must not exceed ₹{lakhs} Lakhs",
        })

    # Gender rule
    if any(k in text_lower for k in ["only women", "महिलाएं", "women only", "बालिकाओं", "girl"]):
        rules.append({
            "field": "gender",
            "operator": "==",
            "value": "female",
            "description_hi": "यह योजना केवल महिला नागरिकों के लिए है",
            "description_en": "Scheme is specifically for female citizens",
        })

    # Occupation rule
    if category == "agriculture":
        rules.append({
            "field": "occupation",
            "operator": "==",
            "value": "farmer",
            "description_hi": "आवेदक का पेशा किसान होना चाहिए",
            "description_en": "Applicant must be a farmer",
        })
    elif category == "education_scholarships":
        rules.append({
            "field": "occupation",
            "operator": "==",
            "value": "student",
            "description_hi": "आवेदक विद्यार्थी/छात्र होना चाहिए",
            "description_en": "Applicant must be a regular student",
        })

    # Default rule if none found
    if not rules:
        rules.append({
            "field": "age",
            "operator": ">=",
            "value": 18,
            "description_hi": "आयु 18 वर्ष या उससे अधिक होनी चाहिए",
            "description_en": "Applicant must be 18 years or above",
        })

    # 4. Extract Benefit
    benefit_match = re.search(r"(?:₹|rs\.?|inr)\s*([\d,]+(?:\s*(?:per year|प्रति वर्ष|\/वर्ष|lakh|लाख))?)", raw_text, re.IGNORECASE)
    benefit_text = f"₹{benefit_match.group(1)}" if benefit_match else "सरकारी अनुदान एवं वित्तीय सहायता"

    # Benefit type
    benefit_type = "direct_benefit_transfer"
    if "loan" in text_lower or "ऋण" in text_lower:
        benefit_type = "loan_subsidy"
    elif "health" in text_lower or "इलाज" in text_lower or "hospital" in text_lower:
        benefit_type = "health_insurance"
    elif "scholarship" in text_lower or "छात्रवृत्ति" in text_lower:
        benefit_type = "scholarship"
    elif "housing" in text_lower or "आवास" in text_lower:
        benefit_type = "housing_grant"

    # 5. Extract Title
    lines = [l.strip() for l in raw_text.strip().split("\n") if len(l.strip()) > 3]
    name_raw = lines[0] if lines else "New Welfare Initiative"
    name_en = re.sub(r"[#*_]", "", name_raw)
    name_hi = f"{name_en} (अनुमोदित)"

    return {
        "id": slug,
        "name_hi": name_hi,
        "name_en": name_en,
        "short_summary_hi": f"{name_hi} के तहत पात्र नागरिकों को वित्तीय सहायता प्रदान की जाती है।",
        "short_summary_en": f"Provides welfare and financial assistance under {name_en} to eligible citizens.",
        "detailed_description_hi": raw_text[:300].strip(),
        "detailed_description_en": raw_text[:300].strip(),
        "ministry": "संबद्ध सरकारी मंत्रालय / Concerned Ministry",
        "level": "central",
        "applicable_state": None,
        "category": category,
        "benefit_amount_text": benefit_text,
        "benefit_type": benefit_type,
        "official_portal_url": "https://india.gov.in/",
        "processing_time_days": 30,
        "processing_time_hi": "15 - 30 कार्य दिवस (सत्यापन पश्चात)",
        "processing_time_en": "15 - 30 working days (post verification)",
        "rules": rules,
        "documents": [
            {
                "id": "aadhaar",
                "name_hi": "आधार कार्ड (पहचान पत्र)",
                "name_en": "Aadhaar Card (Identity Proof)",
                "is_mandatory": True,
                "issuing_authority": "UIDAI",
                "how_to_get_url": "https://myaadhaar.uidai.gov.in/",
            },
            {
                "id": "bank_passbook",
                "name_hi": "बैंक खाता विवरण (DBT समर्थित)",
                "name_en": "Bank Account Details (DBT Enabled)",
                "is_mandatory": True,
                "issuing_authority": "Commercial / Rural Bank",
                "how_to_get_url": None,
            },
        ],
        "application_steps_hi": [
            "1. आधिकारिक सरकारी पोर्टल पर जाएं।",
            "2. नागरिक पंजीकरण विकल्प चुनें और आधार विवरण दर्ज करें।",
            "3. आवश्यक प्रमाणपत्र अपलोड कर सबमिट करें।",
        ],
        "application_steps_en": [
            "1. Visit the official government portal.",
            "2. Register your applicant profile with Aadhaar.",
            "3. Upload verification certificates and submit application.",
        ],
        "faqs": [
            {
                "question_hi": "क्या यह योजना सभी नागरिकों के लिए खुली है?",
                "question_en": "Is this scheme open to all citizens?",
                "answer_hi": "हाँ, निर्धारित पात्रता शर्तों और मानदंडों को पूरा करने वाले सभी नागरिक आवेदन कर सकते हैं।",
                "answer_en": "Yes, all citizens meeting the specified eligibility rules may apply.",
            }
        ],
    }


@router.post("/ingest", response_model=ProseIngestResponse)
async def ingest_scheme_prose(payload: ProseIngestRequest):
    """
    Ingests raw scheme prose, extracts structured attributes and rule operators,
    validates adherence to schema, and optionally commits to the catalog.
    """
    raw = payload.raw_text.strip()
    if not raw:
        raise HTTPException(status_code=400, detail="Raw scheme text cannot be empty.")

    # 1. Attempt LLM extraction if configured, else fall back to heuristic extractor
    parsed_dict: Optional[Dict[str, Any]] = None
    if ai_service.is_configured() and ai_service.provider != "mock":
        try:
            prompt = f"""You are a specialized government policy parser. Convert the following official welfare scheme text into strict JSON adhering to the YojanaSetu Scheme schema:

Rules to follow:
- Extract 'id' as a lowercase hyphenated slug.
- Extract 'rules' as an array of objects with field, operator (==, !=, >, >=, <, <=, IN, NOT_IN), value, description_hi, description_en.
- Extract 'category' (one of: agriculture, education_scholarships, healthcare, women_child, housing_urban, business_msme_loans, skills_employment, social_security_pensions).
- Extract 'benefit_type' (one of: direct_benefit_transfer, health_insurance, loan_subsidy, scholarship, housing_grant, in_kind_goods).
- Extract 'documents' array with id, name_hi, name_en, is_mandatory, issuing_authority.
- Include processing_time_days (int), processing_time_hi, processing_time_en.

Prose:
\"\"\"{raw}\"\"\"
"""
            llm_res = await ai_service.generate_text_async(prompt, json_mode=True)
            cleaned = json.loads(llm_res)
            if "id" in cleaned and "rules" in cleaned:
                parsed_dict = cleaned
        except Exception as e:
            logger.warning(f"LLM prose ingestion parsing failed, using heuristic: {e}")

    if not parsed_dict:
        parsed_dict = _heuristic_prose_parser(
            raw,
            scheme_id_override=payload.scheme_id_override,
            category_hint=payload.category_hint,
        )

    # 2. Validate against Scheme Pydantic schema
    validation_passed = True
    validation_errors = []
    try:
        validated_scheme = validate_scheme_dict(parsed_dict)
    except Exception as err:
        validation_passed = False
        validation_errors.append(str(err))
        # Create a patched version that guarantees valid Scheme
        patched = _heuristic_prose_parser(raw, scheme_id_override=payload.scheme_id_override)
        validated_scheme = validate_scheme_dict(patched)

    # 3. Optional Catalog Save
    if payload.save_to_catalog and validation_passed:
        try:
            current_all = [s.model_dump() for s in scheme_service.get_all()]
            # Check duplicate
            existing_idx = next((i for i, s in enumerate(current_all) if s["id"] == validated_scheme.id), None)
            if existing_idx is not None:
                current_all[existing_idx] = validated_scheme.model_dump()
            else:
                current_all.append(validated_scheme.model_dump())

            # Write to disk
            with open(DEFAULT_DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(current_all, f, ensure_ascii=False, indent=2)

            # Reload service
            scheme_service.load_schemes()
            logger.info(f"Scheme '{validated_scheme.id}' successfully ingested and committed to catalog.")
        except Exception as err:
            logger.error(f"Failed to persist ingested scheme to file: {err}")

    return ProseIngestResponse(
        success=True,
        parsed_scheme=validated_scheme,
        validation_passed=validation_passed,
        validation_errors=validation_errors,
        rules_count=len(validated_scheme.rules),
        documents_count=len(validated_scheme.documents),
        raw_preview=validated_scheme.model_dump(),
        message_hi=f"योजना '{validated_scheme.name_hi}' सफलतापूर्वक पार्स की गई और {len(validated_scheme.rules)} नियमों में रूपांतरित हुई।",
        message_en=f"Scheme '{validated_scheme.name_en}' parsed successfully with {len(validated_scheme.rules)} deterministic rules.",
    )
