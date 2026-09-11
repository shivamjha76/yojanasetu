"""
YojanaSetu Document Verification Models
Defines request and response schemas for AI-powered document verification.
"""

from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class ExtractedDocData(BaseModel):
    document_type_detected: Optional[str] = Field(
        default=None, description="Type of document identified by AI (e.g. Aadhaar, Income Certificate)"
    )
    citizen_name: Optional[str] = Field(
        default=None, description="Citizen name detected on document"
    )
    document_number_masked: Optional[str] = Field(
        default=None, description="Masked document identification number (e.g. XXXX-XXXX-1234)"
    )
    annual_income: Optional[float] = Field(
        default=None, description="Extracted annual income in INR, if applicable"
    )
    category: Optional[str] = Field(
        default=None, description="Extracted social category (General, OBC, SC, ST, EWS), if applicable"
    )
    date_of_birth: Optional[str] = Field(
        default=None, description="Extracted DOB or Year of birth, if applicable"
    )
    state_or_district: Optional[str] = Field(
        default=None, description="Issuing state or district"
    )
    issuing_authority: Optional[str] = Field(
        default=None, description="Issuing authority name"
    )
    valid_until: Optional[str] = Field(
        default=None, description="Validity or expiration date if present"
    )


class DocumentVerifyResponse(BaseModel):
    status: Literal["verified", "rejected", "unclear_image", "wrong_document", "mismatch"] = Field(
        ..., description="Verification status: verified (green tick), rejected (red tick), unclear_image (retry), wrong_document, or mismatch"
    )
    is_eligible: bool = Field(
        ..., description="Whether citizen is eligible based on this document's criteria"
    )
    confidence_score: float = Field(
        default=0.95, ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0"
    )
    extracted_data: ExtractedDocData = Field(
        default_factory=ExtractedDocData, description="Data points extracted from document"
    )
    title_hi: str = Field(..., description="Short status title in Hindi")
    title_en: str = Field(..., description="Short status title in English")
    reason_hi: str = Field(..., description="Citizen friendly explanation in Hindi")
    reason_en: str = Field(..., description="Citizen friendly explanation in English")
    suggestion_hi: Optional[str] = Field(
        default=None, description="Actionable next steps or recommendation in Hindi"
    )
    suggestion_en: Optional[str] = Field(
        default=None, description="Actionable next steps or recommendation in English"
    )
    is_consistent_with_previous: Optional[bool] = Field(
        default=True, description="Whether extracted details match prior uploaded documents (e.g. name, DOB)"
    )
    mismatch_details: Optional[str] = Field(
        default=None, description="Explanation of specific mismatch across documents"
    )
