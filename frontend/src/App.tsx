import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TrendingSchemes } from "@/components/home/TrendingSchemes";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AuthModal } from "@/components/auth/AuthModal";
import { LoginPage } from "@/components/auth/LoginPage";
import { WizardContainer } from "@/components/wizard/WizardContainer";
import { SchemesExplorePage } from "@/components/schemes/SchemesExplorePage";
import { SchemeDetailPage } from "@/components/schemes/SchemeDetailPage";
import { SetuSahayakDrawer } from "@/components/assistant/SetuSahayakDrawer";
import { CscLocator } from "@/components/csc/CscLocator";
import { Scheme, CitizenProfile } from "@/types/schema";
import { api } from "@/services/api";
import { ALL_SCHEMES } from "@/services/ruleEngine";

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
  const { setIsAssistantOpen, language } = useApp();
  const isHindi = language === "hi";
  const [currentView, setCurrentView] = useState("home");
  const [previousView, setPreviousView] = useState<string>("schemes");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wizardInitialProfile, setWizardInitialProfile] = useState<Partial<CitizenProfile> | undefined>(undefined);

  // Handle scheme selection: opens dedicated SchemeDetailPage
  const handleOpenSchemeDetail = async (schemeId: string) => {
    try {
      const scheme = await api.getSchemeById(schemeId);
      setSelectedScheme(scheme);
    } catch {
      const found =
        ALL_SCHEMES.find((s) => s.id === schemeId) ||
        ALL_SCHEMES.find(
          (s) =>
            s.id.toLowerCase().includes(schemeId.toLowerCase()) ||
            schemeId.toLowerCase().includes(s.id.toLowerCase())
        );
      if (found) {
        setSelectedScheme(found);
      } else if (schemeId === SAMPLE_SCHEME.id) {
        setSelectedScheme(SAMPLE_SCHEME);
      }
    }
    setPreviousView(currentView);
    setCurrentView("scheme_detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView("schemes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle category card click from CategoryGrid: sets category filter and navigates to explore page
  const handleSelectCategory = (categoryId: string) => {
    const categoryMapping: Record<string, string> = {
      agriculture: "agriculture",
      education_scholarships: "education",
      healthcare: "health",
      women_child: "women_child",
      housing_urban: "housing",
      business_msme_loans: "others",
      skills_employment: "employment",
      social_security_pensions: "social_security",
    };
    setSelectedCategoryFilter(categoryMapping[categoryId] || categoryId);
    setCurrentView("schemes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // When clicking Get Started: directly open Wizard for 100% friction-free citizen access
  const handleGetStarted = () => {
    setCurrentView("wizard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200 overflow-x-hidden">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      {currentView === "login" || currentView === "register" ? (
        <main id="main-content" className="flex-1 bg-[#FEFEFD]">
          <LoginPage
            initialMode={currentView === "register" ? "register" : "login"}
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
        <main id="main-content" className="flex-1 bg-[#F8FAF9]">
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
            initialSearch={searchQuery}
          />
        </main>
      ) : currentView === "scheme_detail" ? (
        <main id="main-content" className="flex-1">
          <SchemeDetailPage
            scheme={selectedScheme || SAMPLE_SCHEME}
            onBack={() => {
              setCurrentView(previousView === "wizard" ? "wizard" : "schemes");
              window.scrollTo({ top: 0, behavior: "smooth" });
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
            onExploreSchemes={() => {
              setSelectedCategoryFilter("all");
              setCurrentView("schemes");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onSearch={handleSearch}
            onSelectScheme={handleOpenSchemeDetail}
          />

          {/* 8 Welfare Categories Grid */}
          <CategoryGrid onSelectCategory={handleSelectCategory} />

          {/* Trending & Flagship Schemes Showcase */}
          <TrendingSchemes
            onViewDetails={handleOpenSchemeDetail}
            onExploreAll={() => {
              setSelectedCategoryFilter("all");
              setCurrentView("schemes");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          {/* 3-Step "How YojanaSetu Works" Process */}
          <HowItWorks onStartWizard={handleGetStarted} />
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
