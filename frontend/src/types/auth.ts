/**
 * Authentication and User Profile Types
 */

import { CitizenProfile } from "./schema";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  state?: string;
  citizen_details?: Partial<CitizenProfile> | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  state?: string;
}

export interface SavedSchemesResponse {
  total: number;
  scheme_ids: string[];
}

export type MemberRelationship =
  | "father"
  | "mother"
  | "brother"
  | "sister"
  | "spouse"
  | "son"
  | "daughter"
  | "uncle"
  | "aunt"
  | "grandfather"
  | "grandmother"
  | "friend"
  | "other";

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: MemberRelationship | string;
  age: number;
  gender: string;
  state?: string;
  district?: string;
  area_type?: string;
  occupation: string;
  category: string;
  annual_income: number;
  marital_status?: string;
  is_differently_abled: boolean;
  ration_card_type?: string;
  land_holding_acres?: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyMemberInput {
  name: string;
  relationship: MemberRelationship | string;
  age: number;
  gender: string;
  state?: string;
  district?: string;
  area_type?: string;
  occupation: string;
  category: string;
  annual_income: number;
  marital_status?: string;
  is_differently_abled?: boolean;
  ration_card_type?: string;
  land_holding_acres?: number;
}

