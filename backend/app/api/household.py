"""
YojanaSetu Household Combined Claim Engine
Bonus Innovation Requirement (PS #1):
Evaluates an entire household (multiple family members) simultaneously:
1. Eliminates duplicate household-capped benefits (e.g. Ayushman Bharat ₹5L card per family, NFSA ration card per household).
2. Aggregates individual member benefits (PM-KISAN, PM-VISHWAKARMA, NSP Scholarships, PMSVANIDHI, Sukanya Samriddhi).
3. Computes Total Annual Household Value (₹ Direct Cash Transfer + ₹ Subsidized Loan Access + ₹ Health Coverage).
4. Generates an optimal Combined Claim Roadmap with one-click multi-member application checklist.
"""

import logging
import re
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from app.models.schemas import CitizenProfile, EligibilityResult
from app.services.scheme_service import scheme_service
from app.core.explainability import generate_eligibility_result

logger = logging.getLogger("yojanasetu.household")
router = APIRouter(prefix="/household", tags=["Household Combined Claim"])


class FamilyMember(BaseModel):
    id: str = Field(..., description="Unique local identifier for member, e.g. 'mem_1'")
    name: str = Field(..., description="Full name of family member")
    relation: str = Field(
        ...,
        description="Relation to primary applicant: 'self', 'spouse', 'son', 'daughter', 'father', 'mother', 'other'",
    )
    profile: CitizenProfile = Field(..., description="Full demographic profile for this member")


class HouseholdClaimRequest(BaseModel):
    family_name: Optional[str] = Field("Sharma Family", description="Household reference name")
    members: List[FamilyMember] = Field(..., min_length=1, description="List of family members")


class MemberEligibilitySummary(BaseModel):
    member_id: str
    member_name: str
    relation: str
    eligible_schemes_count: int
    eligible_schemes: List[EligibilityResult]
    total_estimated_cash_annual: int = 0


class DeduplicatedHouseholdBenefit(BaseModel):
    scheme_id: str
    scheme_name_hi: str
    scheme_name_en: str
    category: str
    benefit_type: str
    benefit_amount_text: str
    claim_level: str  # "family_shared" or "individual_member"
    beneficiary_member_names: List[str]
    estimated_annual_value: int
    rationale_hi: str
    rationale_en: str


class HouseholdClaimResponse(BaseModel):
    family_name: str
    total_members: int
    total_schemes_unlocked: int
    total_annual_cash_value: int
    total_health_cover_value: int
    total_loan_credit_access: int
    members_breakdown: List[MemberEligibilitySummary]
    deduplicated_benefits: List[DeduplicatedHouseholdBenefit]
    recommended_claim_sequence: List[str]


def _extract_approx_annual_value(scheme_id: str, benefit_amount_text: str, benefit_type: str) -> int:
    """Estimates the approximate numeric annual value for financial aggregation."""
    s_id = scheme_id.lower()
    
    if "pm-kisan" in s_id:
        return 6000
    if "ladli-behna" in s_id:
        return 15000  # ₹1,250 x 12
    if "ayushman" in s_id or "pmjay" in s_id:
        return 500000  # Health cover
    if "pm-vishwakarma" in s_id:
        return 315000  # ₹3L collateral free loan + ₹15k toolkit
    if "pmsvanidhi" in s_id or "pm-svanidhi" in s_id:
        return 50000  # Working capital loan
    if "mudra" in s_id:
        return 100000
    if "scholarship" in s_id or "nsp" in s_id or "post-matric" in s_id:
        return 25000
    if "pension" in s_id or "atal" in s_id or "nsap" in s_id:
        return 12000  # ₹1,000/month avg
    if "pmay" in s_id or "awas" in s_id:
        return 120000
    if "ration" in s_id or "nfsa" in s_id or "pmgkay" in s_id:
        return 18000  # Subsidized/free food grains approx value for family

    # Fallback regex search for numbers
    nums = re.findall(r"\d[\d,]*", benefit_amount_text)
    if nums:
        cleaned = nums[0].replace(",", "")
        try:
            return int(cleaned)
        except:
            pass
    return 5000


@router.post("/evaluate", response_model=HouseholdClaimResponse)
def evaluate_household_claim(payload: HouseholdClaimRequest):
    """
    Simultaneously evaluates every member in the household, deduplicates family-capped schemes,
    and returns a consolidated multi-member roadmap with total household value.
    """
    all_schemes = scheme_service.get_all()
    
    members_breakdown: List[MemberEligibilitySummary] = []
    
    # Track scheme_id -> list of (member, EligibilityResult)
    scheme_to_qualifying_members: Dict[str, List[tuple[FamilyMember, EligibilityResult]]] = {}

    total_annual_cash_value = 0
    total_health_cover_value = 0
    total_loan_credit_access = 0

    for mem in payload.members:
        mem_eligible: List[EligibilityResult] = []
        mem_cash = 0

        for scheme in all_schemes:
            eval_res = generate_eligibility_result(mem.profile, scheme)
            if eval_res.is_eligible:
                mem_eligible.append(eval_res)
                if scheme.id not in scheme_to_qualifying_members:
                    scheme_to_qualifying_members[scheme.id] = []
                scheme_to_qualifying_members[scheme.id].append((mem, eval_res, scheme))

                # If individual direct transfer, add to member cash
                if scheme.benefit_type == "direct_benefit_transfer":
                    val = _extract_approx_annual_value(scheme.id, scheme.benefit_amount_text, scheme.benefit_type)
                    mem_cash += val

        members_breakdown.append(
            MemberEligibilitySummary(
                member_id=mem.id,
                member_name=mem.name,
                relation=mem.relation,
                eligible_schemes_count=len(mem_eligible),
                eligible_schemes=mem_eligible,
                total_estimated_cash_annual=mem_cash,
            )
        )

    # Family-level schemes that cannot be claimed multiple times by the same household
    FAMILY_LEVEL_SCHEMES = {
        "ayushman-bharat-pmjay": "family_shared",
        "pm-awas-yojana-urban": "family_shared",
        "pm-awas-yojana-gramin": "family_shared",
        "ration-card-nfsa": "family_shared",
        "pmgkay-free-ration": "family_shared",
        "pm-ujjwala-yojana": "family_shared",
    }

    deduplicated_benefits: List[DeduplicatedHouseholdBenefit] = []
    seen_schemes = set()

    for scheme_id, matches in scheme_to_qualifying_members.items():
        if not matches:
            continue
        
        sample_scheme = matches[0][2]
        qualifying_names = [m[0].name for m in matches]
        val = _extract_approx_annual_value(sample_scheme.id, sample_scheme.benefit_amount_text, sample_scheme.benefit_type)
        
        is_family_shared = sample_scheme.id in FAMILY_LEVEL_SCHEMES or "family" in sample_scheme.short_summary_en.lower()

        if is_family_shared:
            claim_level = "family_shared"
            est_val = val  # Counted once for the whole family
            rationale_hi = f"यह योजना पूरे परिवार के लिए एक संयुक्त कार्ड/योजना के तहत लागू होती है ({', '.join(qualifying_names)} पात्र हैं)।"
            rationale_en = f"This scheme is capped at the household level. Any of {', '.join(qualifying_names)} can hold the primary card for the family."
        else:
            claim_level = "individual_member"
            # Multiplied by number of eligible members!
            est_val = val * len(matches)
            rationale_hi = f"परिवार के {len(matches)} सदस्य ({', '.join(qualifying_names)}) अलग-अलग स्वतंत्र रूप से इस लाभ का दावा कर सकते हैं।"
            rationale_en = f"{len(matches)} family member(s) ({', '.join(qualifying_names)}) can independently claim this benefit simultaneously."

        # Aggregate category financial pools
        if sample_scheme.benefit_type == "direct_benefit_transfer" or sample_scheme.benefit_type == "scholarship":
            total_annual_cash_value += est_val
        elif sample_scheme.benefit_type == "health_insurance":
            total_health_cover_value += est_val
        elif sample_scheme.benefit_type == "loan_subsidy":
            total_loan_credit_access += est_val
        else:
            total_annual_cash_value += est_val

        deduplicated_benefits.append(
            DeduplicatedHouseholdBenefit(
                scheme_id=sample_scheme.id,
                scheme_name_hi=sample_scheme.name_hi,
                scheme_name_en=sample_scheme.name_en,
                category=sample_scheme.category,
                benefit_type=sample_scheme.benefit_type,
                benefit_amount_text=sample_scheme.benefit_amount_text,
                claim_level=claim_level,
                beneficiary_member_names=qualifying_names,
                estimated_annual_value=est_val,
                rationale_hi=rationale_hi,
                rationale_en=rationale_en,
            )
        )
        seen_schemes.add(scheme_id)

    # Sort deduplicated benefits by estimated annual value descending
    deduplicated_benefits.sort(key=lambda x: x.estimated_annual_value, reverse=True)

    # Generate claim sequence recommendations
    claim_seq: List[str] = [
        "1. Immediate Cash & Direct Transfers (e.g. PM-KISAN, Ladli Behna, Scholarships) - zero cost, high return",
        "2. Household Health Shield (Ayushman Bharat PM-JAY) - covers all family members up to ₹5,00,000",
        "3. Livelihood & Business Loans (PM Vishwakarma, PM SVANidhi) - collateral-free capital for working members",
    ]

    return HouseholdClaimResponse(
        family_name=payload.family_name or "Household",
        total_members=len(payload.members),
        total_schemes_unlocked=len(deduplicated_benefits),
        total_annual_cash_value=total_annual_cash_value,
        total_health_cover_value=total_health_cover_value,
        total_loan_credit_access=total_loan_credit_access,
        members_breakdown=members_breakdown,
        deduplicated_benefits=deduplicated_benefits,
        recommended_claim_sequence=claim_seq,
    )
