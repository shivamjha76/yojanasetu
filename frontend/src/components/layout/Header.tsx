import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  Globe,
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  Users as UsersIcon,
  LogOut,
  Bookmark,
  Check,
  Sparkles,
  Building,
} from "lucide-react";
import { MyDetailsModal } from "../profile/MyDetailsModal";

interface HeaderProps {
  currentView?: string;
  onNavigate?: (view: string, schemeId?: string) => void;
}

// Top 5 additional Indian languages
const TOP_5_ADDITIONAL_LANGUAGES = [
  { code: "bn", name: "বাংলা", englishName: "Bengali" },
  { code: "mr", name: "मराठी", englishName: "Marathi" },
  { code: "te", name: "తెలుగు", englishName: "Telugu" },
  { code: "ta", name: "தமிழ்", englishName: "Tamil" },
  { code: "gu", name: "ગુજરાતી", englishName: "Gujarati" },
];

export const Header: React.FC<HeaderProps> = ({
  currentView = "home",
  onNavigate = () => {},
}) => {
  const { language, setLanguage, toggleLanguage } = useApp();
  const { user, isAuthenticated, logout, savedSchemeIds, familyMembers } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMyDetailsOpen, setIsMyDetailsOpen] = useState(false);
  const [myDetailsTab, setMyDetailsTab] = useState<"profile" | "members">("profile");
  const [showMoreLanguages, setShowMoreLanguages] = useState(false);
  const [selectedOtherLang, setSelectedOtherLang] = useState<string | null>(null);
  const [langToast, setLangToast] = useState<string | null>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    };
    if (isLangDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangDropdownOpen]);

  const isHindi = language === "hi";

  return (
    <header className="w-full bg-[#FEFEFD] border-b border-gray-100/80 sticky top-0 z-40">
      <div className="container mx-auto px-6 sm:px-12 max-w-7xl h-20 flex items-center justify-between">
        
        {/* ======================================================== */}
        {/* LEFT: YojanaSetu Brand Logo                              */}
        {/* ======================================================== */}
        <div
          onClick={() => onNavigate("home")}
          className="cursor-pointer flex items-center select-none group"
        >
          <img
            src="/images/logo_exact_transparent.png"
            alt="YojanaSetu - Government Benefits, Your Bridge"
            className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </div>

        {/* ======================================================== */}
        {/* CENTER: Navigation Links (Home, About, Contact)          */}
        {/* ======================================================== */}
        <nav className="hidden md:flex items-center space-x-9">
          <button
            onClick={() => onNavigate("home")}
            className={`relative py-1 text-[15px] transition-colors ${
              currentView === "home"
                ? "font-semibold text-[#1D5F49]"
                : "font-medium text-[#4B5563] hover:text-[#111827]"
            }`}
          >
            <span>{isHindi ? "होम" : "Home"}</span>
            {currentView === "home" && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-[#1D5F49] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate("schemes")}
            className={`relative py-1 text-[15px] transition-colors ${
              currentView === "schemes"
                ? "font-semibold text-[#1D5F49]"
                : "font-medium text-[#4B5563] hover:text-[#111827]"
            }`}
          >
            <span>{isHindi ? "योजनाएं (Schemes)" : "Schemes"}</span>
            {currentView === "schemes" && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-[#1D5F49] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate("csc")}
            className={`relative py-1 text-[15px] transition-colors ${
              currentView === "csc"
                ? "font-semibold text-[#1D5F49]"
                : "font-medium text-[#4B5563] hover:text-[#111827]"
            }`}
          >
            <span>{isHindi ? "सेवा केंद्र (CSC)" : "CSC Centers"}</span>
            {currentView === "csc" && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-[#1D5F49] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate("assisted")}
            className={`relative py-1 text-[15px] transition-colors flex items-center space-x-1.5 ${
              currentView === "assisted"
                ? "font-bold text-[#1D5F49]"
                : "font-medium text-[#4B5563] hover:text-[#111827]"
            }`}
          >
            <Building className="w-4 h-4 text-[#1D5F49]" />
            <span>{isHindi ? "सहायक मोड" : "Assisted Mode"}</span>
            {currentView === "assisted" && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-[#1D5F49] rounded-full" />
            )}
          </button>
        </nav>

        {/* ======================================================== */}
        {/* RIGHT: Language Dropdown + Get Started CTA Button        */}
        {/* ======================================================== */}
        <div className="hidden md:flex items-center space-x-3.5">
          {/* Language Selector Pill */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-gray-200/90 text-[13.5px] font-medium text-[#374151] hover:bg-gray-50 transition-colors bg-white shadow-2xs cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#6B7280] stroke-[1.75]" />
              <span>
                {selectedOtherLang
                  ? `English (${selectedOtherLang})`
                  : isHindi
                  ? "हिन्दी"
                  : "English"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#9CA3AF] stroke-[1.75] transition-transform duration-150 ${
                  isLangDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {isHindi ? "उपलब्ध भाषाएं" : "Available Languages"}
                </div>

                {/* English */}
                <button
                  onClick={() => {
                    setLanguage("en");
                    setSelectedOtherLang(null);
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer ${
                    language === "en" && !selectedOtherLang
                      ? "text-[#1D5F49] font-bold bg-[#1D5F49]/5"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>English</span>
                    <span className="text-[11px] text-gray-400 font-normal">(English)</span>
                  </div>
                  {language === "en" && !selectedOtherLang && (
                    <Check className="w-3.5 h-3.5 text-[#1D5F49] stroke-[2.5]" />
                  )}
                </button>

                {/* Hindi */}
                <button
                  onClick={() => {
                    setLanguage("hi");
                    setSelectedOtherLang(null);
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer ${
                    language === "hi"
                      ? "text-[#1D5F49] font-bold bg-[#1D5F49]/5"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>हिन्दी</span>
                    <span className="text-[11px] text-gray-400 font-normal">(Hindi)</span>
                  </div>
                  {language === "hi" && (
                    <Check className="w-3.5 h-3.5 text-[#1D5F49] stroke-[2.5]" />
                  )}
                </button>

                {/* Divider */}
                <div className="my-1.5 border-t border-gray-100" />

                {/* More Languages Accordion */}
                <div className="px-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreLanguages(!showMoreLanguages);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-[#1D5F49] bg-[#1D5F49]/5 hover:bg-[#1D5F49]/10 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1D5F49]" />
                      <span>
                        {isHindi ? "अन्य प्रमुख भारतीय भाषाएं (5)" : "More Indian Languages (5)"}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#1D5F49] transition-transform duration-200 ${
                        showMoreLanguages ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Top 5 Languages List */}
                  {showMoreLanguages && (
                    <div className="mt-1 space-y-0.5 pt-1">
                      <div className="px-1 py-1 text-[10.5px] text-gray-400">
                        {isHindi
                          ? "चुनने पर सामग्री English में रहेगी:"
                          : "Selecting defaults to English:"}
                      </div>
                      {TOP_5_ADDITIONAL_LANGUAGES.map((lang) => {
                        const isSelected = selectedOtherLang === lang.name;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              // As user requested: clicks default to English
                              setLanguage("en");
                              setSelectedOtherLang(lang.name);
                              setIsLangDropdownOpen(false);
                              setLangToast(
                                isHindi
                                  ? `${lang.name} (${lang.englishName}) सहायता जल्द आ रही है! अभी डिफ़ॉल्ट रूप से English सक्रिय है।`
                                  : `${lang.englishName} (${lang.name}) support coming soon! Defaulted to English for now.`
                              );
                              setTimeout(() => setLangToast(null), 4000);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group ${
                              isSelected ? "bg-emerald-50 text-[#1D5F49] font-bold" : "text-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-900">{lang.name}</span>
                              <span className="text-[11px] text-gray-400 font-normal">
                                ({lang.englishName})
                              </span>
                            </div>
                            <span className="text-[9.5px] px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-[#1D5F49] transition-colors">
                              {isSelected ? "Active (EN)" : "Default EN"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Authentication Action: User Profile Dropdown or Sign In */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-gray-200/90 text-xs font-semibold text-[#1D5F49] bg-white hover:bg-emerald-50/50 transition-colors shadow-2xs cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#1D5F49]/10 flex items-center justify-center text-[#1D5F49]">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span>{user.full_name.split(" ")[0]}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    {user.state && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#1D5F49]/10 text-[#1D5F49] text-[10px] font-semibold">
                        📍 {user.state}
                      </span>
                    )}
                  </div>
                  
                  {/* My Details Link */}
                  <button
                    onClick={() => {
                      setMyDetailsTab("profile");
                      setIsUserDropdownOpen(false);
                      setIsMyDetailsOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-[#1D5F49]" />
                      <span>{isHindi ? "मेरे विवरण (My Details)" : "My Details"}</span>
                    </span>
                    {user.citizen_details &&
                    Object.keys(user.citizen_details).length > 0 &&
                    (user.citizen_details.age !== undefined ||
                      user.citizen_details.occupation !== undefined ||
                      user.citizen_details.state !== undefined) ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                        {isHindi ? "सहेजे गए" : "Saved"}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">
                        {isHindi ? "भरें" : "New"}
                      </span>
                    )}
                  </button>

                  {/* Add Members Link */}
                  <button
                    onClick={() => {
                      setMyDetailsTab("members");
                      setIsUserDropdownOpen(false);
                      setIsMyDetailsOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <UsersIcon className="w-3.5 h-3.5 text-[#1D5F49]" />
                      <span>{isHindi ? "परिवार एवं सदस्य (Add Members)" : "Add Members"}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                      {familyMembers.length > 0 ? `${familyMembers.length} ${isHindi ? "सदस्य" : "members"}` : (isHindi ? "जोड़ें" : "Add")}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onNavigate("schemes");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-[#1D5F49]" />
                      <span>{isHindi ? "सहेजी गई योजनाएं" : "Saved Schemes"}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                      {savedSchemeIds.length}
                    </span>
                  </button>

                  <div className="pt-1 mt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isHindi ? "लॉग आउट" : "Sign Out"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate("login")}
              className="text-[13.5px] font-semibold text-[#1D5F49] hover:text-[#174E3C] px-3.5 py-2 rounded-xl hover:bg-[#1D5F49]/5 transition-colors cursor-pointer"
            >
              {isHindi ? "लॉग इन" : "Sign In"}
            </button>
          )}

          {/* Primary CTA Button: Get Started (Shown ONLY on Landing Page) */}
          {currentView === "home" && (
            <button
              onClick={() => onNavigate("wizard")}
              className="bg-[#1D5F49] hover:bg-[#174E3C] text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
            >
              {isHindi ? "शुरू करें" : "Get Started"}
            </button>
          )}
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={() => {
              setSelectedOtherLang(null);
              toggleLanguage();
            }}
            className="px-2.5 py-1 text-xs font-bold border border-gray-200 rounded-lg text-[#1D5F49]"
          >
            {isHindi ? "EN" : "HI"}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-black"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-[#FEFEFD] px-6 py-4 space-y-3">
          {isAuthenticated && user && (
            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">{user.full_name}</p>
                  <p className="text-[11px] text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-semibold cursor-pointer"
                >
                  {isHindi ? "लॉग आउट" : "Sign Out"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
                <button
                  onClick={() => {
                    setMyDetailsTab("profile");
                    setIsMobileMenuOpen(false);
                    setIsMyDetailsOpen(true);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#1D5F49]" />
                  <span>{isHindi ? "मेरे विवरण" : "My Details"}</span>
                </button>

                <button
                  onClick={() => {
                    setMyDetailsTab("members");
                    setIsMobileMenuOpen(false);
                    setIsMyDetailsOpen(true);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#0D684E] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UsersIcon className="w-3.5 h-3.5 text-[#0D684E]" />
                  <span>{isHindi ? "सदस्य जोड़ें" : "Add Members"}</span>
                  {familyMembers.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#0D684E] text-white text-[10px] flex items-center justify-center">
                      {familyMembers.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Mobile Language Selector */}
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#1D5F49]" />
                {isHindi ? "भाषा चुनें" : "Select Language"}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                {selectedOtherLang ? `English (${selectedOtherLang})` : (isHindi ? "हिन्दी" : "English")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setLanguage("en");
                  setSelectedOtherLang(null);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  language === "en" && !selectedOtherLang
                    ? "bg-[#1D5F49] text-white border-[#1D5F49] shadow-2xs"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  setLanguage("hi");
                  setSelectedOtherLang(null);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  language === "hi"
                    ? "bg-[#1D5F49] text-white border-[#1D5F49] shadow-2xs"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                हिन्दी
              </button>
            </div>
            <button
              onClick={() => setShowMoreLanguages(!showMoreLanguages)}
              className="w-full text-center text-xs font-semibold text-[#1D5F49] pt-1 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>
                {showMoreLanguages
                  ? isHindi
                    ? "कम भाषाएं दिखाएं"
                    : "Show Less"
                  : isHindi
                  ? "+ और भाषाएं (Top 5)"
                  : "+ More Languages (Top 5)"}
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showMoreLanguages ? "rotate-180" : ""}`}
              />
            </button>
            {showMoreLanguages && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {TOP_5_ADDITIONAL_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage("en");
                      setSelectedOtherLang(lang.name);
                      setLangToast(
                        isHindi
                          ? `${lang.name} (${lang.englishName}) सहायता जल्द आ रही है! डिफ़ॉल्ट रूप से English सक्रिय है।`
                          : `${lang.englishName} (${lang.name}) support coming soon! Defaulted to English.`
                      );
                      setTimeout(() => setLangToast(null), 4000);
                    }}
                    className="py-1.5 px-2 bg-white rounded-lg border border-gray-200 text-left text-xs flex flex-col hover:border-[#1D5F49]/40 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{lang.name}</span>
                    <span className="text-[10px] text-gray-400">Default EN</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => {
                onNavigate("home");
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-[#1D5F49]"
            >
              {isHindi ? "होम (Home)" : "Home"}
            </button>
            <button
              onClick={() => {
                onNavigate("schemes");
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 font-medium text-gray-700"
            >
              {isHindi ? "योजनाएं (Schemes)" : "Schemes"}
            </button>
            <button
              onClick={() => {
                onNavigate("csc");
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 font-medium text-gray-700"
            >
              {isHindi ? "सेवा केंद्र (CSC)" : "CSC Centers"}
            </button>

            <button
              onClick={() => {
                onNavigate("assisted");
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 font-medium text-[#1D5F49] flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              <span>{isHindi ? "सहायक मोड (CSC ऑपरेटर)" : "Assisted Mode (CSC / NGO)"}</span>
            </button>
          </nav>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            {isAuthenticated && user && (
              <div className="space-y-1 pb-2 border-b border-gray-100">
                <div className="px-2 py-1 text-xs font-bold text-gray-900 truncate">
                  👤 {user.full_name}
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMyDetailsOpen(true);
                  }}
                  className="w-full text-left py-2 px-2 text-xs font-semibold text-[#1D5F49] hover:bg-emerald-50 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{isHindi ? "मेरे विवरण (My Details)" : "My Details"}</span>
                  </span>
                  {user.citizen_details ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                      {isHindi ? "सहेजे गए" : "Saved"}
                    </span>
                  ) : null}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate("schemes");
                  }}
                  className="w-full text-left py-2 px-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-[#1D5F49]" />
                    <span>{isHindi ? "सहेजी गई योजनाएं" : "Saved Schemes"}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                    {savedSchemeIds.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isHindi ? "लॉग आउट" : "Sign Out"}</span>
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => {
                  onNavigate("login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full border border-[#1D5F49] text-[#1D5F49] py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
              >
                {isHindi ? "लॉग इन / खाता बनाएं" : "Sign In / Register"}
              </button>
            )}

            {/* Primary CTA Button: Get Started (Shown ONLY on Landing Page) */}
            {currentView === "home" && (
              <button
                onClick={() => {
                  onNavigate("wizard");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#1D5F49] text-white py-2.5 rounded-xl font-semibold text-sm shadow-xs cursor-pointer"
              >
                {isHindi ? "शुरू करें" : "Get Started"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Language Notification Toast */}
      {langToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#111827]/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-700/50 flex items-center gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <p className="font-medium leading-snug flex-1">{langToast}</p>
          <button
            onClick={() => setLangToast(null)}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Citizen My Details Modal */}
      <MyDetailsModal
        isOpen={isMyDetailsOpen}
        onClose={() => setIsMyDetailsOpen(false)}
        initialTab={myDetailsTab}
        onEditDetails={() => {
          setIsMyDetailsOpen(false);
          onNavigate("wizard");
        }}
        onCheckEligibility={() => {
          setIsMyDetailsOpen(false);
          onNavigate("wizard");
        }}
        onSelectScheme={(schemeId) => {
          setIsMyDetailsOpen(false);
          onNavigate("scheme_detail", schemeId);
        }}
      />
    </header>
  );
};
