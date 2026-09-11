/**
 * YojanaSetu API Client Service
 * Connects frontend to FastAPI backend REST endpoints.
 */

import { Scheme, CitizenProfile, EligibilityResult } from "@/types/schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export interface SchemesResponse {
  total: number;
  limit: number;
  offset: number;
  schemes: Scheme[];
}

export interface CategoryMetadata {
  id: string;
  name_en: string;
  name_hi: string;
  icon: string;
  color: string;
  scheme_count: number;
}

export interface EligibilityResponse {
  total_schemes_evaluated: number;
  eligible_count: number;
  ineligible_count: number;
  eligible_schemes: EligibilityResult[];
  ineligible_schemes?: EligibilityResult[];
}

export const api = {
  /** Fetch all schemes with optional query, category, state filters */
  async getSchemes(params?: {
    q?: string;
    category?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }): Promise<SchemesResponse> {
    const query = new URLSearchParams();
    if (params?.q) query.append("q", params.q);
    if (params?.category) query.append("category", params.category);
    if (params?.state) query.append("state", params.state);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    const res = await fetch(`${API_BASE_URL}/schemes?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch schemes: ${res.statusText}`);
    return res.json();
  },

  /** Fetch single scheme detail by slug ID */
  async getSchemeById(id: string): Promise<Scheme> {
    const res = await fetch(`${API_BASE_URL}/schemes/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Scheme '${id}' not found`);
    return res.json();
  },

  /** Fetch category metadata list with counts and icons */
  async getCategories(): Promise<{ total_categories: number; categories: CategoryMetadata[] }> {
    const res = await fetch(`${API_BASE_URL}/metadata/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories metadata");
    return res.json();
  },

  /** Fetch all Indian states and UTs */
  async getStates(): Promise<{ total_states: number; states: Array<{ name: string; has_state_schemes: boolean }> }> {
    const res = await fetch(`${API_BASE_URL}/metadata/states`);
    if (!res.ok) throw new Error("Failed to fetch states metadata");
    return res.json();
  },

  /** Fetch standard occupations list */
  async getOccupations(): Promise<{ total_occupations: number; occupations: Array<{ id: string; name_en: string; name_hi: string; icon: string }> }> {
    const res = await fetch(`${API_BASE_URL}/metadata/occupations`);
    if (!res.ok) throw new Error("Failed to fetch occupations metadata");
    return res.json();
  },

  /** Run deterministic eligibility evaluation */
  async checkEligibility(
    profile: CitizenProfile,
    includeIneligible = true
  ): Promise<EligibilityResponse> {
    const res = await fetch(
      `${API_BASE_URL}/eligibility/check?include_ineligible=${includeIneligible}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      }
    );
    if (!res.ok) throw new Error(`Eligibility check failed: ${res.statusText}`);
    return res.json();
  },

  /** Extract structured profile from natural language voice/text */
  async extractProfile(userInput: string) {
    const res = await fetch(`${API_BASE_URL}/assistant/extract-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_input: userInput }),
    });
    if (!res.ok) throw new Error(`Profile extraction failed: ${res.statusText}`);
    return res.json();
  },

  /** Answer citizen questions grounded in verified scheme facts */
  async explainScheme(schemeId: string, userQuestion: string, language = "hi") {
    const res = await fetch(`${API_BASE_URL}/assistant/explain-scheme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheme_id: schemeId,
        user_question: userQuestion,
        language,
      }),
    });
    if (!res.ok) throw new Error(`Scheme explanation failed: ${res.statusText}`);
    return res.json();
  },
};
