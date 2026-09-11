"""
Eligibility Evaluation API Routes
Accepts CitizenProfile and returns personalized, ranked eligible schemes with explainability proofs.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from app.models.schemas import CitizenProfile, EligibilityResult
from app.services.scheme_service import scheme_service
from app.core.explainability import generate_eligibility_result

router = APIRouter()


class EligibilityCheckResponse(BaseModel):
    citizen_summary: Dict[str, Any] = Field(..., description="Summary of evaluated profile")
    total_schemes_evaluated: int = Field(..., description="Total schemes scanned")
    eligible_count: int = Field(..., description="Count of schemes citizen qualifies for")
    eligible_schemes: List[EligibilityResult] = Field(
        default_factory=list, description="Ranked eligible schemes with match evidence"
    )
    ineligible_schemes: Optional[List[EligibilityResult]] = Field(
        default=None, description="Ineligible schemes with failure reasons (if requested)"
    )


@router.post(
    "/eligibility/check",
    response_model=EligibilityCheckResponse,
    summary="Evaluate citizen eligibility across all schemes",
    description="Deterministic evaluation engine testing citizen profile against all central and state schemes.",
)
def check_eligibility(
    profile: CitizenProfile,
    include_ineligible: bool = Query(
        default=False,
        description="Include non-matching schemes with failure reasons",
    ),
    category: Optional[str] = Query(
        default=None,
        description="Limit eligibility check to a specific category",
    ),
):
    all_schemes = scheme_service.get_all()

    if category:
        cat_norm = category.strip().lower()
        all_schemes = [s for s in all_schemes if s.category == cat_norm]

    eligible_results: List[EligibilityResult] = []
    ineligible_results: List[EligibilityResult] = []

    for scheme in all_schemes:
        res = generate_eligibility_result(profile, scheme)
        if res.is_eligible:
            eligible_results.append(res)
        else:
            ineligible_results.append(res)

    # Sort eligible schemes by match_percentage descending
    eligible_results.sort(key=lambda x: (x.match_percentage, len(x.matched_rules)), reverse=True)
    # Sort ineligible schemes by match_percentage descending (near-misses first)
    ineligible_results.sort(key=lambda x: x.match_percentage, reverse=True)

    citizen_summary = {
        "age": profile.age,
        "gender": profile.gender,
        "state": profile.state,
        "occupation": profile.occupation,
        "category": profile.category,
        "annual_income": profile.annual_income,
        "is_differently_abled": profile.is_differently_abled,
        "ration_card_type": profile.ration_card_type,
    }

    return EligibilityCheckResponse(
        citizen_summary=citizen_summary,
        total_schemes_evaluated=len(all_schemes),
        eligible_count=len(eligible_results),
        eligible_schemes=eligible_results,
        ineligible_schemes=ineligible_results if include_ineligible else None,
    )
