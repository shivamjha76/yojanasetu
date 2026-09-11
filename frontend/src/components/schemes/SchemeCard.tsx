import React from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import {
  GraduationCap,
  Heart,
  Briefcase,
  Home,
  Sprout,
  Shield,
  Users,
  Coins,
  ArrowRight,
} from "lucide-react";
import { getLocalizedBenefit } from "@/utils/schemeLocalization";

interface SchemeCardProps {
  scheme: Scheme;
  matchPercentage?: number;
  isEligible?: boolean;
  onViewDetails?: (id: string) => void;
  onCheckEligibility?: (id: string) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onViewDetails = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  // Category styling helper matching reference screenshot
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "education_scholarships":
        return {
          icon: <GraduationCap className="w-6 h-6 text-[#2563EB]" />,
          iconBg: "bg-[#EBF3FF]",
          pillBg: "bg-[#EBF3FF] text-[#2563EB]",
          labelEn: "Education",
          labelHi: "शिक्षा",
        };
      case "healthcare":
        return {
          icon: <Heart className="w-6 h-6 text-[#E11D48] fill-current" />,
          iconBg: "bg-[#FDF2F4]",
          pillBg: "bg-[#FDF2F4] text-[#E11D48]",
          labelEn: "Healthcare",
          labelHi: "स्वास्थ्य",
        };
      case "skills_employment":
        return {
          icon: <Briefcase className="w-6 h-6 text-[#7C3AED]" />,
          iconBg: "bg-[#F3E8FF]",
          pillBg: "bg-[#F3E8FF] text-[#7C3AED]",
          labelEn: "Skill Development",
          labelHi: "कौशल विकास",
        };
      case "housing_urban":
        return {
          icon: <Home className="w-6 h-6 text-[#D97706]" />,
          iconBg: "bg-[#FEF3E8]",
          pillBg: "bg-[#FEF3E8] text-[#D97706]",
          labelEn: "Housing",
          labelHi: "आवास",
        };
      case "agriculture":
        return {
          icon: <Sprout className="w-6 h-6 text-[#165D51]" />,
          iconBg: "bg-[#EAF7EE]",
          pillBg: "bg-[#EAF7EE] text-[#165D51]",
          labelEn: "Agriculture",
          labelHi: "कृषि",
        };
      case "social_security_pensions":
        return {
          icon: <Shield className="w-6 h-6 text-[#6366F1]" />,
          iconBg: "bg-[#EDE9FE]",
          pillBg: "bg-[#EDE9FE] text-[#6366F1]",
          labelEn: "Social Security",
          labelHi: "सामाजिक सुरक्षा",
        };
      case "women_child":
        return {
          icon: <Users className="w-6 h-6 text-[#DB2777]" />,
          iconBg: "bg-[#FDF2F8]",
          pillBg: "bg-[#FDF2F8] text-[#DB2777]",
          labelEn: "Women & Child",
          labelHi: "महिला एवं बाल",
        };
      default:
        return {
          icon: <Coins className="w-6 h-6 text-[#4F46E5]" />,
          iconBg: "bg-[#EEF2FF]",
          pillBg: "bg-[#EEF2FF] text-[#4F46E5]",
          labelEn: "Financial Support",
          labelHi: "वित्तीय सहायता",
        };
    }
  };

  const theme = getCategoryTheme(scheme.category);

  // Curated concise 3-4 word taglines per scheme id (both English & Hindi)
  const SCHEME_SHORT_TAGLINES: Record<string, { en: string; hi: string }> = {
    "pm-kisan": {
      en: "Direct Income Support",
      hi: "प्रत्यक्ष आर्थिक सहायता",
    },
    "ayushman-bharat-pmjay": {
      en: "Free Cashless Health Insurance",
      hi: "मुफ्त कैशलेस स्वास्थ्य बीमा",
    },
    "rajasthan-youth-skill-employment": {
      en: "Skill Development Support",
      hi: "कौशल प्रशिक्षण एवं भत्ता",
    },
    "pm-mudra-yojana": {
      en: "Collateral-Free Business Loans",
      hi: "बिना गारंटी व्यवसाय ऋण",
    },
    "sukanya-samriddhi-yojana": {
      en: "Girl Child Savings Scheme",
      hi: "सुकन्या सुरक्षित बचत योजना",
    },
    "pm-awas-yojana-urban-gramin": {
      en: "Pucca Housing Financial Aid",
      hi: "पक्का मकान निर्माण सहायता",
    },
    "post-matric-scholarship-sc-st-obc": {
      en: "Tuition Fee Reimbursement",
      hi: "छात्रवृत्ति एवं फीस प्रतिपूर्ति",
    },
    "national-apprenticeship-promotion-scheme": {
      en: "Industrial Apprenticeship & Stipend",
      hi: "औद्योगिक प्रशिक्षण व स्टाइपेंड",
    },
    "central-sector-merit-scholarship-college": {
      en: "Higher Education Merit Aid",
      hi: "मेधावी छात्र शिक्षा सहायता",
    },
    "pm-kaushal-vikas-yojana": {
      en: "Free Industry Skill Training",
      hi: "मुफ्त उद्योग कौशल प्रशिक्षण",
    },
    "free-coaching-scheme-sc-obc": {
      en: "Free Competitive Exam Coaching",
      hi: "मुफ्त प्रतियोगी परीक्षा कोचिंग",
    },
    "ladli-behna-yojana-mp": {
      en: "Monthly Women Financial Aid",
      hi: "मासिक महिला आर्थिक सहायता",
    },
    "indira-gandhi-divyangjan-pension": {
      en: "Monthly Disability Pension Support",
      hi: "मासिक दिव्यांग पेंशन सहायता",
    },
    "indira-gandhi-old-age-pension": {
      en: "Senior Citizen Monthly Pension",
      hi: "वरिष्ठ नागरिक मासिक पेंशन",
    },
    "pm-svanidhi-street-vendors": {
      en: "Street Vendor Micro Credit",
      hi: "स्ट्रीट वेंडर सस्ता ऋण",
    },
    "pm-matsya-sampada-yojana": {
      en: "Fisheries Government Capital Subsidy",
      hi: "मत्स्य पालन सरकारी सब्सिडी",
    },
    "atal-pension-yojana": {
      en: "Guaranteed Post-60 Monthly Pension",
      hi: "निश्चित मासिक वृद्धावस्था पेंशन",
    },
  };

  // Helper to strictly restrict description to 3-4 words max for any scheme
  const getShortDescription = (text: string, maxWords: number = 4): string => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;

    let selected = words.slice(0, maxWords);
    const danglingWords = new Set([
      "of", "and", "in", "to", "for", "the", "a", "an", "per", "with", "by", "on", "at", "up", "or", "across",
      "और", "एवं", "तथा", "व", "का", "के", "की", "को", "में", "से", "पर", "लिए", "हेतु"
    ]);

    if (selected.length > 3 && danglingWords.has(selected[selected.length - 1].toLowerCase())) {
      selected = selected.slice(0, 3);
    }

    return selected.join(" ").replace(/[,;:\-–—\.\s]+$/, "");
  };

  const getDisplayDescription = (): string => {
    const curated = SCHEME_SHORT_TAGLINES[scheme.id];
    if (curated) {
      return isHindi ? curated.hi : curated.en;
    }
    const rawText = isHindi ? scheme.short_summary_hi : scheme.short_summary_en;
    return getShortDescription(rawText, 4);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 hover:border-[#165D51]/30 hover:shadow-md transition-all p-6 flex flex-col justify-between min-h-[255px] space-y-4 group">
      <div>
        {/* Top: Icon + Category Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${theme.iconBg}`}>
            {theme.icon}
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${theme.pillBg}`}>
            {isHindi ? theme.labelHi : theme.labelEn}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(scheme.id)}
          className="text-base sm:text-[17px] font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#165D51] transition-colors cursor-pointer mt-4"
        >
          {isHindi ? scheme.name_hi : scheme.name_en}
        </h3>

        {/* Description - strictly 3 to 4 words max */}
        <p className="text-xs sm:text-[13px] text-gray-500 line-clamp-1 leading-relaxed mt-1.5 font-medium">
          {getDisplayDescription()}
        </p>
      </div>

      {/* Bottom: Benefit + Action Arrow */}
      <div className="flex items-end justify-between pt-2 border-t border-gray-100/80 gap-3">
        <div>
          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
            {isHindi ? "लाभ" : "Benefit"}
          </div>
          <div className="text-sm sm:text-[15px] font-bold text-[#165D51] mt-0.5">
            {getLocalizedBenefit(scheme, isHindi)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(scheme.id)}
          aria-label={isHindi ? "योजना विवरण देखें" : "View scheme details"}
          className="w-10 h-10 rounded-full bg-[#EAF7EE] text-[#165D51] hover:bg-[#165D51] hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs group-hover:scale-105"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

export default SchemeCard;
