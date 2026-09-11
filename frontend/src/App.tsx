import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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
import { Scheme, CitizenProfile } from "@/types/schema";
import { api } from "@/services/api";

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

const MainContent: React.FC = () => {
  const { setIsAssistantOpen } = useApp();
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState("home");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedCategoryFilter] = useState<string>("all");
  const [wizardInitialProfile, setWizardInitialProfile] = useState<Partial<CitizenProfile> | undefined>(undefined);

  // Handle scheme selection: opens dedicated SchemeDetailPage
  const handleOpenSchemeDetail = async (schemeId: string) => {
    try {
      const scheme = await api.getSchemeById(schemeId);
      setSelectedScheme(scheme);
    } catch {
      if (schemeId === SAMPLE_SCHEME.id) {
        setSelectedScheme(SAMPLE_SCHEME);
      }
    }
    setCurrentView("scheme_detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (_query: string) => {
    setCurrentView("schemes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // When clicking Get Started: redirect to Login if not logged in, otherwise open Wizard
  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setCurrentView("login");
    } else {
      setCurrentView("wizard");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200 overflow-x-hidden">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      {currentView === "login" ? (
        <main id="main-content" className="flex-1">
          <LoginPage
            onSuccess={() => {
              setCurrentView("wizard");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onBackToHome={() => {
              setCurrentView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </main>
      ) : currentView === "wizard" ? (
        <main id="main-content" className="flex-1 py-8 bg-muted/20">
          <WizardContainer
            initialData={wizardInitialProfile}
            onSubmit={(_profile) => {}}
            onCancel={() => {
              setWizardInitialProfile(undefined);
              setCurrentView("home");
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
          />
        </main>
      ) : currentView === "scheme_detail" ? (
        <main id="main-content" className="flex-1">
          <SchemeDetailPage
            scheme={selectedScheme || SAMPLE_SCHEME}
            onBack={() => setCurrentView("schemes")}
            onCheckEligibility={handleGetStarted}
            onLocateCsc={() => {
              setCurrentView("csc");
              window.scrollTo({ top: 0, behavior: "smooth" });
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
      ) : (
        <main id="main-content" className="flex-1">
          <HeroSection
            onStartWizard={handleGetStarted}
            onExploreSchemes={() => setCurrentView("schemes")}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onSearch={handleSearch}
            onSelectScheme={handleOpenSchemeDetail}
          />
        </main>
      )}

      {/* Global Floating AI Assistant & Slide-over Drawer */}
      <SetuSahayakDrawer
        onStartWizard={(prefillProfile) => {
          if (prefillProfile) {
            setWizardInitialProfile(prefillProfile);
          }
          setCurrentView("wizard");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onExploreSchemes={() => {
          setCurrentView("schemes");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onViewSchemeDetail={handleOpenSchemeDetail}
        onLocateCsc={() => {
          setCurrentView("csc");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Footer is only displayed on non-landing views */}
      {currentView !== "home" && <Footer />}

      {/* Global Citizen Authentication Modal (Sign In / Register) */}
      <AuthModal />
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
