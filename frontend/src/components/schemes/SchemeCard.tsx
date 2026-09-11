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

        {/* Description */}
        <p className="text-xs sm:text-[13px] text-gray-500 line-clamp-2 leading-relaxed mt-1.5">
          {isHindi ? scheme.short_summary_hi : scheme.short_summary_en}
        </p>
      </div>

      {/* Bottom: Benefit + Action Arrow */}
      <div className="flex items-end justify-between pt-2 border-t border-gray-100/80 gap-3">
        <div>
          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
            {isHindi ? "लाभ" : "Benefit"}
          </div>
          <div className="text-sm sm:text-[15px] font-bold text-[#165D51] mt-0.5">
            {scheme.benefit_amount_text}
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
