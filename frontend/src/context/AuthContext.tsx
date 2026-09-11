import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, LoginCredentials, RegisterData } from "@/types/auth";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  savedSchemeIds: string[];
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  toggleSaveScheme: (schemeId: string) => Promise<boolean>;
  isSchemeSaved: (schemeId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "yojanasetu_auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);

  // Load user profile and saved schemes if token is present
  const loadUserData = useCallback(async (authToken: string) => {
    try {
      setIsLoading(true);
      const [profile, saved] = await Promise.all([
        api.getMe(authToken),
        api.getSavedSchemes(authToken).catch(() => ({ total: 0, scheme_ids: [] })),
      ]);
      setUser(profile);
      setSavedSchemeIds(saved.scheme_ids || []);
    } catch {
      // Token is invalid or expired
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setSavedSchemeIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadUserData(token);
    } else {
      setIsLoading(false);
    }
  }, [token, loadUserData]);

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (credentials: LoginCredentials) => {
    const res = await api.login(credentials);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    // Refresh saved schemes
    try {
      const saved = await api.getSavedSchemes(res.access_token);
      setSavedSchemeIds(saved.scheme_ids || []);
    } catch {
      setSavedSchemeIds([]);
    }
  };

  const register = async (data: RegisterData) => {
    const res = await api.register(data);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    setSavedSchemeIds([]);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setSavedSchemeIds([]);
  };

  const toggleSaveScheme = async (schemeId: string): Promise<boolean> => {
    if (!token) {
      openAuthModal("login");
      return false;
    }

    const isSaved = savedSchemeIds.includes(schemeId);
    if (isSaved) {
      await api.removeSavedScheme(token, schemeId);
      setSavedSchemeIds((prev) => prev.filter((id) => id !== schemeId));
      return false;
    } else {
      await api.saveScheme(token, schemeId);
      setSavedSchemeIds((prev) => [...prev, schemeId]);
      return true;
    }
  };

  const isSchemeSaved = (schemeId: string) => {
    return savedSchemeIds.includes(schemeId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        savedSchemeIds,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        toggleSaveScheme,
        isSchemeSaved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
