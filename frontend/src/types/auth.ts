/**
 * Authentication and User Profile Types
 */

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  state?: string;
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
