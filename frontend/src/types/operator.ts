import { CitizenProfile, EligibilityResult } from "./schema";

export type ApplicationStatus =
  | "documents_pending"
  | "ready_to_apply"
  | "submitted"
  | "verified"
  | "approved"
  | "rejected";

export interface CitizenApplication {
  id: string;
  citizen_id: string;
  scheme_id: string;
  scheme_name: string;
  benefit_amount?: string;
  status: ApplicationStatus;
  ref_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssistedCitizen {
  id: string;
  operator_id: string;
  full_name: string;
  phone?: string;
  village_ward?: string;
  district?: string;
  state?: string;
  profile_data: CitizenProfile;
  created_at: string;
  updated_at: string;
  application_count: number;
  eligible_count?: number;
}

export interface AssistedCitizenInput {
  full_name: string;
  phone?: string;
  village_ward?: string;
  district?: string;
  state?: string;
  profile: CitizenProfile;
  operator_id?: string;
}

export interface AssistedCitizenEligibility {
  citizen: AssistedCitizen;
  total_schemes_evaluated: number;
  eligible_schemes_count: number;
  eligible_schemes: EligibilityResult[];
  applications: CitizenApplication[];
}

export interface OperatorSummary {
  total_citizens: number;
  total_applications: number;
  status_counts: Record<ApplicationStatus, number>;
  districts_covered: string[];
}
