"""
YojanaSetu Pydantic Models & Schemas
Core data types for CitizenProfile, Scheme, Rule, DocumentRequirement, and EligibilityResult.
"""

from typing import List, Optional, Any, Literal
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# 1. Citizen Profile
# -------------------------------------------------------------
class CitizenProfile(BaseModel):
    age: int = Field(..., ge=0, le=120, description="Citizen age in years")
    gender: Literal["male", "female", "transgender", "all"] = Field(..., description="Gender")
    state: str = Field(..., description="Resident State / UT")
    district: Optional[str] = Field(default=None, description="District name")
    area_type: Optional[Literal["rural", "urban", "semi-urban"]] = Field(
        default=None, description="Area of residence"
    )
    occupation: Literal[
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
    ] = Field(..., description="Primary occupation")
    category: Literal["general", "obc", "sc", "st", "ews"] = Field(
        ..., description="Social category"
    )
    annual_income: float = Field(
        ..., ge=0, description="Annual household income in INR"
    )
    marital_status: Optional[Literal["single", "married", "widowed", "divorced"]] = Field(
        default=None, description="Marital status"
    )
    is_differently_abled: bool = Field(
        default=False, description="Whether citizen is differently abled (Divyangjan)"
    )
    ration_card_type: Optional[Literal["antyodaya", "bpl", "apl", "none"]] = Field(
        default=None, description="Ration card classification"
    )
    land_holding_acres: Optional[float] = Field(
        default=None, ge=0, description="Land holding in acres (for agriculture schemes)"
    )


# -------------------------------------------------------------
# 2. Rule & Deterministic Evaluation Schema
# -------------------------------------------------------------
class Rule(BaseModel):
    field: str = Field(
        ...,
        description="Profile field to test (e.g., 'age', 'annual_income', 'category', 'state', 'occupation')",
    )
    operator: Literal[">=", "<=", ">", "<", "==", "!=", "IN", "NOT_IN", "BETWEEN"] = Field(
        ..., description="Deterministic comparison operator"
    )
    value: Any = Field(
        ..., description="Rule threshold, constant value, or allowed list"
    )
    description_hi: Optional[str] = Field(
        default=None, description="Human readable explanation in Hindi"
    )
    description_en: Optional[str] = Field(
        default=None, description="Human readable explanation in English"
    )


# -------------------------------------------------------------
# 3. Document Requirement
# -------------------------------------------------------------
class DocumentRequirement(BaseModel):
    id: str = Field(..., description="Unique document key (e.g. 'aadhaar', 'income_certificate')")
    name_hi: str = Field(..., description="Document name in Hindi")
    name_en: str = Field(..., description="Document name in English")
    is_mandatory: bool = Field(default=True, description="Whether document is strictly mandatory")
    issuing_authority: Optional[str] = Field(
        default=None, description="Authority issuing the document (UIDAI, Tehsildar, etc.)"
    )
    how_to_get_url: Optional[str] = Field(
        default=None, description="Guidance link on how to obtain or apply for this document"
    )


# -------------------------------------------------------------
# 4. FAQ Item
# -------------------------------------------------------------
class FAQItem(BaseModel):
    question_hi: str
    question_en: str
    answer_hi: str
    answer_en: str


# -------------------------------------------------------------
# 5. Scheme Specification
# -------------------------------------------------------------
class Scheme(BaseModel):
    id: str = Field(..., description="Unique slug ID (e.g. 'pm-kisan')")
    name_hi: str = Field(..., description="Official scheme name in Hindi")
    name_en: str = Field(..., description="Official scheme name in English")
    short_summary_hi: str = Field(..., description="Brief one-line summary in Hindi")
    short_summary_en: str = Field(..., description="Brief one-line summary in English")
    detailed_description_hi: str = Field(..., description="Detailed description in Hindi")
    detailed_description_en: str = Field(..., description="Detailed description in English")
    ministry: str = Field(..., description="Nodal Ministry or Department")
    level: Literal["central", "state"] = Field(..., description="Central or State sponsored")
    applicable_state: Optional[str] = Field(
        default=None, description="State name if state scheme, or None for All India"
    )
    category: Literal[
        "agriculture",
        "education_scholarships",
        "healthcare",
        "women_child",
        "housing_urban",
        "business_msme_loans",
        "social_security_pensions",
        "skills_employment",
    ] = Field(..., description="Category tag")
    benefit_amount_text: str = Field(
        ..., description="User-friendly benefit highlight (e.g. '₹6,000 / वर्ष')"
    )
    benefit_type: Literal[
        "direct_benefit_transfer",
        "health_insurance",
        "loan_subsidy",
        "scholarship",
        "housing_grant",
        "in_kind_goods",
    ] = Field(..., description="Type of assistance")
    official_portal_url: str = Field(..., description="Verified direct government portal URL")
    processing_time_days: Optional[int] = Field(default=None, description="Estimated processing time in days")
    processing_time_hi: Optional[str] = Field(default=None, description="Honest estimated processing time in Hindi")
    processing_time_en: Optional[str] = Field(default=None, description="Honest estimated processing time in English")
    rules: List[Rule] = Field(default_factory=list, description="Deterministic eligibility rules")
    documents: List[DocumentRequirement] = Field(
        default_factory=list, description="Required documents checklist"
    )
    application_steps_hi: List[str] = Field(
        default_factory=list, description="Step-by-step application instructions in Hindi"
    )
    application_steps_en: List[str] = Field(
        default_factory=list, description="Step-by-step application instructions in English"
    )
    faqs: List[FAQItem] = Field(default_factory=list, description="Frequently asked questions")


# -------------------------------------------------------------
# 6. Rule Match Evidence & Eligibility Result
# -------------------------------------------------------------
class RuleMatchEvidence(BaseModel):
    field: str
    condition: str
    user_value: Any
    matched: bool
    evidence_text_hi: str
    evidence_text_en: str


class EligibilityResult(BaseModel):
    scheme_id: str
    scheme_name_hi: str
    scheme_name_en: str
    category: str
    benefit_amount_text: str
    benefit_type: str
    official_portal_url: str
    processing_time_days: Optional[int] = None
    processing_time_hi: Optional[str] = None
    processing_time_en: Optional[str] = None
    is_eligible: bool
    match_percentage: int = Field(..., ge=0, le=100)
    matched_rules: List[RuleMatchEvidence] = Field(default_factory=list)
    failing_rules: List[RuleMatchEvidence] = Field(default_factory=list)
    ineligibility_reasons_hi: List[str] = Field(default_factory=list)
    ineligibility_reasons_en: List[str] = Field(default_factory=list)
    required_documents: List[DocumentRequirement] = Field(default_factory=list)


# -------------------------------------------------------------
# 7. CSC / Jan Seva Kendra Schemas
# -------------------------------------------------------------
class CscCenter(BaseModel):
    id: str
    vle_name: str
    center_name: str
    csc_id: str
    state: str
    district: str
    pincode: str
    address: str
    landmark: Optional[str] = None
    phone: str
    email: Optional[str] = None
    timing: str = "09:00 AM - 06:30 PM"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: float = 4.8
    services: List[str] = Field(default_factory=list)
    distance: Optional[str] = None
    is_open: Optional[bool] = True
    status_text: Optional[str] = "Open Now"
    map_x: Optional[float] = None
    map_y: Optional[float] = None


class CscSearchResponse(BaseModel):
    total: int
    centers: List[CscCenter]
