import React from "react";
import { useApp } from "@/context/AppContext";
import { Occupation } from "@/types/schema";
import {
  Sprout,
  GraduationCap,
  Briefcase,
  Hammer,
  Heart,
  Wrench,
  Clock,
  Building,
  Landmark,
} from "lucide-react";

export interface Step2Data {
  occupation: Occupation;
  land_holding_acres?: number;
}

interface WizardStep2Props {
  data: Step2Data;
  onChange: (updated: Partial<Step2Data>) => void;
}

interface OccupationItem {
  id: Occupation;
  nameHi: string;
  nameEn: string;
  descHi: string;
  descEn: string;
  icon: React.ReactNode;
}

export const WizardStep2: React.FC<WizardStep2Props> = ({ data, onChange }) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const occupations: OccupationItem[] = [
    {
      id: "farmer",
      nameHi: "किसान / कृषक",
      nameEn: "Farmer / Agriculture",
      descHi: "कृषि, बागवानी, पशुपालन या डेयरी",
      descEn: "Cultivation, dairy, livestock, fisheries",
      icon: <Sprout className="w-4 h-4 text-[#165D51]" />,
    },
    {
      id: "student",
      nameHi: "विद्यार्थी / छात्र",
      nameEn: "Student",
      descHi: "स्कूल, कॉलेज या उच्च शिक्षा",
      descEn: "School, College, Higher Ed, Scholarships",
      icon: <GraduationCap className="w-4 h-4 text-[#165D51]" />,
    },
    {
      id: "business_self_employed",
      nameHi: "स्वरोजगार / व्यापारी",
      nameEn: "Business / Self-Employed",
      descHi: "दुकानदार, सूक्ष्म उद्यम, मुद्रा ऋण",
      descEn: "Shopkeeper, Micro enterprise, Mudra loans",
      icon: <Briefcase className="w-4 h-4 text-[#165D51]" />,
    },
    {
      id: "daily_wage_laborer",
      nameHi: "श्रमिक / दैनिक मजदूर",
      nameEn: "Daily Wage Laborer",
      descHi: "निर्माण कार्य, कृषि मजदूरी या असंगठित",
      descEn: "Construction worker, unorganized labor",
      icon: <Hammer className="w-4 h-4 text-[#165D51]" />,
    },
    {
      id: "homemaker",
      nameHi: "गृहिणी",
      nameEn: "Homemaker",
      descHi: "पारिवारिक देखभाल, महिला कल्याण",
      descEn: "Domestic caregiver, Women welfare",
      icon: <Heart className="w-4 h-4 text-[#165D51]" />,
    },
    {
      id: "artisan_craftsperson",
      nameHi: "शिल्पकार / कारीगर",
      nameEn: "Artisan / Craftsperson",
      descHi: "हस्तशिल्प, बढ़ई, PM विश्वकर्मा",
      descEn: "Traditional artisan, PM Vishwakarma",
      icon: <Wrench className="w-4 h-4 text-[#165D51]" />,
    },
    {
      id: "unemployed",
      nameHi: "बेरोजगार युवा",
      nameEn: "Unemployed Youth",
      descHi: "कौशल प्रशिक्षण, PMKVY योजनाएं",
      descEn: "Job seeker, skill training programs",
      icon: <Clock className="w-4 h-4 text-[#165D51]" />,
    },
    {
      id: "employed_private",
      nameHi: "निजी कर्मचारी",
      nameEn: "Private Employee",
      descHi: "निजी संस्थान या कंपनी में कार्यरत",
      descEn: "Employed in private company",
      icon: <Building className="w-4 h-4 text-[#165D51]" />,
    },
    {
      id: "employed_government",
      nameHi: "सरकारी कर्मचारी",
      nameEn: "Govt Employee",
      descHi: "सरकारी विभाग या उपक्रम में सेवारत",
      descEn: "Government sector employee",
      icon: <Landmark className="w-4 h-4 text-[#165D51]" />,
    },
  ];

  const quickLandHoldings = [0, 1, 2, 5, 10];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          {isHindi ? "अपना मुख्य व्यवसाय चुनें" : "Select Your Occupation"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {occupations.map((item) => {
            const isSelected = data.occupation === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ occupation: item.id })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3 select-none ${
                  isSelected
                    ? "border-[#2D7A58] bg-[#F0F8F4] text-[#165D51] ring-1 ring-[#2D7A58]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isSelected ? "bg-white shadow-xs" : "bg-gray-100"
                }`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold truncate ${
                    isSelected ? "text-[#165D51]" : "text-gray-900"
                  }`}>
                    {isHindi ? item.nameHi : item.nameEn}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-snug">
                    {isHindi ? item.descHi : item.descEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional Farmer Land Holding Section */}
      {data.occupation === "farmer" && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-[#F0F8F4] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sprout className="w-4 h-4 text-[#165D51]" />
              <label className="text-sm font-semibold text-gray-900">
                {isHindi ? "कुल कृषि भूमि स्वामित्व" : "Agricultural Land Holding"}
              </label>
            </div>
            <div className="px-3 py-1 rounded-lg bg-white border border-[#2D7A58]/30 font-bold text-sm text-[#165D51] shadow-xs">
              {data.land_holding_acres ?? 0} {isHindi ? "एकड़" : "acres"}
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={data.land_holding_acres ?? 0}
              onChange={(e) => onChange({ land_holding_acres: parseFloat(e.target.value) || 0 })}
              className="w-full h-11 px-4 pr-16 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:outline-none focus:border-[#165D51] focus:ring-2 focus:ring-[#165D51]/20 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-normal pointer-events-none">
              {isHindi ? "एकड़" : "acres"}
            </span>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs text-gray-500">{isHindi ? "त्वरित चयन:" : "Presets:"}</span>
            {quickLandHoldings.map((acres) => (
              <button
                key={acres}
                type="button"
                onClick={() => onChange({ land_holding_acres: acres })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  (data.land_holding_acres ?? 0) === acres
                    ? "bg-[#165D51] text-white border-[#165D51]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {acres} {isHindi ? "एकड़" : "acres"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
