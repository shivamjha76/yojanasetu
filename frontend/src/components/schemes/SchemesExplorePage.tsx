import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import { api } from "@/services/api";
import { SchemeCard } from "./SchemeCard";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Compass,
  Building2,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";

interface SchemesExplorePageProps {
  onSelectScheme?: (schemeId: string) => void;
  onStartWizard?: () => void;
  initialCategory?: string;
}

export const SchemesExplorePage: React.FC<SchemesExplorePageProps> = ({
  onSelectScheme = () => {},
  onStartWizard = () => {},
  initialCategory = "all",
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedBenefitType, setSelectedBenefitType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "name">("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Categories list
  const categoryFilters = [
    { id: "all", labelHi: "सभी श्रेणियां", labelEn: "All Categories" },
    { id: "agriculture", labelHi: "कृषि एवं किसान कल्याण", labelEn: "Agriculture & Farming" },
    { id: "education_scholarships", labelHi: "शिक्षा एवं छात्रवृत्ति", labelEn: "Education & Scholarships" },
    { id: "healthcare", labelHi: "स्वास्थ्य एवं चिकित्सा", labelEn: "Healthcare & Wellness" },
    { id: "women_child", labelHi: "महिला एवं बाल विकास", labelEn: "Women & Child Care" },
    { id: "housing_urban", labelHi: "आवास एवं बुनियादी सुविधाएं", labelEn: "Housing & Shelter" },
    { id: "business_msme_loans", labelHi: "व्यापार एवं मुद्रा लोन", labelEn: "Business & MSME Loans" },
    { id: "skills_employment", labelHi: "कौशल विकास एवं रोजगार", labelEn: "Skills & Employment" },
    { id: "social_security_pensions", labelHi: "सामाजिक सुरक्षा व पेंशन", labelEn: "Social Security & Pensions" },
  ];

  const stateFilters = [
    { id: "all", labelHi: "अखिल भारतीय / सभी राज्य", labelEn: "All India / All States" },
    { id: "Madhya Pradesh", labelHi: "मध्य प्रदेश (MP)", labelEn: "Madhya Pradesh" },
    { id: "Uttar Pradesh", labelHi: "उत्तर प्रदेश (UP)", labelEn: "Uttar Pradesh" },
    { id: "Bihar", labelHi: "बिहार (Bihar)", labelEn: "Bihar" },
    { id: "Rajasthan", labelHi: "राजस्थान (Rajasthan)", labelEn: "Rajasthan" },
    { id: "Maharashtra", labelHi: "महाराष्ट्र (Maharashtra)", labelEn: "Maharashtra" },
    { id: "Delhi", labelHi: "दिल्ली (Delhi)", labelEn: "Delhi" },
  ];

  // Fetch schemes from API on load
  useEffect(() => {
    async function loadAllSchemes() {
      try {
        setIsLoading(true);
        const res = await api.getSchemes({ limit: 50 });
        if (res.schemes) {
          setSchemes(res.schemes);
        }
      } catch (err) {
        console.warn("Failed to fetch schemes for explore page:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllSchemes();
  }, []);

  // Filtered and sorted schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          s.name_hi.toLowerCase().includes(q) ||
          s.name_en.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          s.benefit_amount_text.toLowerCase().includes(q);
        if (!matchesName) return false;
      }

      // 2. Category filter
      if (selectedCategory !== "all" && s.category !== selectedCategory) {
        return false;
      }

      // 3. State filter
      if (selectedState !== "all") {
        if (s.level === "state" && s.applicable_state && s.applicable_state !== selectedState) {
          return false;
        }
      }

      // 4. Benefit type filter
      if (selectedBenefitType !== "all" && s.benefit_type !== selectedBenefitType) {
        return false;
      }

      return true;
    });
  }, [schemes, searchQuery, selectedCategory, selectedState, selectedBenefitType]);

  // Sort schemes
  const sortedSchemes = useMemo(() => {
    const list = [...filteredSchemes];
    if (sortBy === "name") {
      list.sort((a, b) =>
        isHindi ? a.name_hi.localeCompare(b.name_hi) : a.name_en.localeCompare(b.name_en)
      );
    }
    return list;
  }, [filteredSchemes, sortBy, isHindi]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedState("all");
    setSelectedBenefitType("all");
    setSortBy("featured");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedState !== "all" ||
    selectedBenefitType !== "all";

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-border/60">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>{isHindi ? "योजना निर्देशिका" : "Schemes Catalog"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {isHindi ? "सभी सरकारी योजनाएं खोजें" : "Explore Government Welfare Schemes"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isHindi
                ? "15+ सत्यापित केंद्रीय एवं राज्य योजनाएं। बिना किसी बिचौलिये के सीधे आवेदन करें।"
                : "Browse verified central and state welfare initiatives with transparent criteria."}
            </p>
          </div>

          <Button
            onClick={onStartWizard}
            className="self-start md:self-auto rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-11 px-5 shadow-md shadow-primary/20"
          >
            <span>{isHindi ? "अपनी व्यक्तिगत पात्रता जांचें (2 मिनट)" : "Check Your Eligibility (2 min)"}</span>
          </Button>
        </div>

        {/* Main Search & Layout */}
        <div className="py-6 flex flex-col lg:flex-row gap-8">
          {/* Left Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-primary" />
                  <span>{isHindi ? "फ़िल्टर विकल्प" : "Filter Schemes"}</span>
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-destructive hover:underline font-semibold"
                  >
                    {isHindi ? "सभी हटाएं" : "Clear All"}
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  {isHindi ? "श्रेणी (Category)" : "Category"}
                </label>
                <div className="space-y-1">
                  {categoryFilters.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {isHindi ? cat.labelHi : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  {isHindi ? "राज्य (State)" : "State Level"}
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {stateFilters.map((st) => (
                    <option key={st.id} value={st.id}>
                      {isHindi ? st.labelHi : st.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Benefit Type Filter */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  {isHindi ? "लाभ का प्रकार" : "Benefit Type"}
                </label>
                <select
                  value={selectedBenefitType}
                  onChange={(e) => setSelectedBenefitType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">{isHindi ? "सभी प्रकार" : "All Types"}</option>
                  <option value="direct_benefit_transfer">{isHindi ? "DBT प्रत्यक्ष नकद लाभ" : "Direct Benefit Transfer (DBT)"}</option>
                  <option value="health_insurance">{isHindi ? "कैशलेस स्वास्थ्य बीमा" : "Cashless Health Insurance"}</option>
                  <option value="loan_subsidy">{isHindi ? "मुद्रा / व्यापार ऋण सब्सिडी" : "Loan Subsidy"}</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1 space-y-6">
            {/* Search Input and Sort Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isHindi
                      ? "योजना, मंत्रालय, या लाभ खोजें (उदा. किसान, आयुष्मान, आवास, मुद्रा)..."
                      : "Search scheme name, ministry, or benefit..."
                  }
                  className="w-full h-11 pl-10 pr-10 rounded-2xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle Button */}
              <Button
                variant="outline"
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="lg:hidden h-11 px-4 rounded-2xl text-xs font-semibold flex items-center space-x-1.5 shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{isHindi ? "फ़िल्टर" : "Filters"}</span>
              </Button>

              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "featured" | "name")}
                  className="h-11 px-3 rounded-2xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="featured">{isHindi ? "प्रमुख योजनाएं" : "Featured First"}</option>
                  <option value="name">{isHindi ? "नाम अनुसार (A-Z)" : "Alphabetical (A-Z)"}</option>
                </select>
              </div>
            </div>

            {/* Mobile Filter Drawer / Collapse */}
            {isMobileFiltersOpen && (
              <div className="lg:hidden p-4 rounded-2xl border border-border bg-card space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="font-bold text-xs text-foreground">
                    {isHindi ? "फ़िल्टर चुनें" : "Select Filters"}
                  </span>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">
                      {isHindi ? "श्रेणी" : "Category"}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-9 px-2 rounded-xl border border-border bg-card"
                    >
                      {categoryFilters.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {isHindi ? cat.labelHi : cat.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">
                      {isHindi ? "राज्य" : "State"}
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full h-9 px-2 rounded-xl border border-border bg-card"
                    >
                      {stateFilters.map((st) => (
                        <option key={st.id} value={st.id}>
                          {isHindi ? st.labelHi : st.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Count & Status Row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {isHindi
                  ? `${sortedSchemes.length} योजनाएं उपलब्ध`
                  : `Showing ${sortedSchemes.length} schemes`}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-primary hover:underline font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  <span>{isHindi ? "फ़िल्टर रीसेट करें" : "Reset Filters"}</span>
                </button>
              )}
            </div>

            {/* Schemes Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-muted/60 border border-border p-6" />
                ))}
              </div>
            ) : sortedSchemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    onViewDetails={onSelectScheme}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-card border border-dashed border-border rounded-3xl p-8 max-w-md mx-auto space-y-3">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
                <h3 className="font-bold text-base text-foreground">
                  {isHindi ? "कोई योजना नहीं मिली" : "No Schemes Found"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isHindi
                    ? "आपके द्वारा चुने गए फ़िल्टर से कोई योजना मेल नहीं खाती। कृपया फ़िल्टर रीसेट करें।"
                    : "No welfare schemes match the selected filters. Try clearing your search or filters."}
                </p>
                <Button size="sm" variant="outline" onClick={resetFilters} className="rounded-xl text-xs">
                  {isHindi ? "फ़िल्टर रीसेट करें" : "Clear All Filters"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
