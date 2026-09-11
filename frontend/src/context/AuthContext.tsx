import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, LoginCredentials, RegisterData, FamilyMember, FamilyMemberInput } from "@/types/auth";
import { CitizenProfile } from "@/types/schema";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  savedSchemeIds: string[];
  familyMembers: FamilyMember[];
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  toggleSaveScheme: (schemeId: string) => Promise<boolean>;
  isSchemeSaved: (schemeId: string) => boolean;
  saveCitizenDetails: (details: Partial<CitizenProfile>) => Promise<void>;
  loadFamilyMembers: () => Promise<void>;
  addFamilyMember: (member: FamilyMemberInput) => Promise<FamilyMember>;
  updateFamilyMember: (id: string, member: Partial<FamilyMemberInput>) => Promise<FamilyMember>;
  deleteFamilyMember: (id: string) => Promise<void>;
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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Load user profile, saved schemes, and family members if token is present
  const loadUserData = useCallback(async (authToken: string) => {
    try {
      setIsLoading(true);
      const [profile, saved, members] = await Promise.all([
        api.getMe(authToken),
        api.getSavedSchemes(authToken).catch(() => ({ total: 0, scheme_ids: [] })),
        api.getFamilyMembers(authToken).catch(() => []),
      ]);
      setUser(profile);
      setSavedSchemeIds(saved.scheme_ids || []);
      setFamilyMembers(members || []);
    } catch {
      // Token is invalid or expired
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setSavedSchemeIds([]);
      setFamilyMembers([]);
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

    // Refresh saved schemes and family members
    try {
      const [saved, members] = await Promise.all([
        api.getSavedSchemes(res.access_token).catch(() => ({ total: 0, scheme_ids: [] })),
        api.getFamilyMembers(res.access_token).catch(() => []),
      ]);
      setSavedSchemeIds(saved.scheme_ids || []);
      setFamilyMembers(members || []);
    } catch {
      setSavedSchemeIds([]);
      setFamilyMembers([]);
    }

    // If citizen_details is missing or empty, check if draft profile exists to auto-attach
    if (!res.user.citizen_details || Object.keys(res.user.citizen_details).length === 0) {
      try {
        const draftRaw = localStorage.getItem("yojanasetu_draft_profile");
        if (draftRaw) {
          const draft = JSON.parse(draftRaw);
          if (draft && (draft.age || draft.occupation)) {
            const updated = await api.saveCitizenDetails(res.access_token, draft);
            setUser(updated);
          }
        }
      } catch {}
    }
  };

  const register = async (data: RegisterData) => {
    const res = await api.register(data);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    setSavedSchemeIds([]);
    setFamilyMembers([]);

    // If draft profile exists, auto-attach to newly registered citizen
    try {
      const draftRaw = localStorage.getItem("yojanasetu_draft_profile");
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (draft && (draft.age || draft.occupation)) {
          const updated = await api.saveCitizenDetails(res.access_token, draft);
          setUser(updated);
        }
      }
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    // Clear active session keys while leaving user account store in localStorage completely intact
    localStorage.removeItem("yojanasetu_offline_user");
    localStorage.removeItem("yojanasetu_offline_saved_schemes");
    localStorage.removeItem("yojanasetu_offline_family_members");
    setToken(null);
    setUser(null);
    setSavedSchemeIds([]);
    setFamilyMembers([]);
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

  const saveCitizenDetails = async (details: Partial<CitizenProfile>) => {
    if (!token) return;
    try {
      const updatedUser = await api.saveCitizenDetails(token, details);
      setUser(updatedUser);
    } catch (err) {
      console.error("Failed to save citizen details:", err);
    }
  };

  const loadFamilyMembers = async () => {
    if (!token) return;
    try {
      const members = await api.getFamilyMembers(token);
      setFamilyMembers(members || []);
    } catch (err) {
      console.error("Failed to load family members:", err);
    }
  };

  const addFamilyMember = async (member: FamilyMemberInput): Promise<FamilyMember> => {
    const authToken = token || "offline-token";
    const created = await api.addFamilyMember(authToken, member);
    setFamilyMembers((prev) => [...prev, created]);
    return created;
  };

  const updateFamilyMember = async (
    id: string,
    member: Partial<FamilyMemberInput>
  ): Promise<FamilyMember> => {
    const authToken = token || "offline-token";
    const updated = await api.updateFamilyMember(authToken, id, member);
    setFamilyMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const deleteFamilyMember = async (id: string): Promise<void> => {
    const authToken = token || "offline-token";
    await api.deleteFamilyMember(authToken, id);
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
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
        familyMembers,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        toggleSaveScheme,
        isSchemeSaved,
        saveCitizenDetails,
        loadFamilyMembers,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
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
