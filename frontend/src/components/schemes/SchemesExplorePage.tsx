import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import { api } from "@/services/api";
import { SchemeCard } from "./SchemeCard";
import {
  Search,
  LayoutGrid,
  GraduationCap,
  Heart,
  Briefcase,
  Home,
  Sprout,
  Users,
  Shield,
  MoreHorizontal,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

interface SchemesExplorePageProps {
  onSelectScheme?: (schemeId: string) => void;
  onStartWizard?: () => void;
  initialCategory?: string;
  initialSearch?: string;
}

interface SidebarCategory {
  id: string;
  labelEn: string;
  labelHi: string;
  icon: React.ReactNode;
}

export const SchemesExplorePage: React.FC<SchemesExplorePageProps> = ({
  onSelectScheme = () => {},
  initialCategory = "all",
  initialSearch = "",
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [submittedSearch, setSubmittedSearch] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<"relevant" | "alpha">("relevant");

  // Category sidebar definitions matching reference mockup
  const SIDEBAR_CATEGORIES: SidebarCategory[] = [
    {
      id: "all",
      labelEn: "All Schemes",
      labelHi: "सभी योजनाएं",
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      id: "education",
      labelEn: "Education",
      labelHi: "शिक्षा",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: "health",
      labelEn: "Health",
      labelHi: "स्वास्थ्य",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: "employment",
      labelEn: "Employment",
      labelHi: "रोजगार व कौशल",
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: "housing",
      labelEn: "Housing",
      labelHi: "आवास",
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: "agriculture",
      labelEn: "Agriculture",
      labelHi: "कृषि",
      icon: <Sprout className="w-4 h-4" />,
    },
    {
      id: "women_child",
      labelEn: "Women & Child",
      labelHi: "महिला एवं बाल",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "social_security",
      labelEn: "Social Security",
      labelHi: "सामाजिक सुरक्षा",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: "others",
      labelEn: "Others",
      labelHi: "अन्य",
      icon: <MoreHorizontal className="w-4 h-4" />,
    },
  ];

  // Fetch schemes from API / bundled store
  useEffect(() => {
    async function loadSchemes() {
      try {
        setIsLoading(true);
        const res = await api.getSchemes({ limit: 50 });
        if (res && res.schemes) {
          setSchemes(res.schemes);
        }
      } catch (err) {
        console.warn("Failed to load schemes:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchemes();
  }, []);

  // Sync category filter and search query when incoming props change
  useEffect(() => {
    if (initialCategory) {
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
      setSelectedCategory(categoryMapping[initialCategory] || initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
      setSubmittedSearch(initialSearch);
    }
  }, [initialSearch]);

  // Filter schemes based on sidebar category & search
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // 1. Search query filter
      const query = submittedSearch.trim().toLowerCase();
      if (query) {
        const matchTitle =
          s.name_en.toLowerCase().includes(query) ||
          s.name_hi.toLowerCase().includes(query);
        const matchMinistry = s.ministry?.toLowerCase().includes(query);
        const matchSummary =
          s.short_summary_en.toLowerCase().includes(query) ||
          s.short_summary_hi.toLowerCase().includes(query);
        const matchCategory = s.category.toLowerCase().includes(query);
        if (!matchTitle && !matchMinistry && !matchSummary && !matchCategory) {
          return false;
        }
      }

      // 2. Sidebar category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "education" && s.category !== "education_scholarships") return false;
        if (selectedCategory === "health" && s.category !== "healthcare") return false;
        if (selectedCategory === "employment" && s.category !== "skills_employment") return false;
        if (selectedCategory === "housing" && s.category !== "housing_urban") return false;
        if (selectedCategory === "agriculture" && s.category !== "agriculture") return false;
        if (selectedCategory === "women_child" && s.category !== "women_child") return false;
        if (selectedCategory === "social_security" && s.category !== "social_security_pensions") return false;
        if (selectedCategory === "others" && !["business_msme_loans", "other"].includes(s.category)) {
          return false;
        }
      }

      return true;
    });
  }, [schemes, submittedSearch, selectedCategory]);

  // Sort schemes
  const sortedSchemes = useMemo(() => {
    const list = [...filteredSchemes];
    if (sortBy === "alpha") {
      list.sort((a, b) =>
        isHindi ? a.name_hi.localeCompare(b.name_hi) : a.name_en.localeCompare(b.name_en)
      );
    }
    return list;
  }, [filteredSchemes, sortBy, isHindi]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchQuery);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSubmittedSearch("");
    setSelectedCategory("all");
    setSortBy("relevant");
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-foreground py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
        
        {/* ======================================================== */}
        {/* 1. TOP HERO BANNER: "Schemes for You"                    */}
        {/* ======================================================== */}
        <div className="w-full mb-8 sm:mb-10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-[#E0ECE3]/80 bg-[#F4F9F5] transition-all hover:shadow-sm">
          <picture>
            <source
              srcSet="/images/schemes_hero_banner_transparent@2x.png 2x, /images/schemes_hero_banner_transparent.png 1x"
            />
            <img
              src="/images/schemes_hero_banner_transparent.png"
              alt={
                isHindi
                  ? "योजनाएं आपके लिए - सरकारी योजना, अब सबके लिए"
                  : "Schemes for You - Sarkari Yojana, Ab Sabke Liye"
              }
              className="w-full h-auto object-contain select-none block"
              loading="eager"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/schemes_hero_banner.png";
              }}
            />
          </picture>
        </div>

        {/* ======================================================== */}
        {/* 2. BODY LAYOUT: LEFT SIDEBAR + RIGHT SCHEMES GRID        */}
        {/* ======================================================== */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* ====================================================== */}
          {/* LEFT SIDEBAR: Category Pill Buttons                    */}
          {/* ====================================================== */}
          <div className="w-full lg:w-56 shrink-0">
            {/* Desktop Vertical Menu / Mobile Horizontal Scroll */}
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {SIDEBAR_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl flex items-center space-x-3 transition-all text-xs sm:text-sm shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#E5F2E9] text-[#165D51] font-bold shadow-2xs"
                        : "text-[#4A5568] hover:bg-white/80 hover:text-gray-900 font-medium"
                    }`}
                  >
                    <span className={isActive ? "text-[#165D51]" : "text-gray-500"}>
                      {cat.icon}
                    </span>
                    <span>{isHindi ? cat.labelHi : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ====================================================== */}
          {/* RIGHT CONTENT: Search Bar + Sort + Schemes Grid        */}
          {/* ====================================================== */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Top Row: Search Box + Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="w-full flex-1">
                <div className="relative flex items-center bg-white border border-gray-200/90 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-[#165D51]/20 focus-within:border-[#165D51] transition-all">
                  <Search className="w-4 h-4 text-gray-400 ml-3.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isHindi
                        ? "योजनाएं खोजें... (उदा: छात्रवृत्ति, स्वास्थ्य, आवास)"
                        : "Search schemes... (e.g. scholarship, health, PMAY)"
                    }
                    className="w-full bg-transparent border-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none px-3 py-1.5"
                  />
                  <button
                    type="submit"
                    className="bg-[#165D51] hover:bg-[#124E43] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    {isHindi ? "खोजें" : "Search"}
                  </button>
                </div>
              </form>

              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  {isHindi ? "क्रमबद्ध करें" : "Sort by"}
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label={isHindi ? "योजनाओं को क्रमबद्ध करें" : "Sort schemes by"}
                    className="appearance-none bg-white border border-gray-200/90 rounded-2xl pl-4 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#165D51]/20 cursor-pointer"
                  >
                    <option value="relevant">{isHindi ? "सबसे प्रासंगिक" : "Most Relevant"}</option>
                    <option value="alpha">{isHindi ? "वर्णमाला अनुसार" : "Alphabetical"}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* 3-Column Scheme Cards Grid */}
            {sortedSchemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-1">
                {sortedSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    onViewDetails={() => onSelectScheme(scheme.id)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">
                    {isHindi ? "कोई योजना नहीं मिली" : "No schemes found"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                    {isHindi
                      ? "आपके द्वारा खोजे गए शब्दों के लिए कोई योजना नहीं मिली। कृपया अन्य श्रेणी या शब्द चुनें।"
                      : "We couldn't find any schemes matching your criteria. Try adjusting your search."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isHindi ? "फ़िल्टर रीसेट करें" : "Reset Filters"}</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. BOTTOM MOTTO DIVIDER                                  */}
        {/* ======================================================== */}
        <div className="mt-16 sm:mt-20 pt-8 pb-4 flex items-center justify-center">
          <div className="w-16 sm:w-32 h-[1px] bg-[#E2E8F0]" />
          <span className="px-4 sm:px-6 text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#64748B] uppercase text-center select-none">
            {isHindi
              ? "अधिक जागरूक नागरिक • सशक्त भारत"
              : "A MORE INFORMED CITIZEN. A STRONGER INDIA."}
          </span>
          <div className="w-16 sm:w-32 h-[1px] bg-[#E2E8F0]" />
        </div>

      </div>
    </div>
  );
};

export default SchemesExplorePage;
