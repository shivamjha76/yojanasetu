"""
Pydantic Schemas for Authentication, Registration, and User Profile
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=120, description="Valid email address")
    password: str = Field(..., min_length=6, max_length=100, description="User password (min 6 chars)")
    full_name: str = Field(..., min_length=2, max_length=100, description="Citizen's full name")
    phone: Optional[str] = Field(None, max_length=20, description="Contact phone / mobile number")
    state: Optional[str] = Field(None, max_length=50, description="State of residence")


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")


class UserProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    state: Optional[str] = Field(None, max_length=50)


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    state: Optional[str] = None
    citizen_details: Optional[Dict[str, Any]] = None
    created_at: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SavedSchemesResponse(BaseModel):
    total: int
    scheme_ids: List[str]


class FamilyMemberCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Member's full name")
    relationship: str = Field(..., description="Relationship to primary user (father, mother, brother, sister, etc.)")
    age: int = Field(..., ge=0, le=130, description="Age in years")
    gender: str = Field(..., description="Gender: male, female, transgender")
    state: Optional[str] = Field(None, max_length=50, description="State of residence")
    district: Optional[str] = Field(None, max_length=50, description="District")
    area_type: Optional[str] = Field("urban", description="Area type: rural, urban, semi-urban")
    occupation: str = Field(..., description="Occupation: farmer, student, homemaker, etc.")
    category: str = Field(..., description="Social category: general, obc, sc, st, ews")
    annual_income: float = Field(0.0, ge=0, description="Annual income in INR")
    marital_status: Optional[str] = Field(None, description="Marital status")
    is_differently_abled: bool = Field(False, description="Whether differently abled / Divyangjan")
    ration_card_type: Optional[str] = Field("none", description="Ration card: bpl, antyodaya, apl, none")
    land_holding_acres: Optional[float] = Field(0.0, ge=0, description="Agricultural land in acres")


class FamilyMemberUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    relationship: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=130)
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    area_type: Optional[str] = None
    occupation: Optional[str] = None
    category: Optional[str] = None
    annual_income: Optional[float] = Field(None, ge=0)
    marital_status: Optional[str] = None
    is_differently_abled: Optional[bool] = None
    ration_card_type: Optional[str] = None
    land_holding_acres: Optional[float] = Field(None, ge=0)


class FamilyMemberResponse(BaseModel):
    id: str
    user_id: str
    name: str
    relationship: str
    age: int
    gender: str
    state: Optional[str] = None
    district: Optional[str] = None
    area_type: Optional[str] = "urban"
    occupation: str
    category: str
    annual_income: float = 0.0
    marital_status: Optional[str] = None
    is_differently_abled: bool = False
    ration_card_type: Optional[str] = "none"
    land_holding_acres: float = 0.0
    created_at: str
    updated_at: str

