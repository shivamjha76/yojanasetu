/**
 * YojanaSetu TypeScript Core Types & Interfaces
 * Matches 1-to-1 with backend Pydantic models
 */

// -------------------------------------------------------------
// 1. Citizen Profile
// -------------------------------------------------------------
export type Gender = 'male' | 'female' | 'transgender' | 'all';

export type AreaType = 'rural' | 'urban' | 'semi-urban';

export type Occupation =
  | 'student'
  | 'farmer'
  | 'unemployed'
  | 'employed_private'
  | 'employed_government'
  | 'business_self_employed'
  | 'homemaker'
  | 'daily_wage_laborer'
  | 'artisan_craftsperson'
  | 'other';

export type SocialCategory = 'general' | 'obc' | 'sc' | 'st' | 'ews';

export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';

export type RationCardType = 'antyodaya' | 'bpl' | 'apl' | 'none';

export interface CitizenProfile {
  age: number;
  gender: Gender;
  state: string;
  district?: string;
  area_type?: AreaType;
  occupation: Occupation;
  category: SocialCategory;
  annual_income: number;
  marital_status?: MaritalStatus;
  is_differently_abled: boolean;
  ration_card_type?: RationCardType;
  land_holding_acres?: number;
}

// -------------------------------------------------------------
// 2. Rule & Deterministic Evaluation Schema
// -------------------------------------------------------------
export type RuleOperator = '>=' | '<=' | '>' | '<' | '==' | '!=' | 'IN' | 'NOT_IN' | 'BETWEEN';

export interface Rule {
  field: string;
  operator: RuleOperator;
  value: any;
  description_hi?: string;
  description_en?: string;
}

// -------------------------------------------------------------
// 3. Document Requirement
// -------------------------------------------------------------
export interface DocumentRequirement {
  id: string;
  name_hi: string;
  name_en: string;
  is_mandatory: boolean;
  issuing_authority?: string;
  how_to_get_url?: string;
}

// -------------------------------------------------------------
// 4. FAQ Item
// -------------------------------------------------------------
export interface FAQItem {
  question_hi: string;
  question_en: string;
  answer_hi: string;
  answer_en: string;
}

// -------------------------------------------------------------
// 5. Scheme Specification
// -------------------------------------------------------------
export type SchemeCategory =
  | 'agriculture'
  | 'education_scholarships'
  | 'healthcare'
  | 'women_child'
  | 'housing_urban'
  | 'business_msme_loans'
  | 'social_security_pensions'
  | 'skills_employment';

export type BenefitType =
  | 'direct_benefit_transfer'
  | 'health_insurance'
  | 'loan_subsidy'
  | 'scholarship'
  | 'housing_grant'
  | 'in_kind_goods';

export interface Scheme {
  id: string;
  name_hi: string;
  name_en: string;
  short_summary_hi: string;
  short_summary_en: string;
  detailed_description_hi: string;
  detailed_description_en: string;
  ministry: string;
  level: 'central' | 'state';
  applicable_state?: string | null;
  category: SchemeCategory;
  benefit_amount_text: string;
  benefit_type: BenefitType;
  official_portal_url: string;
  processing_time_days?: number;
  processing_time_hi?: string;
  processing_time_en?: string;
  rules: Rule[];
  documents: DocumentRequirement[];
  application_steps_hi: string[];
  application_steps_en: string[];
  faqs: FAQItem[];
}

// -------------------------------------------------------------
// 6. Rule Match Evidence & Eligibility Result
// -------------------------------------------------------------
export interface RuleMatchEvidence {
  field: string;
  condition: string;
  user_value: any;
  matched: boolean;
  evidence_text_hi: string;
  evidence_text_en: string;
}

export interface EligibilityResult {
  scheme_id: string;
  scheme_name_hi: string;
  scheme_name_en: string;
  category: string;
  benefit_amount_text: string;
  benefit_type: string;
  official_portal_url: string;
  processing_time_days?: number;
  processing_time_hi?: string;
  processing_time_en?: string;
  is_eligible: boolean;
  match_percentage: number;
  matched_rules: RuleMatchEvidence[];
  failing_rules: RuleMatchEvidence[];
  ineligibility_reasons_hi?: string[];
  ineligibility_reasons_en?: string[];
  required_documents: DocumentRequirement[];
}

// -------------------------------------------------------------
// 7. CSC / Jan Seva Kendra Types
// -------------------------------------------------------------
export interface CscCenter {
  id: string;
  vle_name: string;
  center_name: string;
  csc_id: string;
  state: string;
  district: string;
  pincode: string;
  address: string;
  landmark?: string;
  phone: string;
  email?: string;
  timing: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  services: string[];
  distance?: string;
  is_open?: boolean;
  status_text?: string;
  map_x?: number;
  map_y?: number;
}
