"""
Authentication & Citizen Account Router
Provides endpoints for registration, login, profile management, and bookmarked schemes.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Header
from app.models.auth_schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserResponse,
    AuthTokenResponse,
    SavedSchemesResponse,
    FamilyMemberCreateRequest,
    FamilyMemberUpdateRequest,
    FamilyMemberResponse,
)
from app.models.schemas import CitizenProfile, EligibilityResult
from app.services.scheme_service import scheme_service
from app.core.explainability import generate_eligibility_result
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.db.database import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user_profile,
    save_citizen_details,
    save_scheme_for_user,
    remove_saved_scheme,
    get_saved_schemes,
    add_family_member,
    get_family_members,
    get_family_member,
    update_family_member,
    delete_family_member,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Citizen Accounts"])


def get_current_user(authorization: str = Header(None)) -> Dict[str, Any]:
    """Dependency to authenticate and return the current user from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split("Bearer ")[1].strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


@router.post(
    "/register",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new citizen account",
)
def register_user(request: UserRegisterRequest):
    """
    Registers a new citizen with their email, password, name, and optional state.
    Returns access token and citizen profile upon success.
    """
    try:
        hashed_pw = hash_password(request.password)
        user = create_user(
            email=request.email,
            full_name=request.full_name,
            hashed_password=hashed_pw,
            phone=request.phone,
            state=request.state,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user),
    )


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    summary="Citizen login",
)
def login_user(request: UserLoginRequest):
    """
    Authenticates citizen by email & password.
    Returns signed access token and citizen profile.
    """
    user = get_user_by_email(request.email)
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current citizen profile",
)
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns current logged-in citizen profile."""
    return UserResponse(**current_user)


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update citizen profile details",
)
def update_profile(
    request: UserProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update citizen profile details such as name, state, phone."""
    updated = update_user_profile(
        user_id=current_user["id"],
        full_name=request.full_name,
        phone=request.phone,
        state=request.state,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**updated)


@router.put(
    "/citizen-details",
    response_model=UserResponse,
    summary="Save or update citizen questionnaire details (My Details)",
)
def save_user_citizen_details(
    details: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Saves citizen eligibility questionnaire details (My Details) to the user's account."""
    updated = save_citizen_details(current_user["id"], details)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**updated)


@router.get(
    "/saved-schemes",
    response_model=SavedSchemesResponse,
    summary="Get citizen's saved/bookmarked schemes",
)
def get_user_saved_schemes(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns list of scheme IDs bookmarked by the citizen."""
    saved_ids = get_saved_schemes(current_user["id"])
    return SavedSchemesResponse(total=len(saved_ids), scheme_ids=saved_ids)


@router.post(
    "/saved-schemes/{scheme_id}",
    summary="Bookmark a scheme for citizen",
)
def bookmark_scheme(
    scheme_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Saves a scheme to the citizen's account."""
    success = save_scheme_for_user(current_user["id"], scheme_id)
    return {"success": True, "saved": success, "scheme_id": scheme_id}


@router.delete(
    "/saved-schemes/{scheme_id}",
    summary="Remove bookmark for a scheme",
)
def delete_bookmark(
    scheme_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Removes a saved scheme bookmark."""
    removed = remove_saved_scheme(current_user["id"], scheme_id)
    return {"success": True, "removed": removed, "scheme_id": scheme_id}


# =========================================================================
# Family & Beneficiary Members Endpoints
# =========================================================================

@router.get(
    "/members",
    response_model=List[FamilyMemberResponse],
    summary="Get all family members added by the citizen",
)
def list_family_members(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns list of all family / beneficiary members added to the citizen profile."""
    members = get_family_members(current_user["id"])
    return [FamilyMemberResponse(**m) for m in members]


@router.post(
    "/members",
    response_model=FamilyMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new family member",
)
def create_family_member(
    request: FamilyMemberCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Adds a family member (father, mother, brother, sister, uncle, friend, etc.) to the citizen's profile."""
    member = add_family_member(current_user["id"], request.model_dump())
    return FamilyMemberResponse(**member)


@router.get(
    "/members/{member_id}",
    response_model=FamilyMemberResponse,
    summary="Get details of a specific family member",
)
def read_family_member(
    member_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves profile details of a single family member."""
    member = get_family_member(current_user["id"], member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found",
        )
    return FamilyMemberResponse(**member)


@router.put(
    "/members/{member_id}",
    response_model=FamilyMemberResponse,
    summary="Update family member profile details",
)
def modify_family_member(
    member_id: str,
    request: FamilyMemberUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Updates profile attributes for an existing family member."""
    updated = update_family_member(
        current_user["id"],
        member_id,
        request.model_dump(exclude_unset=True),
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found",
        )
    return FamilyMemberResponse(**updated)


@router.delete(
    "/members/{member_id}",
    summary="Remove a family member from profile",
)
def remove_family_member(
    member_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Deletes a family member from the citizen profile."""
    deleted = delete_family_member(current_user["id"], member_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found",
        )
    return {"success": True, "deleted_id": member_id}


@router.get(
    "/members/{member_id}/eligibility",
    summary="Evaluate eligible schemes specifically for a family member",
)
def evaluate_family_member_eligibility(
    member_id: str,
    include_ineligible: bool = False,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Deterministically evaluates all schemes against a family member's profile
    and returns ranked matching schemes with explainable qualification criteria.
    """
    member = get_family_member(current_user["id"], member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found",
        )

    # Sanitize and normalize fields for robust CitizenProfile instantiation
    gender = str(member.get("gender", "male")).strip().lower()
    if gender not in ("male", "female", "transgender", "all"):
        gender = "male"

    category = str(member.get("category", "general")).strip().lower()
    if category not in ("general", "obc", "sc", "st", "ews"):
        category = "general"

    valid_occupations = {
        "student", "farmer", "unemployed", "employed_private",
        "employed_government", "business_self_employed", "homemaker",
        "daily_wage_laborer", "artisan_craftsperson", "other"
    }
    occupation = str(member.get("occupation", "other")).strip().lower()
    if occupation not in valid_occupations:
        occupation = "other"

    area_type = member.get("area_type")
    if area_type:
        area_type = str(area_type).strip().lower()
        if area_type not in ("rural", "urban", "semi-urban"):
            area_type = "urban"
    else:
        area_type = "urban"

    marital_status = member.get("marital_status")
    if marital_status:
        marital_status = str(marital_status).strip().lower()
        if marital_status not in ("single", "married", "widowed", "divorced"):
            marital_status = None
    else:
        marital_status = None

    ration_card_type = member.get("ration_card_type")
    if ration_card_type:
        ration_card_type = str(ration_card_type).strip().lower()
        if ration_card_type not in ("antyodaya", "bpl", "apl", "none"):
            ration_card_type = "none"
    else:
        ration_card_type = "none"

    # Construct CitizenProfile safely
    profile = CitizenProfile(
        age=int(member.get("age", 30)),
        gender=gender,
        state=member.get("state") or current_user.get("state") or "Delhi",
        district=member.get("district") or None,
        area_type=area_type,
        occupation=occupation,
        category=category,
        annual_income=float(member.get("annual_income") or 0.0),
        marital_status=marital_status,
        is_differently_abled=bool(member.get("is_differently_abled")),
        ration_card_type=ration_card_type,
        land_holding_acres=float(member.get("land_holding_acres") or 0.0),
    )

    all_schemes = scheme_service.get_all()
    eligible_results: List[EligibilityResult] = []
    ineligible_results: List[EligibilityResult] = []

    for scheme in all_schemes:
        res = generate_eligibility_result(profile, scheme)
        if res.is_eligible:
            eligible_results.append(res)
        else:
            ineligible_results.append(res)

    eligible_results.sort(key=lambda x: (x.match_percentage, len(x.matched_rules)), reverse=True)
    ineligible_results.sort(key=lambda x: x.match_percentage, reverse=True)

    return {
        "member_id": member["id"],
        "member_name": member["name"],
        "relationship": member["relationship"],
        "total_schemes_evaluated": len(all_schemes),
        "eligible_count": len(eligible_results),
        "ineligible_count": len(ineligible_results),
        "eligible_schemes": eligible_results,
        "ineligible_schemes": ineligible_results if include_ineligible else None,
    }

