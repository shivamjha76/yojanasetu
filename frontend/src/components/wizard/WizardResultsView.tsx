import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  CitizenProfile,
  EligibilityResult,
  RuleMatchEvidence,
  DocumentRequirement,
} from "@/types/schema";
import { EligibilityResponse } from "@/services/api";
import {
  GraduationCap,
  Briefcase,
  Home,
  Heart,
  IndianRupee,
  Landmark,
  Sparkles,
  ArrowRight,
  Pencil,
  Clock,
  User as UserIcon,
  MapPin,
  Building,
  Target,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileCheck,
  Coins,
  Check,
  Users,
} from "lucide-react";

interface WizardResultsViewProps {
  results: EligibilityResponse;
  profile: CitizenProfile;
  onEditProfile: () => void;
  onReset: () => void;
  onViewSchemeDetail?: (schemeId: string) => void;
}

type CategoryFilter = "all" | "education" | "skills" | "financial" | "others";

interface SchemeMetaHelper {
  iconType: "education" | "skills" | "housing" | "health" | "financial";
  badge?: string;
  ministryDisplay: string;
  summary: string;
  tags: string[];
  benefitLabel: string;
  benefitAmount: string;
}

export const WizardResultsView: React.FC<WizardResultsViewProps> = ({
  results,
  profile,
  onEditProfile,
  onReset: _onReset,
  onViewSchemeDetail = () => {},
}) => {
  const { language, setIsAssistantOpen } = useApp();
  const { user } = useAuth();
  const isHindi = language === "hi";

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<"relevant" | "alpha">("relevant");
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSchemeId(expandedSchemeId === id ? null : id);
  };

  const eligibleList = results.eligible_schemes || [];

  const getSchemeMeta = (scheme: EligibilityResult, index: number): SchemeMetaHelper => {
    const id = scheme.scheme_id.toLowerCase();
    const cat = (scheme.category || "").toLowerCase();

    if (id.includes("matric") || id.includes("scholarship")) {
      return {
        iconType: "education",
        badge: index === 0 ? "Top Match" : undefined,
        ministryDisplay: isHindi ? "केंद्रीय सरकार" : "Central Government",
        summary: isHindi
          ? "मैट्रिकोत्तर अध्ययन के लिए पात्र छात्रों को वित्तीय सहायता व छात्रवृत्ति।"
          : "Financial assistance to OBC students for post-matriculation studies.",
        tags: isHindi
          ? ["शिक्षा", "छावृत्ति", "ओबीसी", "विद्यार्थी"]
          : ["Education", "Scholarship", "OBC", "Students"],
        benefitLabel: isHindi ? "वित्तीय सहायता" : "Financial Support",
        benefitAmount: isHindi ? "₹48,000 प्रति वर्ष तक" : "Upto ₹48,000 per year",
      };
    }

    if (id.includes("kaushal") || id.includes("pmkvy")) {
      return {
        iconType: "skills",
        badge: undefined,
        ministryDisplay: isHindi ? "कौशल विकास मंत्रालय" : "Ministry of Skill Development",
        summary: isHindi
          ? "युवाओं की रोजगार क्षमता बढ़ाने के लिए कौशल प्रशिक्षण और प्रमाणन।"
          : "Skill training and certification to improve employability of youth.",
        tags: isHindi
          ? ["कौशल विकास", "प्रशिक्षण", "18–35 वर्ष", "सभी वर्ग"]
          : ["Skill Development", "Training", "18–35 years", "All Categories"],
        benefitLabel: isHindi ? "कौशल प्रशिक्षण" : "Skill Training",
        benefitAmount: isHindi ? "मुफ्त पाठ्यक्रम + प्रमाण पत्र" : "Free courses + Certification",
      };
    }

    if (id.includes("rajasthan") || id.includes("sabal") || id.includes("employment")) {
      return {
        iconType: "housing",
        badge: undefined,
        ministryDisplay: isHindi ? "राजस्थान सरकार" : "Government of Rajasthan",
        summary: isHindi
          ? "राजस्थान के युवाओं के लिए कौशल विकास एवं रोजगार भत्ता सहायता।"
          : "Skill development support for youth of Rajasthan.",
        tags: isHindi
          ? ["राज्य योजना", "रोजगार", "राजस्थान", "18–30 वर्ष"]
          : ["State Scheme", "Employment", "Rajasthan", "18–30 years"],
        benefitLabel: isHindi ? "प्रशिक्षण भत्ता" : "Training Allowance",
        benefitAmount: isHindi ? "₹10,000 तक" : "Upto ₹10,000",
      };
    }

    if (id.includes("ayushman") || id.includes("pmjay") || cat.includes("health")) {
      return {
        iconType: "health",
        badge: undefined,
        ministryDisplay: isHindi ? "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" : "Ministry of Health & Family Welfare",
        summary: isHindi
          ? "पात्र परिवारों के लिए कैशलेस स्वास्थ्य बीमा कवरेज प्रदान करता है।"
          : "Provides health insurance coverage for eligible families.",
        tags: isHindi
          ? ["स्वास्थ्य", "बीमा", "कम आय वर्ग", "सभी राज्य"]
          : ["Health", "Insurance", "Low Income Families", "All States"],
        benefitLabel: isHindi ? "स्वास्थ्य सुरक्षा" : "Health Coverage",
        benefitAmount: isHindi ? "₹5 लाख प्रति परिवार" : "Upto ₹5 Lakh per family",
      };
    }

    if (id.includes("mudra") || cat.includes("business")) {
      return {
        iconType: "financial",
        badge: undefined,
        ministryDisplay: isHindi ? "वित्त मंत्रालय" : "Ministry of Finance",
        summary: isHindi
          ? "छोटे व्यवसाय व सूक्ष्म उद्यम शुरू करने हेतु कम ब्याज पर ऋण।"
          : "Collateral-free business loans for micro and small enterprises.",
        tags: isHindi
          ? ["व्यापार", "मुद्रा लोन", "स्वरोजगार"]
          : ["Business", "Mudra Loan", "Self Employed"],
        benefitLabel: isHindi ? "व्यवसाय ऋण" : "Business Loan",
        benefitAmount: isHindi ? "₹10 लाख तक" : "Upto ₹10 Lakh",
      };
    }

    if (id.includes("awas") || cat.includes("housing")) {
      return {
        iconType: "housing",
        badge: undefined,
        ministryDisplay: isHindi ? "आवास एवं शहरी कार्य मंत्रालय" : "Ministry of Housing & Urban Affairs",
        summary: isHindi
          ? "पक्के मकान के निर्माण के लिए वित्तीय सब्सिडी और बैंक ऋण सहायता।"
          : "Financial assistance for construction of pucca house.",
        tags: isHindi
          ? ["आवास", "सब्सिडी", "शहरी व ग्रामीण"]
          : ["Housing", "Subsidy", "Urban & Rural"],
        benefitLabel: isHindi ? "आवास सहायता" : "Housing Grant",
        benefitAmount: isHindi ? "₹2.5 लाख तक अनुदान" : "Upto ₹2.5 Lakh subsidy",
      };
    }

    return {
      iconType: cat.includes("education")
        ? "education"
        : cat.includes("skill")
        ? "skills"
        : cat.includes("health")
        ? "health"
        : "financial",
      badge: index === 0 ? "Top Match" : undefined,
      ministryDisplay: isHindi ? "भारत सरकार" : "Government of India",
      summary: isHindi ? scheme.scheme_name_hi : scheme.scheme_name_en,
      tags: [scheme.category.replace("_", " "), "Direct Support"],
      benefitLabel: isHindi ? "सरकारी लाभ" : "Government Benefit",
      benefitAmount: scheme.benefit_amount_text || "As per norms",
    };
  };

  const getCategoryGroup = (scheme: EligibilityResult): CategoryFilter => {
    const id = scheme.scheme_id.toLowerCase();
    const cat = (scheme.category || "").toLowerCase();
    if (cat.includes("education") || id.includes("scholarship") || id.includes("matric") || id.includes("coaching")) {
      return "education";
    }
    if (cat.includes("skill") || id.includes("kaushal") || id.includes("apprenticeship") || id.includes("employment")) {
      return "skills";
    }
    if (cat.includes("business") || cat.includes("agriculture") || id.includes("mudra") || id.includes("svanidhi") || id.includes("kisan")) {
      return "financial";
    }
    return "others";
  };

  const categoryCounts = useMemo(() => {
    let education = 0;
    let skills = 0;
    let financial = 0;
    let others = 0;

    eligibleList.forEach((s) => {
      const g = getCategoryGroup(s);
      if (g === "education") education++;
      else if (g === "skills") skills++;
      else if (g === "financial") financial++;
      else others++;
    });

    return {
      all: eligibleList.length,
      education,
      skills,
      financial,
      others,
    };
  }, [eligibleList]);

  const filteredSchemes = useMemo(() => {
    let list = [...eligibleList];

    if (activeCategory !== "all") {
      list = list.filter((s) => getCategoryGroup(s) === activeCategory);
    }

    if (sortBy === "alpha") {
      list.sort((a, b) => a.scheme_name_en.localeCompare(b.scheme_name_en));
    }

    return list;
  }, [eligibleList, activeCategory, sortBy]);

  const citizenName =
    user?.full_name?.split(" ")[0] ||
    (profile as any).name ||
    (isHindi ? "अमन" : "Aman");

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. TOP CELEBRATORY HERO BANNER */}
      <div className="relative rounded-3xl bg-[#F4F9F5] border border-[#E0ECE3] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xs">
        
        {/* Subtle decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#EAF4ED]/60 pointer-events-none blur-xl" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-48 rounded-full bg-[#EBF5EE]/50 pointer-events-none blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Megaphone Badge + Headlines */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 w-full lg:max-w-xl">
            <div className="relative shrink-0 select-none">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E5F2E9] border border-[#D5E7DA] flex items-center justify-center shadow-xs">
                <img
                  src="/images/results_megaphone_transparent.png"
                  alt="Announcement"
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#185644] text-white flex items-center justify-center border-2 border-white shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {isHindi ? `शानदार, ${citizenName}!` : `Great, ${citizenName}!`}
              </h1>

              <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
                {isHindi ? (
                  <>
                    हमें <span className="text-[#185644] font-black">{results.eligible_count} योजनाएं</span> मिली हैं जिनके आप पात्र हो सकते हैं
                  </>
                ) : (
                  <>
                    We found <span className="text-[#185644] font-black">{results.eligible_count} schemes</span> you may qualify for
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed pt-0.5">
                {isHindi
                  ? "आपके द्वारा दर्ज की गई जानकारी के आधार पर, यहाँ आपके लिए सबसे प्रासंगिक सरकारी योजनाएं प्रस्तुत हैं।"
                  : "Based on the information you provided, here are the most relevant government schemes for you."}
              </p>
            </div>
          </div>

          {/* Right: Boy in Green Hoodie Illustration + Thought Callout + Slogan */}
          <div className="relative hidden md:flex items-center justify-end shrink-0 select-none space-x-2">
            
            {/* Thought Bubble */}
            <div className="relative bg-white/95 backdrop-blur-xs border border-gray-200/80 rounded-2xl px-4 py-2.5 shadow-xs max-w-[175px] text-left">
              <p className="text-[11px] font-semibold text-gray-800 leading-snug">
                {isHindi
                  ? "उज्ज्वल भविष्य के लिए अधिक नए अवसर!"
                  : "More opportunities for a brighter tomorrow!"}
              </p>
              <div className="absolute -top-1 -right-1 text-emerald-500 font-bold text-xs">✦</div>
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-y-6 border-y-transparent border-l-6 border-l-white" />
            </div>

            {/* Boy in Green Hoodie Illustration */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <img
                src="/images/results_boy_transparent.png"
                alt="Eligible Citizen"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>

            {/* Slogan with Tricolor Underline */}
            <div className="hidden lg:flex flex-col items-center justify-center pl-2">
              <div className="text-center font-serif italic text-base font-bold text-[#185644] leading-tight">
                Sarkari Yojana,
                <br />
                <span className="font-sans font-semibold text-sm text-[#185644]">Ab Sabke Liye</span>
              </div>
              <div className="mt-1.5 flex flex-col items-center gap-0.5">
                <svg viewBox="0 0 80 8" className="w-20 h-2" fill="none">
                  <path d="M 4 3 C 25 1, 55 6, 76 2" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 10 6 C 30 4, 60 7.5, 72 5" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. CATEGORY PILL TABS + SORT BY DROPDOWN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        
        {/* Left: Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#185644] text-white shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {isHindi ? "सभी" : "All"} ({categoryCounts.all})
          </button>

          <button
            onClick={() => setActiveCategory("education")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeCategory === "education"
                ? "bg-[#185644] text-white shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {isHindi ? "शिक्षा" : "Education"} ({categoryCounts.education})
          </button>

          <button
            onClick={() => setActiveCategory("skills")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeCategory === "skills"
                ? "bg-[#185644] text-white shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {isHindi ? "कौशल एवं रोजगार" : "Skill & Employment"} ({categoryCounts.skills})
          </button>

          <button
            onClick={() => setActiveCategory("financial")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeCategory === "financial"
                ? "bg-[#185644] text-white shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {isHindi ? "वित्तीय सहायता" : "Financial Support"} ({categoryCounts.financial})
          </button>

          <button
            onClick={() => setActiveCategory("others")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeCategory === "others"
                ? "bg-[#185644] text-white shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {isHindi ? "अन्य" : "Others"} ({categoryCounts.others})
          </button>
        </div>

        {/* Right: Sort By Dropdown */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <span className="text-xs sm:text-sm font-medium text-gray-500">
            {isHindi ? "क्रमबद्ध करें" : "Sort by"}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label={isHindi ? "योजनाओं को क्रमबद्ध करें" : "Sort schemes by"}
            className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#185644]/20 cursor-pointer"
          >
            <option value="relevant">{isHindi ? "सबसे प्रासंगिक" : "Most Relevant"}</option>
            <option value="alpha">{isHindi ? "वर्णमाला अनुसार" : "Alphabetical"}</option>
          </select>
        </div>

      </div>

      {/* 3. MAIN CONTENT: 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (8 cols): Scheme Cards List */}
        <div className="lg:col-span-8 space-y-4">
          
          {filteredSchemes.length > 0 ? (
            filteredSchemes.map((scheme, index) => {
              const meta = getSchemeMeta(scheme, index);
              const isExpanded = expandedSchemeId === scheme.scheme_id;
              const isPrimaryAction = index === 0;

              return (
                <div
                  key={scheme.scheme_id}
                  className="bg-white rounded-3xl border border-gray-200/80 hover:border-[#185644]/30 shadow-xs hover:shadow-md transition-all p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                    
                    {/* Left: Category Icon */}
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                          meta.iconType === "education"
                            ? "bg-[#EAF7EE] text-[#1E7448]"
                            : meta.iconType === "skills"
                            ? "bg-[#EBF3FE] text-[#2563EB]"
                            : meta.iconType === "housing"
                            ? "bg-[#FEF5E9] text-[#D97706]"
                            : meta.iconType === "health"
                            ? "bg-[#FDF2F4] text-[#E11D48]"
                            : "bg-[#EAF5EE] text-[#165D51]"
                        }`}
                      >
                        {meta.iconType === "education" && <GraduationCap className="w-7 h-7" />}
                        {meta.iconType === "skills" && <Briefcase className="w-7 h-7" />}
                        {meta.iconType === "housing" && <Home className="w-7 h-7" />}
                        {meta.iconType === "health" && <Heart className="w-7 h-7 fill-current" />}
                        {meta.iconType === "financial" && <IndianRupee className="w-7 h-7" />}
                      </div>

                      {/* Middle: Title, Ministry, Summary, Tags */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        
                        {/* Top Match Pill Badge */}
                        {meta.badge && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#135846] text-white text-[10px] sm:text-[11px] font-bold tracking-wide">
                            <Sparkles className="w-3 h-3 text-emerald-200" />
                            <span>{meta.badge}</span>
                          </div>
                        )}

                        {/* Scheme Name */}
                        <h2
                          onClick={() => onViewSchemeDetail(scheme.scheme_id)}
                          className="text-base sm:text-lg font-bold text-gray-900 hover:text-[#185644] transition-colors cursor-pointer leading-snug"
                        >
                          {isHindi ? scheme.scheme_name_hi : scheme.scheme_name_en}
                        </h2>

                        {/* Ministry / Authority */}
                        <div className="flex items-center text-xs text-gray-500 font-medium">
                          <Landmark className="w-3.5 h-3.5 mr-1.5 shrink-0 text-gray-400" />
                          <span>{meta.ministryDisplay}</span>
                        </div>

                        {/* Summary */}
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-0.5">
                          {meta.summary}
                        </p>

                        {/* Tag Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {meta.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-3 py-1 rounded-full bg-[#F3F5F4] text-gray-600 text-[11px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                      </div>
                    </div>

                    {/* Right: Benefit Pill Card + Action Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-3 sm:gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      
                      {/* Benefit Callout Pill */}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 flex items-center gap-3 w-auto ${
                          meta.iconType === "education" || meta.iconType === "financial"
                            ? "bg-[#EAF6EE]"
                            : meta.iconType === "skills"
                            ? "bg-[#EBF3FE]"
                            : meta.iconType === "housing"
                            ? "bg-[#FEF5E9]"
                            : "bg-[#FDF2F4]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            meta.iconType === "education" || meta.iconType === "financial"
                              ? "bg-white text-[#185644]"
                              : meta.iconType === "skills"
                              ? "bg-white text-[#2563EB]"
                              : meta.iconType === "housing"
                              ? "bg-white text-[#D97706]"
                              : "bg-white text-[#E11D48]"
                          }`}
                        >
                          {meta.iconType === "education" || meta.iconType === "financial" ? (
                            <IndianRupee className="w-4 h-4 font-bold" />
                          ) : meta.iconType === "skills" ? (
                            <Users className="w-4 h-4" />
                          ) : meta.iconType === "housing" ? (
                            <Briefcase className="w-4 h-4" />
                          ) : (
                            <Heart className="w-4 h-4 fill-current" />
                          )}
                        </div>

                        <div className="text-left">
                          <div className="text-[11px] font-medium text-gray-500 leading-tight">
                            {meta.benefitLabel}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight mt-0.5">
                            {meta.benefitAmount}
                          </div>
                        </div>
                      </div>

                      {/* View Details Action Button */}
                      <button
                        type="button"
                        onClick={() => onViewSchemeDetail(scheme.scheme_id)}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-[150px] shadow-2xs ${
                          isPrimaryAction
                            ? "bg-[#185644] hover:bg-[#124234] text-white"
                            : "bg-white hover:bg-gray-50 border border-[#185644] text-[#185644]"
                        }`}
                      >
                        <span>{isHindi ? "विवरण देखें" : "View Details"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                  {/* Why You Qualify Accordion Toggle & Evidence Panel */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex flex-col gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleExpand(scheme.scheme_id)}
                      className="text-gray-500 hover:text-[#185644] font-medium flex items-center gap-1 self-start transition-colors cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#185644]" />
                      <span>
                        {isHindi
                          ? "देखें आप क्यों पात्र हैं (सत्यापित नियम)"
                          : "Why You Qualify (Match Evidence)"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/70 space-y-3 animate-in fade-in duration-200 mt-1">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-[#185644]" />
                          <span>
                            {isHindi ? "सत्यापित पात्रता मानदंड:" : "Satisfied Eligibility Criteria:"}
                          </span>
                        </div>

                        <div className="space-y-1.5 pl-1">
                          {scheme.matched_rules && scheme.matched_rules.length > 0 ? (
                            scheme.matched_rules.map((rule: RuleMatchEvidence, rIdx: number) => (
                              <div key={rIdx} className="text-gray-700 flex items-start gap-2 text-xs">
                                <span className="text-[#185644] font-bold">✓</span>
                                <span>{isHindi ? rule.evidence_text_hi : rule.evidence_text_en}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-xs">
                              {isHindi
                                ? "आपके सभी जनसांख्यिकीय मानदंड इस योजना के नियमों के पूर्ण अनुकूल हैं।"
                                : "Your demographic details satisfy all criteria for this scheme."}
                            </p>
                          )}
                        </div>

                        {scheme.required_documents && scheme.required_documents.length > 0 && (
                          <div className="pt-2.5 border-t border-gray-200/60">
                            <div className="font-semibold text-gray-600 mb-1.5 text-[11px]">
                              {isHindi ? "आवश्यक मुख्य दस्तावेज:" : "Key Documents Needed:"}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {scheme.required_documents.map((doc: DocumentRequirement) => (
                                <span
                                  key={doc.id}
                                  className="px-2.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 text-[10px] font-medium"
                                >
                                  {isHindi ? doc.name_hi : doc.name_en}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
              <p className="text-sm text-gray-500">
                {isHindi
                  ? "इस श्रेणी में कोई योजना नहीं मिली। कृपया अन्य श्रेणी चुनें।"
                  : "No schemes found in this category. Please select another filter."}
              </p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (4 cols): 3 Sidebar Cards */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: "Your Profile" + Edit Link */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {isHindi ? "आपकी प्रोफाइल" : "Your Profile"}
              </h3>
              <button
                type="button"
                onClick={onEditProfile}
                className="text-xs font-semibold text-[#185644] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{isHindi ? "संपादित करें" : "Edit"}</span>
              </button>
            </div>

            {/* Profile Attributes 2-Column Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-3 pt-4 text-xs">
              
              {/* Age */}
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {isHindi ? "आयु" : "Age"}
                  </div>
                  <div className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5">
                    {profile.age} {isHindi ? "वर्ष" : "years"}
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-start gap-2.5">
                <UserIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {isHindi ? "लिंग" : "Gender"}
                  </div>
                  <div className="font-bold text-gray-800 text-xs sm:text-sm capitalize mt-0.5">
                    {profile.gender === "male"
                      ? isHindi
                        ? "पुरुष"
                        : "Male"
                      : profile.gender === "female"
                      ? isHindi
                        ? "महिला"
                        : "Female"
                      : profile.gender}
                  </div>
                </div>
              </div>

              {/* State */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {isHindi ? "राज्य" : "State"}
                  </div>
                  <div className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5">
                    {profile.state}
                  </div>
                </div>
              </div>

              {/* District */}
              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {isHindi ? "जिला" : "District"}
                  </div>
                  <div className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5">
                    {profile.district || "Jaipur"}
                  </div>
                </div>
              </div>

              {/* Occupation */}
              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {isHindi ? "व्यवसाय" : "Occupation"}
                  </div>
                  <div className="font-bold text-gray-800 text-xs sm:text-sm capitalize mt-0.5">
                    {profile.occupation}
                  </div>
                </div>
              </div>

              {/* Annual Income */}
              <div className="flex items-start gap-2.5">
                <Coins className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {isHindi ? "वार्षिक पारिवारिक आय" : "Annual Family Income"}
                  </div>
                  <div className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5">
                    ₹{profile.annual_income?.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {isHindi ? "श्रेणी" : "Category"}
                  </div>
                  <div className="font-bold text-gray-800 text-xs sm:text-sm uppercase mt-0.5">
                    {profile.category}
                  </div>
                </div>
              </div>

              {/* Residence Area */}
              <div className="flex items-start gap-2.5">
                <Home className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {isHindi ? "निवास क्षेत्र" : "Residence Area"}
                  </div>
                  <div className="font-bold text-gray-800 text-xs sm:text-sm capitalize mt-0.5">
                    {profile.area_type || "Urban"}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Card 2: "Not the right results?" */}
          <div className="rounded-3xl bg-[#F2F8F4] border border-[#D8ECE0] p-6 text-left">
            <div className="w-9 h-9 rounded-full bg-white text-[#185644] flex items-center justify-center shadow-2xs">
              <Target className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-bold text-gray-900 mt-3.5">
              {isHindi ? "क्या यह सही परिणाम नहीं हैं?" : "Not the right results?"}
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {isHindi
                ? "अधिक सटीक सिफारिशें प्राप्त करने के लिए आप अपनी जानकारी अपडेट कर सकते हैं।"
                : "You can update your information to get more accurate recommendations."}
            </p>

            <button
              type="button"
              onClick={onEditProfile}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer text-center"
            >
              {isHindi ? "विवरण अपडेट करें" : "Update Details"}
            </button>
          </div>

          {/* Card 3: "Have a question?" Chat with Sarathi */}
          <div className="rounded-3xl bg-[#F0F6FE] border border-[#D9E8FC] p-6 text-left">
            <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-bold text-gray-900 mt-3.5">
              {isHindi ? "कोई सवाल है?" : "Have a question?"}
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {isHindi
                ? "किसी भी योजना के बारे में अधिक जानकारी के लिए सारथी से पूछें।"
                : "Ask Sarathi for more information about any scheme."}
            </p>

            <button
              type="button"
              onClick={() => setIsAssistantOpen(true)}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50/50 border border-[#2563EB]/40 text-[#2563EB] font-semibold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{isHindi ? "सारथी से बात करें" : "Chat with Sarathi"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WizardResultsView;
