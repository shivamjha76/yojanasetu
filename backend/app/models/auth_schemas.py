"""
Pydantic Schemas for Authentication, Registration, and User Profile
"""

from typing import Optional, List
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
    created_at: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SavedSchemesResponse(BaseModel):
    total: int
    scheme_ids: List[str]
