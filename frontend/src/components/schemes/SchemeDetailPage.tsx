import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Scheme } from "@/types/schema";
import { DocumentChecklist } from "./DocumentChecklist";
import { WhyYouQualifyAccordion } from "./WhyYouQualifyAccordion";
import { HowToApplySection } from "./HowToApplySection";
import { DocumentVerificationModal } from "./DocumentVerificationModal";
import {
  ArrowLeft,
  Building2,
  Coins,
  ShieldCheck,
  ExternalLink,
  FileText,
  Bookmark,
  BookmarkCheck,
  Home,
  ChevronRight,
  GraduationCap,
  Briefcase,
  HeartPulse,
  Wheat,
  Users,
  CheckCircle2,
  MessageSquare,
  Globe,
  Calendar,
  Laptop,
  Info,
  Gift,
  PhoneCall,
  Share2,
  Sparkles,
  Compass,
  Clock,
} from "lucide-react";

import { getLocalizedBenefit, getLocalizedMinistry } from "@/utils/schemeLocalization";

interface SchemeDetailPageProps {
  scheme: Scheme;
  onBack: () => void;
  onCheckEligibility?: () => void;
  onLocateCsc?: () => void;
  backLabel?: string;
  isEligibleUser?: boolean;
}

type TabType = "overview" | "eligibility" | "benefits" | "documents" | "how_to_apply" | "contact";

export const SchemeDetailPage: React.FC<SchemeDetailPageProps> = ({
  scheme,
  onBack,
  onCheckEligibility = () => {},
  onLocateCsc = () => {},
  backLabel,
  isEligibleUser = true,
}) => {
  const { language } = useApp();
  const { isSchemeSaved, toggleSaveScheme } = useAuth();
  const isHindi = language === "hi";

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isCopied, setIsCopied] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isDocsVerified, setIsDocsVerified] = useState(false);

  const isSaved = isSchemeSaved(scheme.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: isHindi ? scheme.name_hi : scheme.name_en,
          text: isHindi ? scheme.short_summary_hi : scheme.short_summary_en,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Helper to extract clean category display
  const getCategoryInfo = (cat: string) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("education")) {
      return {
        label: isHindi ? "शिक्षा एवं छात्रवृत्ति" : "Education",
        pill: isHindi ? "शिक्षा" : "Education",
        icon: GraduationCap,
        accentBg: "bg-[#EBF3FE]",
        accentText: "text-[#1A73E8]",
        bannerSlogan: isHindi ? "उच्च शिक्षा, उज्ज्वल भविष्य" : "Higher Education Brighter Futures",
        beneficiary: isHindi ? "ओबीसी / एससी / एसटी छात्र" : "OBC Students",
        applicableFor: isHindi ? "कक्षा 11 और उससे ऊपर" : "Class 11 and above",
        applicableSubtitle: isHindi
          ? "स्कूली, स्नातक एवं स्नातकोत्तर अध्ययन"
          : "School, undergraduate, and post-graduate studies",
      };
    }
    if (c.includes("agri") || c.includes("kisan")) {
      return {
        label: isHindi ? "कृषि एवं किसान कल्याण" : "Agriculture",
        pill: isHindi ? "कृषि" : "Agriculture",
        icon: Wheat,
        accentBg: "bg-[#E8F8EE]",
        accentText: "text-[#15803D]",
        bannerSlogan: isHindi ? "सशक्त किसान, समृद्ध भारत" : "Empowering Farmers, Enriching India",
        beneficiary: isHindi ? "भूमिधारक किसान परिवार" : "Landholding Farmers",
        applicableFor: isHindi ? "18 वर्ष और उससे अधिक" : "Age 18 and above",
        applicableSubtitle: isHindi ? "समस्त पात्र किसान व भूस्वामी" : "Small, marginal & landholder farmers",
      };
    }
    if (c.includes("health") || c.includes("ayushman") || c.includes("pmjay")) {
      return {
        label: isHindi ? "स्वास्थ्य एवं चिकित्सा" : "Healthcare",
        pill: isHindi ? "स्वास्थ्य" : "Healthcare",
        icon: HeartPulse,
        accentBg: "bg-[#FDF2F4]",
        accentText: "text-[#E11D48]",
        bannerSlogan: isHindi ? "उत्कृष्ट स्वास्थ्य, हर नागरिक का अधिकार" : "Universal Health, Protected Families",
        beneficiary: isHindi ? "कम आय वाले परिवार (SECC/BPL)" : "Low-Income Families",
        applicableFor: isHindi ? "समस्त परिवार सदस्य" : "All Family Members",
        applicableSubtitle: isHindi ? "सूचीबद्ध अस्पतालों में कैशलेस इलाज" : "Empanelled hospitals nationwide",
      };
    }
    if (c.includes("skill") || c.includes("employment")) {
      return {
        label: isHindi ? "कौशल विकास व रोजगार" : "Skill & Employment",
        pill: isHindi ? "कौशल विकास" : "Skills",
        icon: Briefcase,
        accentBg: "bg-[#EBF3FE]",
        accentText: "text-[#2563EB]",
        bannerSlogan: isHindi ? "कौशल से आत्मनिर्भरता" : "Skill India, Self-Reliant Youth",
        beneficiary: isHindi ? "युवा एवं बेरोजगार उम्मीदवार" : "Youth & Jobseekers",
        applicableFor: isHindi ? "18 से 35 वर्ष" : "Age 18 to 35 years",
        applicableSubtitle: isHindi ? "व्यावसायिक एवं औद्योगिक प्रशिक्षण" : "Vocational & industry certified training",
      };
    }
    if (c.includes("business") || c.includes("mudra") || c.includes("msme")) {
      return {
        label: isHindi ? "व्यापार एवं सूक्ष्म ऋण" : "Business & Loans",
        pill: isHindi ? "व्यापार" : "Business",
        icon: Coins,
        accentBg: "bg-[#FEF6E9]",
        accentText: "text-[#D97706]",
        bannerSlogan: isHindi ? "उद्यमी भारत, बढ़ता व्यापार" : "Powering Micro Enterprises",
        beneficiary: isHindi ? "सूक्ष्म व लघु उद्यमी" : "Micro Entrepreneurs",
        applicableFor: isHindi ? "गैर-कॉर्पोरेट व्यवसाय" : "Non-Corporate Small Business",
        applicableSubtitle: isHindi ? "बिना गारंटी बैंक ऋण व वित्तीय सहायता" : "Collateral-free working capital loan",
      };
    }
    return {
      label: isHindi ? "सरकारी कल्याण योजना" : "Government Scheme",
      pill: isHindi ? "कल्याण योजना" : "Social Welfare",
      icon: ShieldCheck,
      accentBg: "bg-[#EBF3FE]",
      accentText: "text-[#1A73E8]",
      bannerSlogan: isHindi ? "सशक्त नागरिक, सुदृढ़ समाज" : "Empowering Every Citizen",
      beneficiary: isHindi ? "पात्र भारतीय नागरिक" : "Eligible Citizens",
      applicableFor: isHindi ? "सभी पात्र वर्ग" : "All Eligible Categories",
      applicableSubtitle: isHindi ? "सरकारी नियमों व शर्तों के अनुसार" : "As per official government norms",
    };
  };

  const catMeta = getCategoryInfo(scheme.category);
  const CategoryIcon = catMeta.icon;

  // Extract clean ministry name
  const cleanMinistry = getLocalizedMinistry(scheme, isHindi);

  // Domain parser
  const cleanDomain = (() => {
    try {
      const url = new URL(scheme.official_portal_url);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return "scholarships.gov.in";
    }
  })();

  // Plain-language "Who Can Apply?" checklist
  const whoCanApplyList: string[] = (() => {
    const items: string[] = [];
    if (scheme.rules && scheme.rules.length > 0) {
      scheme.rules.forEach((rule) => {
        if (isHindi && rule.description_hi) {
          items.push(rule.description_hi);
        } else if (!isHindi && rule.description_en) {
          items.push(rule.description_en);
        }
      });
    }

    if (items.length === 0) {
      if ((scheme.category || "").toLowerCase().includes("education")) {
        return [
          isHindi ? "आवेदक ओबीसी / एससी / एसटी वर्ग का छात्र हो" : "Student belongs to OBC category",
          isHindi ? "मान्यता प्राप्त संस्थान में नामांकित हो (कक्षा 11 या ऊपर)" : "Enrolled in a recognized institution (Class 11 or above)",
          isHindi ? "न्यूनतम शैक्षणिक प्रदर्शन मानदंड पूरे करता हो" : "Meet the minimum academic performance criteria",
          isHindi ? "पारिवारिक वार्षिक आय निर्धारित सीमा के भीतर हो (≤ ₹2.5 लाख)" : "Family income within the prescribed limit (varies by state)",
        ];
      }
      return [
        isHindi ? "भारत का नागरिक होना आवश्यक है" : "Must be a permanent citizen of India",
        isHindi ? "योजना के आय व पात्रता मापदंडों को पूरा करता हो" : "Meet prescribed income and eligibility criteria",
        isHindi ? "आधार कार्ड व संबंधित दस्तावेज सक्रिय हों" : "Valid Aadhaar Card and required verified credentials",
        isHindi ? "बैंक खाता आधार व डीबीटी से लिंक होना चाहिए" : "Bank account must be seeded with Aadhaar for DBT",
      ];
    }
    return items;
  })();

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-900 py-6 sm:py-8 animate-in fade-in duration-300">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        
        {/* ======================================================== */}
        {/* 1. TOP BREADCRUMB & BACK TO RESULTS LINK                 */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2">
          {/* Breadcrumb Left */}
          <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 overflow-x-auto no-scrollbar">
            <button
              onClick={onBack}
              className="hover:text-gray-900 transition-colors flex items-center shrink-0"
              title={isHindi ? "होम पेज" : "Home"}
            >
              <Home className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
            <button
              onClick={onBack}
              className="hover:text-gray-900 font-medium transition-colors shrink-0"
            >
              {isHindi ? "योजनाएं" : "Schemes"}
            </button>
            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
            <span className="font-medium text-gray-600 shrink-0">
              {catMeta.label}
            </span>
            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
            <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[320px]">
              {isHindi ? scheme.name_hi : scheme.name_en}
            </span>
          </nav>

          {/* Back to Results Right Button */}
          <button
            onClick={onBack}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-950 transition-colors py-1.5 px-3 rounded-lg hover:bg-gray-200/60 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1 stroke-[2.2]" />
            <span>{backLabel || (isHindi ? "परिणाम पर वापस जाएं" : "Back to Results")}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. SCHEME HERO HEADER CARD                               */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
            
            {/* Left Header Content */}
            <div className="flex-1 space-y-3 min-w-0">
              
              {/* Category Icon & Pill Row */}
              <div className="flex items-start gap-4">
                {/* Rounded Square Icon Box */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${catMeta.accentBg} ${catMeta.accentText} flex items-center justify-center shrink-0 shadow-inner`}
                >
                  <CategoryIcon className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.8]" />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0 pt-0.5">
                  {/* Category Pill */}
                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E8F0FE] text-[#1967D2] tracking-wide">
                    {catMeta.pill}
                  </span>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                    {isHindi ? scheme.name_hi : scheme.name_en}
                  </h1>

                  {/* Ministry Subtitle */}
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 font-medium gap-1.5 pt-0.5">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{cleanMinistry}</span>
                  </div>

                  {/* Processing Time Estimate Badge */}
                  {(scheme.processing_time_hi || scheme.processing_time_en) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 mt-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        {isHindi ? "⏳ अनुमानित समय:" : "⏳ Estimated Timeline:"}{" "}
                        {isHindi ? scheme.processing_time_hi : scheme.processing_time_en}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Short Summary Paragraph */}
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed pt-2 max-w-3xl">
                {isHindi ? scheme.short_summary_hi : scheme.short_summary_en}
              </p>
            </div>

            {/* Right Thematic Illustration Banner */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6F5EC] via-[#D8F2E2] to-[#C9ECD4] border border-[#BDE7CA] p-5 sm:p-6 shadow-inner flex flex-col justify-between min-h-[170px]">
                {/* Curved Slogan Badge */}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full shadow-2xs border border-emerald-200/60">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    <span className="text-[11px] sm:text-xs font-bold text-emerald-800 tracking-tight">
                      {catMeta.bannerSlogan}
                    </span>
                  </div>
                </div>

                {/* Illustrated Graphical Avatars */}
                <div className="relative z-10 flex items-end justify-center pt-4">
                  <div className="flex items-end -space-x-3">
                    {/* Character 1 (Female Student / Citizen) */}
                    <div className="w-14 h-16 sm:w-16 sm:h-18 rounded-t-full bg-[#185644] text-white flex flex-col items-center justify-center p-1 relative shadow-sm border-2 border-white">
                      <div className="w-6 h-6 rounded-full bg-[#FED7AA] mb-0.5 border border-amber-300" />
                      <div className="w-8 h-5 rounded-t-lg bg-[#2E7D5D]" />
                    </div>

                    {/* Character 2 (Male Student / Main) */}
                    <div className="w-18 h-22 sm:w-20 sm:h-24 rounded-t-full bg-[#0D684E] text-white flex flex-col items-center justify-center p-1 relative z-10 shadow-md border-2 border-white">
                      <div className="w-8 h-8 rounded-full bg-[#FDBA74] mb-0.5 border border-amber-300 flex items-center justify-center">
                        <div className="w-5 h-2.5 rounded-full bg-[#1F2937] -mt-3.5" />
                      </div>
                      <div className="w-12 h-8 rounded-t-xl bg-[#148364] flex items-center justify-center">
                        <CategoryIcon className="w-4 h-4 text-emerald-100" />
                      </div>
                    </div>

                    {/* Character 3 (Student / Youth) */}
                    <div className="w-14 h-16 sm:w-16 sm:h-18 rounded-t-full bg-[#1D5F49] text-white flex flex-col items-center justify-center p-1 relative shadow-sm border-2 border-white">
                      <div className="w-6 h-6 rounded-full bg-[#FED7AA] mb-0.5 border border-amber-300" />
                      <div className="w-8 h-5 rounded-t-lg bg-[#2563EB]" />
                    </div>
                  </div>
                </div>

                {/* Decorative background foliage/bubbles */}
                <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-emerald-200/40 pointer-events-none blur-sm" />
                <div className="absolute top-2 right-4 w-12 h-12 rounded-full bg-white/40 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. HORIZONTAL 6-TAB NAVIGATION                           */}
        {/* ======================================================== */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-6 sm:space-x-8 min-w-max pb-px">
            
            {/* Tab 1: Overview */}
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3.5 flex items-center gap-2 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === "overview"
                  ? "text-[#0E7054] font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isHindi ? "अवलोकन" : "Overview"}</span>
              {activeTab === "overview" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E7054] rounded-full" />
              )}
            </button>

            {/* Tab 2: Eligibility */}
            <button
              onClick={() => setActiveTab("eligibility")}
              className={`pb-3.5 flex items-center gap-2 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === "eligibility"
                  ? "text-[#0E7054] font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isHindi ? "पात्रता" : "Eligibility"}</span>
              {activeTab === "eligibility" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E7054] rounded-full" />
              )}
            </button>

            {/* Tab 3: Benefits */}
            <button
              onClick={() => setActiveTab("benefits")}
              className={`pb-3.5 flex items-center gap-2 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === "benefits"
                  ? "text-[#0E7054] font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>{isHindi ? "मुख्य लाभ" : "Benefits"}</span>
              {activeTab === "benefits" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E7054] rounded-full" />
              )}
            </button>

            {/* Tab 4: Required Documents */}
            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-3.5 flex items-center gap-2 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === "documents"
                  ? "text-[#0E7054] font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isHindi ? "आवश्यक दस्तावेज" : "Required Documents"}</span>
              {activeTab === "documents" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E7054] rounded-full" />
              )}
            </button>

            {/* Tab 5: How to Apply */}
            <button
              onClick={() => setActiveTab("how_to_apply")}
              className={`pb-3.5 flex items-center gap-2 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === "how_to_apply"
                  ? "text-[#0E7054] font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isHindi ? "आवेदन कैसे करें" : "How to Apply"}</span>
              {activeTab === "how_to_apply" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E7054] rounded-full" />
              )}
            </button>

            {/* Tab 6: Contact & Help */}
            <button
              onClick={() => setActiveTab("contact")}
              className={`pb-3.5 flex items-center gap-2 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === "contact"
                  ? "text-[#0E7054] font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isHindi ? "सहायता व संपर्क" : "Contact & Help"}</span>
              {activeTab === "contact" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E7054] rounded-full" />
              )}
            </button>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. MAIN CONTENT 2-COLUMN GRID                            */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ------------------------------------------------------ */}
          {/* LEFT COLUMN: Main Tab Content (~67% width)             */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ==================================================== */}
            {/* TAB: OVERVIEW (Exact Look as User's Screenshot)      */}
            {/* ==================================================== */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Card 1: About the Scheme */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {isHindi ? "योजना के बारे में" : "About the Scheme"}
                    </h2>
                  </div>

                  <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed">
                    {isHindi ? scheme.detailed_description_hi : scheme.detailed_description_en}
                  </p>
                </div>

                {/* Card 2: Key Benefits */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {isHindi ? "मुख्य लाभ" : "Key Benefits"}
                    </h2>
                  </div>

                  {/* 2 Side-by-Side Mint Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Benefit Box 1 */}
                    <div className="bg-[#EEF8F3] border border-[#D2EDD9] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-white text-emerald-700 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                        <Coins className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-black text-gray-900">
                          {getLocalizedBenefit(scheme, isHindi)}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 leading-snug">
                          {isHindi
                            ? "वित्तीय सहायता राशि (पाठ्यक्रम व स्तर अनुसार)"
                            : "Scholarship amount (varies by course and level)"}
                        </div>
                      </div>
                    </div>

                    {/* Benefit Box 2 */}
                    <div className="bg-[#EEF8F3] border border-[#D2EDD9] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-white text-emerald-700 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-black text-gray-900">
                          {catMeta.applicableFor}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 leading-snug">
                          {catMeta.applicableSubtitle}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card 3: Who Can Apply? */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {isHindi ? "कौन आवेदन कर सकता है?" : "Who Can Apply?"}
                    </h2>
                  </div>

                  <div className="space-y-3 pt-1">
                    {whoCanApplyList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ==================================================== */}
            {/* TAB: ELIGIBILITY                                     */}
            {/* ==================================================== */}
            {activeTab === "eligibility" && (
              <div className="space-y-6">
                <WhyYouQualifyAccordion
                  scheme={scheme}
                  onCheckEligibility={onCheckEligibility}
                />
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB: BENEFITS                                        */}
            {/* ==================================================== */}
            {activeTab === "benefits" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-emerald-600" />
                    <span>{isHindi ? "विस्तृत लाभ व वित्तीय सहायता" : "Detailed Benefits & Disbursement"}</span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isHindi
                      ? "लाभार्थी के आधार लिंक बैंक खाते में प्रत्यक्ष लाभ अंतरण (DBT) के माध्यम से।"
                      : "Direct Benefit Transfer (DBT) directly into the verified bank account of the beneficiary."}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {isHindi ? "अनुदान व राशि विवरण" : "Financial Support Breakdown"}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900">
                    {getLocalizedBenefit(scheme, isHindi)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isHindi ? "प्रकार: " : "Benefit Category: "}
                    <span className="font-semibold text-gray-800 uppercase">
                      {scheme.benefit_type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-gray-900">
                    {isHindi ? "लाभ प्राप्त करने की प्रक्रिया" : "Disbursement Features"}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isHindi ? "100% पारदर्शी प्रत्यक्ष लाभ अंतरण (DBT)" : "100% transparent Direct Benefit Transfer (DBT)"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isHindi ? "सीधे छात्र/नागरिक के बैंक खाते में जमा" : "Direct deposit to applicant's Aadhaar-linked bank account"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isHindi ? "कोई बिचौलिया या कमीशन नहीं" : "Zero middlemen and zero deduction"}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB: REQUIRED DOCUMENTS                              */}
            {/* ==================================================== */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <DocumentChecklist documents={scheme.documents} />
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB: HOW TO APPLY                                    */}
            {/* ==================================================== */}
            {activeTab === "how_to_apply" && (
              <div className="space-y-6">
                <HowToApplySection
                  scheme={scheme}
                  onLocateCsc={onLocateCsc}
                />
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB: CONTACT & HELP                                  */}
            {/* ==================================================== */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <PhoneCall className="w-5 h-5 text-primary" />
                      <span>{isHindi ? "मंत्रालय हेल्पलाइन व संपर्क सूत्र" : "Official Support & Helpdesk"}</span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      {isHindi ? "किसी भी तकनीकी या आवेदन संबंधी समस्या हेतु संपर्क करें।" : "Reach out for technical or application guidance."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                      <div className="text-xs text-gray-500 font-medium">
                        {isHindi ? "नोडल मंत्रालय" : "Nodal Ministry"}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {cleanMinistry}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                      <div className="text-xs text-gray-500 font-medium">
                        {isHindi ? "आधिकारिक पोर्टल" : "Official Website"}
                      </div>
                      <a
                        href={scheme.official_portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>{cleanDomain}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {scheme.faqs && scheme.faqs.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="font-bold text-sm text-gray-900">
                        {isHindi ? "अक्सर पूछे जाने वाले सवाल (FAQs)" : "Frequently Asked Questions"}
                      </h3>
                      <div className="space-y-3">
                        {scheme.faqs.map((faq, fIdx) => (
                          <div key={fIdx} className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1.5">
                            <div className="text-sm font-semibold text-gray-900">
                              {isHindi ? faq.question_hi : faq.question_en}
                            </div>
                            <div className="text-xs text-gray-600 leading-relaxed">
                              {isHindi ? faq.answer_hi : faq.answer_en}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ------------------------------------------------------ */}
          {/* RIGHT COLUMN: Sticky Sidebar (~33% width)              */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            {/* ==================================================== */}
            {/* SIDEBAR CARD 1: Quick Information                    */}
            {/* ==================================================== */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
              
              {/* Card Header */}
              <div className="flex items-center gap-2.5 pb-1 border-b border-gray-100">
                <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-base text-gray-900">
                  {isHindi ? "त्वरित जानकारी" : "Quick Information"}
                </h3>
              </div>

              {/* Attributes List */}
              <div className="space-y-3.5 text-xs sm:text-sm">
                
                {/* Ministry */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center text-gray-500 gap-2 shrink-0">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{isHindi ? "मंत्रालय" : "Ministry"}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-right">
                    {cleanMinistry}
                  </div>
                </div>

                {/* Beneficiary */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center text-gray-500 gap-2 shrink-0">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{isHindi ? "लाभार्थी" : "Beneficiary"}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-right">
                    {catMeta.beneficiary}
                  </div>
                </div>

                {/* Benefit Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center text-gray-500 gap-2 shrink-0">
                    <Coins className="w-4 h-4 text-gray-400" />
                    <span>{isHindi ? "लाभ राशि" : "Benefit Amount"}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-right">
                    {getLocalizedBenefit(scheme, isHindi)}
                  </div>
                </div>

                {/* Applicable For */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center text-gray-500 gap-2 shrink-0">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{isHindi ? "पात्र वर्ग" : "Applicable For"}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-right">
                    {catMeta.applicableFor}
                  </div>
                </div>

                {/* Application Mode */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center text-gray-500 gap-2 shrink-0">
                    <Laptop className="w-4 h-4 text-gray-400" />
                    <span>{isHindi ? "आवेदन का माध्यम" : "Application Mode"}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-right">
                    {isHindi ? "ऑनलाइन (NSP / राज्य पोर्टल)" : "Online (State/NSP Portal)"}
                  </div>
                </div>

                {/* Official Website */}
                <div className="flex items-start justify-between gap-3 pt-1 border-t border-gray-100">
                  <div className="flex items-center text-gray-500 gap-2 shrink-0">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>{isHindi ? "आधिकारिक वेबसाइट" : "Official Website"}</span>
                  </div>
                  <a
                    href={scheme.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#1A73E8] hover:underline flex items-center gap-1 text-right"
                  >
                    <span>{cleanDomain}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>

            {/* ==================================================== */}
            {/* SIDEBAR CARD 2: Eligibility Callout Banner           */}
            {/* ==================================================== */}
            {isDocsVerified ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-[#0D684E] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm animate-in zoom-in-95">
                <div className="w-10 h-10 rounded-full bg-[#0D684E] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-300 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0D684E] flex items-center gap-1.5">
                    <span>{isHindi ? "दस्तावेज़ AI सत्यापित: 100% Ready to Apply" : "Documents AI Verified: 100% Ready to Apply"}</span>
                  </div>
                  <div className="text-xs text-emerald-800 font-medium mt-0.5">
                    {isHindi
                      ? "आपके सभी अनिवार्य कागजात सत्यापित हैं।"
                      : "All mandatory credentials verified successfully."}
                  </div>
                </div>
              </div>
            ) : isEligibleUser ? (
              <div className="bg-[#EAF7F0] border border-[#BFE8CF] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-[#137351] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {isHindi ? "आप इस योजना के लिए पात्र हो सकते हैं" : "You may be eligible for this scheme"}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {isHindi
                      ? "आपके द्वारा दी गई जानकारी के आधार पर।"
                      : "Based on the information you provided."}
                  </div>
                </div>
              </div>
            ) : null}

            {/* ==================================================== */}
            {/* SIDEBAR CARD 3: Action Buttons (Apply & Save)        */}
            {/* ==================================================== */}
            <div className="space-y-3">
              
              {/* Primary Apply Now Button */}
              <a
                href={scheme.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer ${
                  isDocsVerified
                    ? "bg-gradient-to-r from-[#0D684E] to-[#148364] hover:from-[#094D3A] hover:to-[#0D684E] ring-2 ring-emerald-500/40"
                    : "bg-[#0D684E] hover:bg-[#094D3A]"
                }`}
              >
                <span>{isHindi ? "अभी आवेदन करें" : "Apply Now"}</span>
                <ArrowLeft className="w-4 h-4 rotate-180 stroke-[2.5]" />
              </a>

              {/* AI Document Verification Button */}
              <button
                type="button"
                onClick={() => setIsDocModalOpen(true)}
                className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xs transition-all hover:scale-[1.01] cursor-pointer group ${
                  isDocsVerified
                    ? "bg-emerald-100/90 hover:bg-emerald-200/80 border-2 border-emerald-600 text-emerald-950"
                    : "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 hover:from-emerald-100 hover:to-teal-100 border-2 border-[#0D684E] text-[#0D684E]"
                }`}
              >
                {isDocsVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#0D684E] group-hover:rotate-12 transition-transform" />
                )}
                <span>
                  {isDocsVerified
                    ? isHindi ? "दस्तावेज़ सत्यापित (समीक्षा करें)" : "Documents Verified (Review)"
                    : isHindi ? "AI दस्तावेज़ सत्यापन" : "Verify Documents with AI"}
                </span>
                <ShieldCheck className="w-4 h-4 text-[#0D684E] ml-1" />
              </button>

              {/* Secondary Save for Later Button */}
              <button
                type="button"
                onClick={() => toggleSaveScheme(scheme.id)}
                className={`w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                  isSaved
                    ? "bg-emerald-50 border-2 border-[#0D684E] text-[#0D684E]"
                    : "bg-white border-2 border-gray-900 hover:bg-gray-50 text-gray-900"
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-[#0D684E]" />
                    <span>{isHindi ? "सहेजी गई योजना" : "Saved in Profile"}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>{isHindi ? "बाद के लिए सहेजें" : "Save for Later"}</span>
                  </>
                )}
              </button>

              {/* Share link option */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isCopied ? (isHindi ? "लिंक कॉपी हो गया!" : "Link copied!") : (isHindi ? "योजना साझा करें" : "Share Scheme")}</span>
              </button>

            </div>

            {/* ==================================================== */}
            {/* SIDEBAR CARD 4: Need Help? / CSC Center Link         */}
            {/* ==================================================== */}
            <div className="bg-[#F0F5FF] border border-[#D4E2FB] rounded-2xl p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DDE9FF] text-[#1D63ED] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {isHindi ? "सहायता चाहिए?" : "Need Help?"}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {isHindi
                      ? "सहायता के लिए अपने नजदीकी सीएससी केंद्र पर जाएं या सारथी से चैट करें।"
                      : "Visit your nearest CSC center or chat with Sarathi for assistance."}
                  </div>
                </div>
              </div>

              {/* Find CSC Center CTA */}
              <button
                type="button"
                onClick={onLocateCsc}
                className="w-full py-2.5 px-4 rounded-xl border border-blue-300 bg-white hover:bg-blue-50/80 text-blue-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>{isHindi ? "सीएससी केंद्र खोजें" : "Find CSC Center"}</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* AI Document Verification Modal */}
      <DocumentVerificationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        scheme={scheme}
        onVerificationComplete={(allVerified) => setIsDocsVerified(allVerified)}
      />
    </div>
  );
};

export default SchemeDetailPage;
