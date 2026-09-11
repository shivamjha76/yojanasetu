import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { AuthModal } from "@/components/auth/AuthModal";
import { LoginPage } from "@/components/auth/LoginPage";
import { WizardContainer } from "@/components/wizard/WizardContainer";
import { SchemesExplorePage } from "@/components/schemes/SchemesExplorePage";
import { SchemeDetailPage } from "@/components/schemes/SchemeDetailPage";
import { SetuSahayakDrawer } from "@/components/assistant/SetuSahayakDrawer";
import { CscLocator } from "@/components/csc/CscLocator";
import { AssistedDashboard } from "@/components/assisted/AssistedDashboard";
import { HouseholdClaimView } from "@/components/profile/HouseholdClaimView";
import { Scheme, CitizenProfile } from "@/types/schema";
import { api } from "@/services/api";
import { ALL_SCHEMES } from "@/services/ruleEngine";
import { WifiOff, X } from "lucide-react";

// Sample scheme for preview in component showcase
const SAMPLE_SCHEME: Scheme = {
  id: "pm-kisan",
  name_hi: "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
  name_en: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
  short_summary_hi: "देश के सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष की सीधी आर्थिक सहायता।",
  short_summary_en: "Direct income support of ₹6,000 per year in 3 equal installments to landholding farmer families.",
  detailed_description_hi: "पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता DBT के माध्यम से सीधे बैंक खाते में।",
  detailed_description_en: "PM-KISAN is a Central Sector Scheme providing financial assistance of ₹6,000 per year.",
  ministry: "Ministry of Agriculture & Farmers Welfare",
  level: "central",
  applicable_state: null,
  category: "agriculture",
  benefit_amount_text: "₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तें)",
  benefit_type: "direct_benefit_transfer",
  official_portal_url: "https://pmkisan.gov.in/",
  rules: [],
  documents: [
    {
      id: "aadhaar",
      name_hi: "आधार कार्ड (बैंक खाते से लिंक)",
      name_en: "Aadhaar Card (Linked with Bank)",
      is_mandatory: true,
      issuing_authority: "UIDAI",
      how_to_get_url: "https://myaadhaar.uidai.gov.in/",
    },
    {
      id: "land_record",
      name_hi: "जमीन के कागजात (खसरा/खतौनी)",
      name_en: "Land Ownership Record (Khatauni)",
      is_mandatory: true,
      issuing_authority: "राज्य राजस्व विभाग (State Revenue Dept)",
      how_to_get_url: "https://bhulekh.gov.in/",
    },
    {
      id: "bank_passbook",
      name_hi: "बैंक खाता पासबुक",
      name_en: "Bank Account Passbook",
      is_mandatory: true,
      issuing_authority: "Nationalized / Commercial Bank",
    },
  ],
  application_steps_hi: ["पोर्टल पर जाएं", "ई-केवाईसी करें"],
  application_steps_en: ["Visit portal", "Complete eKYC"],
  faqs: [],
};

// URL route helpers for refresh & browser history support
const getViewFromLocation = (): { view: string; schemeId?: string } => {
  if (typeof window === "undefined") return { view: "home" };

  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, "");

  // 1. Check scheme detail route: /scheme/:id or /schemes/:id (except /schemes)
  const schemeMatch = path.match(/^\/schemes?\/([a-z0-9\-_]+)$/);
  if (schemeMatch && schemeMatch[1] && schemeMatch[1] !== "explore") {
    return { view: "scheme_detail", schemeId: schemeMatch[1] };
  }

  // 2. Check query param: ?scheme=...
  try {
    const params = new URLSearchParams(window.location.search);
    const schemeParam = params.get("scheme");
    if (schemeParam) {
      return { view: "scheme_detail", schemeId: schemeParam };
    }
  } catch {}

  // 3. Match pathname directly
  if (path === "/schemes") return { view: "schemes" };
  if (path === "/csc") return { view: "csc" };
  if (path === "/assisted") return { view: "assisted" };
  if (path === "/household") return { view: "household" };
  if (path === "/wizard") return { view: "wizard" };
  if (path === "/login") return { view: "login" };
  if (path === "/register") return { view: "register" };

  // 4. Match hash if present
  if (hash === "schemes") return { view: "schemes" };
  if (hash === "csc") return { view: "csc" };
  if (hash === "assisted") return { view: "assisted" };
  if (hash === "household") return { view: "household" };
  if (hash === "wizard") return { view: "wizard" };
  if (hash === "login") return { view: "login" };
  if (hash === "register") return { view: "register" };

  // 5. Fallback: check sessionStorage
  try {
    const savedView = sessionStorage.getItem("yojanasetu_current_view");
    const savedSchemeId = sessionStorage.getItem("yojanasetu_selected_scheme_id");
    if (savedView && ["schemes", "csc", "assisted", "household", "wizard", "login", "register", "scheme_detail"].includes(savedView)) {
      if (savedView === "scheme_detail" && savedSchemeId) {
        return { view: "scheme_detail", schemeId: savedSchemeId };
      }
      return { view: savedView };
    }
  } catch {}

  return { view: "home" };
};

const getPathForView = (view: string, schemeId?: string): string => {
  switch (view) {
    case "schemes":
      return "/schemes";
    case "csc":
      return "/csc";
    case "assisted":
      return "/assisted";
    case "household":
      return "/household";
    case "wizard":
      return "/wizard";
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "scheme_detail":
      return schemeId ? `/scheme/${schemeId}` : "/schemes";
    case "home":
    default:
      return "/";
  }
};

const MainContent: React.FC = () => {
  const { setIsAssistantOpen, language, offlineToast, clearOfflineToast } = useApp();
  const isHindi = language === "hi";

  const initialRoute = useMemo(() => getViewFromLocation(), []);
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [previousView, setPreviousView] = useState<string>("schemes");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wizardInitialProfile, setWizardInitialProfile] = useState<Partial<CitizenProfile> | undefined>(undefined);

  // Helper to load scheme by id
  const loadSchemeById = useCallback(async (schemeId: string) => {
    try {
      const scheme = await api.getSchemeById(schemeId);
      if (scheme) {
        setSelectedScheme(scheme);
        sessionStorage.setItem("yojanasetu_selected_scheme_id", schemeId);
        return scheme;
      }
    } catch {
      // fallback to static schemes
    }

    const found =
      ALL_SCHEMES.find((s) => s.id === schemeId) ||
      ALL_SCHEMES.find(
        (s) =>
          s.id.toLowerCase().includes(schemeId.toLowerCase()) ||
          schemeId.toLowerCase().includes(s.id.toLowerCase())
      );
    if (found) {
      setSelectedScheme(found);
      sessionStorage.setItem("yojanasetu_selected_scheme_id", found.id);
      return found;
    } else if (schemeId === SAMPLE_SCHEME.id) {
      setSelectedScheme(SAMPLE_SCHEME);
      sessionStorage.setItem("yojanasetu_selected_scheme_id", SAMPLE_SCHEME.id);
      return SAMPLE_SCHEME;
    }
    return null;
  }, []);

  // Central navigation handler synchronizing state, URL path, history, and sessionStorage
  const navigateTo = useCallback(
    (view: string, schemeId?: string, replace = false) => {
      setCurrentView(view);
      if (schemeId) {
        loadSchemeById(schemeId);
      }
      try {
        sessionStorage.setItem("yojanasetu_current_view", view);
        if (schemeId) {
          sessionStorage.setItem("yojanasetu_selected_scheme_id", schemeId);
        }
      } catch {}

      const targetPath = getPathForView(view, schemeId);
      if (window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ view, schemeId }, "", targetPath);
        } else {
          window.history.pushState({ view, schemeId }, "", targetPath);
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [loadSchemeById]
  );

  // On mount: load scheme if on scheme_detail route, and sync URL
  useEffect(() => {
    if (initialRoute.schemeId) {
      loadSchemeById(initialRoute.schemeId);
    }
    const targetPath = getPathForView(initialRoute.view, initialRoute.schemeId);
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(
        { view: initialRoute.view, schemeId: initialRoute.schemeId },
        "",
        targetPath
      );
    }
  }, [initialRoute, loadSchemeById]);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const loc = getViewFromLocation();
      setCurrentView(loc.view);
      if (loc.schemeId) {
        loadSchemeById(loc.schemeId);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [loadSchemeById]);

  // Handle scheme selection: opens dedicated SchemeDetailPage
  const handleOpenSchemeDetail = async (schemeId: string) => {
    await loadSchemeById(schemeId);
    setPreviousView(currentView);
    navigateTo("scheme_detail", schemeId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigateTo("schemes");
  };

  // When clicking Get Started: directly open Wizard for 100% friction-free citizen access
  const handleGetStarted = () => {
    navigateTo("wizard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200 overflow-x-hidden">
      <Header currentView={currentView} onNavigate={navigateTo} />

      {currentView === "login" || currentView === "register" ? (
        <main id="main-content" className="flex-1 bg-[#FEFEFD]">
          <LoginPage
            initialMode={currentView === "register" ? "register" : "login"}
            onSuccess={() => {
              navigateTo("wizard");
            }}
            onBackToHome={() => {
              navigateTo("home");
            }}
          />
        </main>
      ) : currentView === "wizard" ? (
        <main id="main-content" className="flex-1 bg-[#F8FAF9]">
          <WizardContainer
            initialData={wizardInitialProfile}
            onSubmit={(_profile) => {}}
            onCancel={() => {
              setWizardInitialProfile(undefined);
              navigateTo("home");
            }}
            onViewSchemeDetail={handleOpenSchemeDetail}
          />
        </main>
      ) : currentView === "schemes" ? (
        <main id="main-content" className="flex-1">
          <SchemesExplorePage
            onSelectScheme={handleOpenSchemeDetail}
            onStartWizard={handleGetStarted}
            initialCategory={selectedCategoryFilter}
            initialSearch={searchQuery}
          />
        </main>
      ) : currentView === "scheme_detail" ? (
        <main id="main-content" className="flex-1">
          <SchemeDetailPage
            scheme={selectedScheme || SAMPLE_SCHEME}
            onBack={() => {
              const target = previousView === "wizard" ? "wizard" : "schemes";
              navigateTo(target);
            }}
            backLabel={
              previousView === "wizard"
                ? isHindi
                  ? "परिणाम पर वापस जाएं"
                  : "Back to Results"
                : isHindi
                ? "योजनाओं पर वापस जाएं"
                : "Back to Schemes"
            }
            onCheckEligibility={handleGetStarted}
            onLocateCsc={() => {
              navigateTo("csc");
            }}
          />
        </main>
      ) : currentView === "csc" ? (
        <main id="main-content" className="flex-1">
          <CscLocator
            onSelectScheme={handleOpenSchemeDetail}
            onCheckEligibility={handleGetStarted}
          />
        </main>
      ) : currentView === "assisted" ? (
        <main id="main-content" className="flex-1">
          <AssistedDashboard
            onSwitchToCitizenMode={() => navigateTo("home")}
            onViewSchemeDetail={handleOpenSchemeDetail}
          />
        </main>
      ) : currentView === "household" ? (
        <main id="main-content" className="flex-1">
          <HouseholdClaimView
            onBackToHome={() => navigateTo("home")}
            onViewSchemeDetail={handleOpenSchemeDetail}
          />
        </main>
      ) : (
        <main id="main-content" className="flex-1">
          <HeroSection
            onStartWizard={handleGetStarted}
            onExploreSchemes={() => {
              setSelectedCategoryFilter("all");
              navigateTo("schemes");
            }}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onSearch={handleSearch}
            onSelectScheme={handleOpenSchemeDetail}
          />
        </main>
      )}

      {/* Global Footer */}
      {currentView !== "login" && currentView !== "register" && <Footer />}

      {/* Global Floating AI Assistant & Slide-over Drawer */}
      <SetuSahayakDrawer
        onStartWizard={(prefillProfile) => {
          if (prefillProfile) {
            setWizardInitialProfile(prefillProfile);
          }
          navigateTo("wizard");
        }}
        onExploreSchemes={() => {
          navigateTo("schemes");
        }}
        onViewSchemeDetail={handleOpenSchemeDetail}
        onLocateCsc={() => {
          navigateTo("csc");
        }}
      />

      {/* Global Citizen Authentication Modal (Sign In / Register) */}
      <AuthModal />

      {/* Offline Mode Feature Toast Notification */}
      {offlineToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-gray-900/95 text-white backdrop-blur-md px-4 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <WifiOff className="w-4 h-4" />
          </div>
          <div className="flex-1 pr-1">
            <p className="font-semibold text-amber-300 text-xs uppercase tracking-wide mb-0.5">
              {isHindi ? "इंटरनेट कनेक्शन आवश्यक" : "Internet Connection Required"}
            </p>
            <p className="font-medium text-gray-200 leading-snug">{offlineToast}</p>
          </div>
          <button
            onClick={clearOfflineToast}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </AppProvider>
  );
};

export default App;
