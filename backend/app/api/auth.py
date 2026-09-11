"""
Authentication & Citizen Account Router
Provides endpoints for registration, login, profile management, and bookmarked schemes.
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status, Header
from app.models.auth_schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserResponse,
    AuthTokenResponse,
    SavedSchemesResponse,
)
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
