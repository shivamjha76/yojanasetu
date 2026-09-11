/**
 * YojanaSetu Resilient API Client Service
 * Connects frontend to FastAPI backend REST endpoints when available,
 * with instantaneous 100% offline client-side fallback using bundled datasets
 * and deterministic mathematical rule evaluation.
 */

import { Scheme, CitizenProfile, EligibilityResult, CscCenter } from "@/types/schema";
import { User, AuthResponse, LoginCredentials, RegisterData, SavedSchemesResponse } from "@/types/auth";
import { ALL_SCHEMES, evaluateAllSchemes } from "./ruleEngine";

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

const CATEGORY_MAP: Record<string, { name_en: string; name_hi: string; icon: string; color: string }> = {
  agriculture: { name_en: "Agriculture & Farming", name_hi: "कृषि एवं किसान कल्याण", icon: "Wheat", color: "emerald" },
  healthcare: { name_en: "Healthcare & Wellness", name_hi: "स्वास्थ्य एवं चिकित्सा", icon: "HeartPulse", color: "rose" },
  education_scholarships: { name_en: "Education & Scholarships", name_hi: "शिक्षा एवं छात्रवृत्ति", icon: "GraduationCap", color: "blue" },
  women_child: { name_en: "Women & Child Care", name_hi: "महिला एवं बाल विकास", icon: "Users", color: "pink" },
  housing_urban: { name_en: "Housing & Shelter", name_hi: "आवास एवं बुनियादी सुविधाएं", icon: "Home", color: "amber" },
  business_msme_loans: { name_en: "Business & MSME Loans", name_hi: "व्यापार एवं मुद्रा लोन", icon: "Briefcase", color: "indigo" },
  skills_employment: { name_en: "Skills & Employment", name_hi: "कौशल विकास एवं रोजगार", icon: "Wrench", color: "cyan" },
  social_security_pensions: { name_en: "Social Security & Pensions", name_hi: "सामाजिक सुरक्षा व पेंशन", icon: "Shield", color: "purple" },
};

const LOCAL_STORAGE_SAVED_KEY = "yojanasetu_offline_saved_schemes";
const LOCAL_STORAGE_USER_KEY = "yojanasetu_offline_user";

function getLocalSavedSchemes(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSavedSchemes(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/** Determines if backend API call should be attempted or immediately bypassed */
function canUseBackend(): boolean {
  if (typeof window === "undefined") return true;
  // If frontend is HTTPS but backend is HTTP (e.g. unconfigured Vercel pointing to localhost),
  // browser blocks it immediately as mixed content.
  if (window.location.protocol === "https:" && API_BASE_URL.startsWith("http://")) {
    return false;
  }
  return true;
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
    if (canUseBackend()) {
      try {
        const query = new URLSearchParams();
        if (params?.q) query.append("q", params.q);
        if (params?.category) query.append("category", params.category);
        if (params?.state) query.append("state", params.state);
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.offset) query.append("offset", params.offset.toString());

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const res = await fetch(`${API_BASE_URL}/schemes?${query.toString()}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Backend unreachable -> graceful fallback to bundled dataset
      }
    }

    // Client-side filtering
    let results = [...ALL_SCHEMES];

    if (params?.category && params.category !== "all") {
      results = results.filter((s) => s.category === params.category);
    }

    if (params?.state && params.state !== "all") {
      results = results.filter(
        (s) => !s.applicable_state || s.applicable_state.toLowerCase() === params.state?.toLowerCase()
      );
    }

    if (params?.q && params.q.trim()) {
      const q = params.q.toLowerCase().trim();
      results = results.filter(
        (s) =>
          s.name_hi.toLowerCase().includes(q) ||
          s.name_en.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          s.benefit_amount_text.toLowerCase().includes(q) ||
          s.short_summary_hi.toLowerCase().includes(q) ||
          s.short_summary_en.toLowerCase().includes(q)
      );
    }

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    const paginated = results.slice(offset, offset + limit);

    return {
      total: results.length,
      limit,
      offset,
      schemes: paginated,
    };
  },

  /** Fetch single scheme detail by slug ID */
  async getSchemeById(id: string): Promise<Scheme> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/schemes/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
    }

    const found = ALL_SCHEMES.find((s) => s.id === id);
    if (found) return found;

    throw new Error(`Scheme '${id}' not found`);
  },

  /** Fetch category metadata list with counts and icons */
  async getCategories(): Promise<{ total_categories: number; categories: CategoryMetadata[] }> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/metadata/categories`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    // Build categories dynamically from bundled schemes
    const counts: Record<string, number> = {};
    for (const s of ALL_SCHEMES) {
      counts[s.category] = (counts[s.category] || 0) + 1;
    }

    const categories: CategoryMetadata[] = Object.keys(CATEGORY_MAP).map((catId) => ({
      id: catId,
      name_en: CATEGORY_MAP[catId].name_en,
      name_hi: CATEGORY_MAP[catId].name_hi,
      icon: CATEGORY_MAP[catId].icon,
      color: CATEGORY_MAP[catId].color,
      scheme_count: counts[catId] || 0,
    }));

    return {
      total_categories: categories.length,
      categories,
    };
  },

  /** Fetch all Indian states and UTs */
  async getStates(): Promise<{ total_states: number; states: Array<{ name: string; has_state_schemes: boolean }> }> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/metadata/states`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    const stateSchemesStates = new Set(
      ALL_SCHEMES.filter((s) => s.level === "state" && s.applicable_state).map((s) => s.applicable_state!)
    );

    const standardStates = [
      "All India",
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
      "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
      "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
      "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    ];

    return {
      total_states: standardStates.length,
      states: standardStates.map((st) => ({
        name: st,
        has_state_schemes: stateSchemesStates.has(st),
      })),
    };
  },

  /** Fetch standard occupations list */
  async getOccupations(): Promise<{ total_occupations: number; occupations: Array<{ id: string; name_en: string; name_hi: string; icon: string }> }> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/metadata/occupations`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    const occupations = [
      { id: "farmer", name_en: "Farmer / Agriculture", name_hi: "किसान / कृषि", icon: "Wheat" },
      { id: "student", name_en: "Student", name_hi: "विद्यार्थी / छात्र", icon: "GraduationCap" },
      { id: "daily_wage_laborer", name_en: "Daily Wage Laborer / Worker", name_hi: "दैनिक वेतनभोगी / मजदूर", icon: "Hammer" },
      { id: "business_self_employed", name_en: "Self Employed / Small Business", name_hi: "स्वरोजगार / छोटा व्यवसाय", icon: "Store" },
      { id: "homemaker", name_en: "Homemaker", name_hi: "गृहिणी", icon: "Home" },
      { id: "employed_private", name_en: "Private Sector Employee", name_hi: "निजी क्षेत्र कर्मचारी", icon: "Briefcase" },
      { id: "employed_government", name_en: "Government Employee", name_hi: "सरकारी कर्मचारी", icon: "Landmark" },
      { id: "artisan_craftsperson", name_en: "Artisan / Craftsperson", name_hi: "कारीगर / शिल्पकार", icon: "Palette" },
      { id: "unemployed", name_en: "Unemployed (Job Seeker)", name_hi: "बेरोजगार (रोजगार तलाश रहे)", icon: "Search" },
      { id: "other", name_en: "Other", name_hi: "अन्य", icon: "MoreHorizontal" },
    ];

    return {
      total_occupations: occupations.length,
      occupations,
    };
  },

  /** Run deterministic eligibility evaluation */
  async checkEligibility(
    profile: CitizenProfile,
    includeIneligible = true
  ): Promise<EligibilityResponse> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(
          `${API_BASE_URL}/eligibility/check?include_ineligible=${includeIneligible}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Fallback to client-side deterministic evaluation
      }
    }

    return evaluateAllSchemes(profile, includeIneligible);
  },

  /** Extract structured profile from natural language voice/text */
  async extractProfile(userInput: string) {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE_URL}/assistant/extract-profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_input: userInput }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Offline heuristic parser
      }
    }

    const lower = userInput.toLowerCase();
    const extracted: Partial<CitizenProfile> = {};

    // Extract age
    const ageMatch = lower.match(/(?:age|umar|aayu|saal|साल|उम्र|आयु)\s*(?:is|=|:|hai|h)?\s*(\d{1,2})/) ||
                     lower.match(/(\d{1,2})\s*(?:saal|year|वर्ष|साल)/);
    if (ageMatch) extracted.age = parseInt(ageMatch[1], 10);

    // Extract gender
    if (lower.includes("female") || lower.includes("mahila") || lower.includes("aurat") || lower.includes("महिला") || lower.includes("लड़की")) {
      extracted.gender = "female";
    } else if (lower.includes("male") || lower.includes("purush") || lower.includes("पुरुष") || lower.includes("लड़का") || lower.includes("aadmi")) {
      extracted.gender = "male";
    }

    // Extract occupation
    if (lower.includes("kisan") || lower.includes("farmer") || lower.includes("kheti") || lower.includes("किसान")) {
      extracted.occupation = "farmer";
    } else if (lower.includes("student") || lower.includes("padhai") || lower.includes("chhatra") || lower.includes("छात्र")) {
      extracted.occupation = "student";
    } else if (lower.includes("housewife") || lower.includes("homemaker") || lower.includes("grihini") || lower.includes("गृहिणी")) {
      extracted.occupation = "homemaker";
    } else if (lower.includes("vendor") || lower.includes("thela") || lower.includes("mazdoor") || lower.includes("मजदूर")) {
      extracted.occupation = "daily_wage_laborer";
    } else if (lower.includes("business") || lower.includes("dukaan") || lower.includes("vyapar") || lower.includes("व्यापार")) {
      extracted.occupation = "business_self_employed";
    }

    // Extract state
    const states = ["Madhya Pradesh", "Uttar Pradesh", "Rajasthan", "Bihar", "Maharashtra", "Delhi", "Gujarat"];
    for (const st of states) {
      if (lower.includes(st.toLowerCase()) || (st === "Madhya Pradesh" && lower.includes("mp")) || (st === "Uttar Pradesh" && lower.includes("up"))) {
        extracted.state = st;
        break;
      }
    }

    // Extract income
    const incMatch = lower.match(/(?:income|aamdani|aay|आय|आमदनी)\s*(?:is|=|:|hai)?\s*(?:rs\.?|₹)?\s*(\d+[\d,]*)/);
    if (incMatch) {
      extracted.annual_income = parseInt(incMatch[1].replace(/,/g, ""), 10);
    } else if (lower.includes("lakh") || lower.includes("लाख")) {
      const lMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|लाख)/);
      if (lMatch) extracted.annual_income = parseFloat(lMatch[1]) * 100000;
    }

    return {
      extracted_profile: extracted,
      profile: extracted,
    };
  },

  /** Answer citizen questions grounded in verified scheme facts */
  async explainScheme(schemeId: string, userQuestion: string, language = "hi") {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE_URL}/assistant/explain-scheme`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheme_id: schemeId,
            user_question: userQuestion,
            language,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    const scheme = ALL_SCHEMES.find((s) => s.id === schemeId);
    if (scheme) {
      const isHi = language === "hi";
      return {
        answer: isHi
          ? `${scheme.name_hi}: यह योजना ${scheme.benefit_amount_text} का लाभ प्रदान करती है। ${scheme.short_summary_hi}`
          : `${scheme.name_en}: Provides ${scheme.benefit_amount_text}. ${scheme.short_summary_en}`,
        citations: [scheme.official_portal_url],
      };
    }

    return {
      answer: "योजनासेतु पर 15+ केंद्रीय और राज्य सरकारी योजनाओं की सटीक जानकारी और पात्रता उपलब्ध है।",
      citations: [],
    };
  },

  /** Search or retrieve CSC Jan Seva Kendras */
  async getCscCenters(params?: {
    pincode?: string;
    state?: string;
    district?: string;
    service?: string;
    q?: string;
  }): Promise<{ total: number; centers: CscCenter[] }> {
    if (canUseBackend()) {
      try {
        const query = new URLSearchParams();
        if (params?.pincode) query.append("pincode", params.pincode);
        if (params?.state) query.append("state", params.state);
        if (params?.district) query.append("district", params.district);
        if (params?.service) query.append("service", params.service);
        if (params?.q) query.append("q", params.q);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/csc/search?${query.toString()}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Handled by component fallback
      }
    }

    return { total: 0, centers: [] };
  },

  // ========================================================
  // Authentication & Citizen Account Endpoints
  // ========================================================

  /** Register a new citizen account */
  async register(data: RegisterData): Promise<AuthResponse> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
        const err = await res.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(err.detail || "Registration failed");
      } catch (err: any) {
        if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
          throw err;
        }
      }
    }

    // Offline/Local mock registration
    const localUser: User = {
      id: `offline-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      state: data.state,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
    return {
      access_token: `offline-token-${Date.now()}`,
      token_type: "bearer",
      user: localUser,
    };
  },

  /** Citizen login */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
        const err = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(err.detail || "Invalid email or password");
      } catch (err: any) {
        if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
          throw err;
        }
      }
    }

    // Offline/Local mock login
    const localUser: User = {
      id: `offline-${Date.now()}`,
      email: credentials.email,
      full_name: credentials.email.split("@")[0] || "Citizen",
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
    return {
      access_token: `offline-token-${Date.now()}`,
      token_type: "bearer",
      user: localUser,
    };
  },

  /** Get profile of authenticated citizen */
  async getMe(token: string): Promise<User> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Fallback to locally stored user
      }
    }

    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    throw new Error("Session expired");
  },

  /** Update citizen profile */
  async updateProfile(token: string, data: Partial<User>): Promise<User> {
    if (canUseBackend()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    const updated = { ...existing, ...data };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  /** Get list of saved scheme IDs */
  async getSavedSchemes(token: string): Promise<SavedSchemesResponse> {
    if (canUseBackend()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/auth/saved-schemes`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    const ids = getLocalSavedSchemes();
    return {
      total: ids.length,
      scheme_ids: ids,
    };
  },

  /** Bookmark a scheme */
  async saveScheme(token: string, schemeId: string): Promise<{ success: boolean; saved: boolean }> {
    if (canUseBackend()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/saved-schemes/${encodeURIComponent(schemeId)}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    const ids = getLocalSavedSchemes();
    if (!ids.includes(schemeId)) {
      ids.push(schemeId);
      saveLocalSavedSchemes(ids);
    }
    return { success: true, saved: true };
  },

  /** Remove bookmark for a scheme */
  async removeSavedScheme(token: string, schemeId: string): Promise<{ success: boolean; removed: boolean }> {
    if (canUseBackend()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/saved-schemes/${encodeURIComponent(schemeId)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    let ids = getLocalSavedSchemes();
    ids = ids.filter((id) => id !== schemeId);
    saveLocalSavedSchemes(ids);
    return { success: true, removed: true };
  },
};
