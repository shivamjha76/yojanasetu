"""
YojanaSetu Assisted Mode & Operator API Router
Dedicated endpoints for Common Services Center (CSC) operators and NGO field workers:
- Multi-citizen profile management (save, edit, search)
- Deterministic eligibility scanning for assisted citizens
- Application lifecycle tracking and batch follow-up (ready, submitted, verified, approved)
- Operator summary analytics
"""

import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.models.schemas import CitizenProfile, EligibilityResult
from app.services.scheme_service import scheme_service
from app.core.explainability import generate_eligibility_result
from app.db import database as db

logger = logging.getLogger("yojanasetu.api.operator")
router = APIRouter(prefix="/operator", tags=["Assisted Mode / Operator"])


# -------------------------------------------------------------
# Request & Response Models
# -------------------------------------------------------------
class CreateAssistedCitizenRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="Citizen's full name")
    phone: Optional[str] = Field(None, description="Citizen contact phone number")
    village_ward: Optional[str] = Field(None, description="Village or Ward name")
    district: Optional[str] = Field(None, description="District name")
    state: Optional[str] = Field(None, description="State name")
    profile: CitizenProfile = Field(..., description="Full demographic profile for deterministic matching")
    operator_id: Optional[str] = Field("default_operator", description="Operator / VLE identifier")


class UpdateAssistedCitizenRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2)
    phone: Optional[str] = None
    village_ward: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    profile: Optional[CitizenProfile] = None


class ApplicationTrackingRequest(BaseModel):
    citizen_id: str
    scheme_id: str
    scheme_name: str
    benefit_amount: Optional[str] = None
    status: str = Field(
        ...,
        description="One of: 'documents_pending', 'ready_to_apply', 'submitted', 'verified', 'approved', 'rejected'",
    )
    ref_number: Optional[str] = Field(None, description="Government application reference / acknowledgement number")
    notes: Optional[str] = Field(None, description="Follow-up notes by operator/worker")


class AssistedCitizenItem(BaseModel):
    id: str
    operator_id: str
    full_name: str
    phone: Optional[str] = None
    village_ward: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    profile_data: Dict[str, Any]
    created_at: str
    updated_at: str
    application_count: int = 0
    eligible_count: Optional[int] = None


class AssistedCitizenEligibilityResponse(BaseModel):
    citizen: Dict[str, Any]
    total_schemes_evaluated: int
    eligible_schemes_count: int
    eligible_schemes: List[EligibilityResult]
    applications: List[Dict[str, Any]]


class OperatorSummaryResponse(BaseModel):
    total_citizens: int
    total_applications: int
    status_counts: Dict[str, int]
    districts_covered: List[str]


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------

@router.get("/summary", response_model=OperatorSummaryResponse)
def get_operator_summary(operator_id: str = "default_operator"):
    """Returns high-level operational statistics for the CSC/NGO field dashboard."""
    citizens = db.get_assisted_citizens(operator_id=operator_id)
    total_citizens = len(citizens)

    status_counts: Dict[str, int] = {
        "documents_pending": 0,
        "ready_to_apply": 0,
        "submitted": 0,
        "verified": 0,
        "approved": 0,
        "rejected": 0,
    }
    total_apps = 0
    districts = set()

    for c in citizens:
        if c.get("district"):
            districts.add(c["district"])
        apps = db.get_citizen_applications(c["id"])
        total_apps += len(apps)
        for a in apps:
            st = a.get("status", "ready_to_apply")
            status_counts[st] = status_counts.get(st, 0) + 1

    return OperatorSummaryResponse(
        total_citizens=total_citizens,
        total_applications=total_apps,
        status_counts=status_counts,
        districts_covered=sorted(list(districts)),
    )


@router.get("/citizens", response_model=List[AssistedCitizenItem])
def list_assisted_citizens(
    operator_id: str = "default_operator",
    search: Optional[str] = Query(None, description="Search by name, phone, village, district"),
):
    """List all citizens handled by the operator."""
    citizens = db.get_assisted_citizens(operator_id=operator_id, search=search)
    results = []
    for c in citizens:
        apps = db.get_citizen_applications(c["id"])
        item = AssistedCitizenItem(
            id=c["id"],
            operator_id=c["operator_id"],
            full_name=c["full_name"],
            phone=c["phone"],
            village_ward=c["village_ward"],
            district=c["district"],
            state=c["state"],
            profile_data=c["profile_data"],
            created_at=c["created_at"],
            updated_at=c["updated_at"],
            application_count=len(apps),
        )
        results.append(item)
    return results


@router.post("/citizens", response_model=AssistedCitizenItem, status_code=status.HTTP_201_CREATED)
def create_assisted_citizen(request: CreateAssistedCitizenRequest):
    """Register a new citizen in the operator registry."""
    created = db.create_assisted_citizen(
        full_name=request.full_name,
        profile_data=request.profile.model_dump(),
        phone=request.phone,
        village_ward=request.village_ward,
        district=request.district or request.profile.district,
        state=request.state or request.profile.state,
        operator_id=request.operator_id or "default_operator",
    )
    return AssistedCitizenItem(
        id=created["id"],
        operator_id=created["operator_id"],
        full_name=created["full_name"],
        phone=created["phone"],
        village_ward=created["village_ward"],
        district=created["district"],
        state=created["state"],
        profile_data=created["profile_data"],
        created_at=created["created_at"],
        updated_at=created["updated_at"],
        application_count=0,
    )


@router.get("/citizens/{citizen_id}", response_model=AssistedCitizenItem)
def get_assisted_citizen(citizen_id: str):
    """Get single citizen details."""
    citizen = db.get_assisted_citizen(citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    apps = db.get_citizen_applications(citizen_id)
    return AssistedCitizenItem(
        id=citizen["id"],
        operator_id=citizen["operator_id"],
        full_name=citizen["full_name"],
        phone=citizen["phone"],
        village_ward=citizen["village_ward"],
        district=citizen["district"],
        state=citizen["state"],
        profile_data=citizen["profile_data"],
        created_at=citizen["created_at"],
        updated_at=citizen["updated_at"],
        application_count=len(apps),
    )


@router.put("/citizens/{citizen_id}", response_model=AssistedCitizenItem)
def update_assisted_citizen(citizen_id: str, request: UpdateAssistedCitizenRequest):
    """Update citizen demographic profile or contact info."""
    profile_dict = request.profile.model_dump() if request.profile else None
    updated = db.update_assisted_citizen(
        citizen_id=citizen_id,
        full_name=request.full_name,
        profile_data=profile_dict,
        phone=request.phone,
        village_ward=request.village_ward,
        district=request.district,
        state=request.state,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Citizen not found")
    apps = db.get_citizen_applications(citizen_id)
    return AssistedCitizenItem(
        id=updated["id"],
        operator_id=updated["operator_id"],
        full_name=updated["full_name"],
        phone=updated["phone"],
        village_ward=updated["village_ward"],
        district=updated["district"],
        state=updated["state"],
        profile_data=updated["profile_data"],
        created_at=updated["created_at"],
        updated_at=updated["updated_at"],
        application_count=len(apps),
    )


@router.delete("/citizens/{citizen_id}")
def delete_assisted_citizen(citizen_id: str):
    """Remove a citizen record from operator registry."""
    success = db.delete_assisted_citizen(citizen_id)
    if not success:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return {"success": True, "message": f"Citizen {citizen_id} deleted"}


@router.get("/citizens/{citizen_id}/eligibility", response_model=AssistedCitizenEligibilityResponse)
def evaluate_assisted_citizen_schemes(citizen_id: str):
    """
    Runs deterministic eligibility matching against all schemes for an assisted citizen.
    Also returns the citizen's existing application statuses.
    """
    citizen = db.get_assisted_citizen(citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")

    raw_profile = citizen.get("profile_data", {})
    try:
        profile = CitizenProfile(**raw_profile)
    except Exception as e:
        logger.error(f"Error validating profile for citizen {citizen_id}: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid citizen profile data: {str(e)}")

    all_schemes = scheme_service.get_all()
    eligible_schemes: List[EligibilityResult] = []

    for scheme in all_schemes:
        result = generate_eligibility_result(profile, scheme)
        if result.is_eligible:
            eligible_schemes.append(result)

    # Sort eligible schemes by match percentage descending
    eligible_schemes.sort(key=lambda x: x.match_percentage, reverse=True)

    applications = db.get_citizen_applications(citizen_id)

    return AssistedCitizenEligibilityResponse(
        citizen=citizen,
        total_schemes_evaluated=len(all_schemes),
        eligible_schemes_count=len(eligible_schemes),
        eligible_schemes=eligible_schemes,
        applications=applications,
    )


@router.post("/applications")
def update_application_status(request: ApplicationTrackingRequest):
    """Record or update the lifecycle status of a scheme application for a citizen."""
    citizen = db.get_assisted_citizen(request.citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")

    record = db.upsert_citizen_application(
        citizen_id=request.citizen_id,
        scheme_id=request.scheme_id,
        scheme_name=request.scheme_name,
        benefit_amount=request.benefit_amount,
        status=request.status,
        ref_number=request.ref_number,
        notes=request.notes,
    )
    return {"success": True, "application": record}
