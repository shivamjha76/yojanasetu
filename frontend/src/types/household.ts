/**
 * Household Combined Claim Types
 * Supports multi-member simultaneous evaluation, deduplication, and combined roadmaps.
 */

import { CitizenProfile, EligibilityResult } from "./schema";

export interface HouseholdMemberInput {
  id: string;
  name: string;
  relation: string;
  profile: CitizenProfile;
}

export interface HouseholdClaimRequest {
  family_name?: string;
  members: HouseholdMemberInput[];
}

export interface MemberEligibilitySummary {
  member_id: string;
  member_name: string;
  relation: string;
  eligible_schemes_count: number;
  eligible_schemes: EligibilityResult[];
  total_estimated_cash_annual: number;
}

export interface DeduplicatedHouseholdBenefit {
  scheme_id: string;
  scheme_name_hi: string;
  scheme_name_en: string;
  category: string;
  benefit_type: string;
  benefit_amount_text: string;
  claim_level: "family_shared" | "individual_member" | string;
  beneficiary_member_names: string[];
  estimated_annual_value: number;
  rationale_hi: string;
  rationale_en: string;
}

export interface HouseholdClaimResponse {
  family_name: string;
  total_members: number;
  total_schemes_unlocked: number;
  total_annual_cash_value: number;
  total_health_cover_value: number;
  total_loan_credit_access: number;
  members_breakdown: MemberEligibilitySummary[];
  deduplicated_benefits: DeduplicatedHouseholdBenefit[];
  recommended_claim_sequence: string[];
}
