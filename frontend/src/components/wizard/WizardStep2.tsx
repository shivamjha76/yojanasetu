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
  Sparkles,
  Layers,
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
      descHi: "कृषि, बागवानी, पशुपालन या मत्स्य पालन",
      descEn: "Cultivation, dairy, fisheries, animal husbandry",
      icon: <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: "student",
      nameHi: "विद्यार्थी / छात्र",
      nameEn: "Student",
      descHi: "स्कूल, कॉलेज, उच्च शिक्षा या प्रतियोगी परीक्षा",
      descEn: "School, College, Higher Ed, Scholarships",
      icon: <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    {
      id: "business_self_employed",
      nameHi: "व्यापारी / स्वरोजगार",
      nameEn: "Business / Self-Employed",
      descHi: "दुकानदार, सूक्ष्म उद्यम, रेहड़ी-पटरी या MSME",
      descEn: "Shopkeeper, Micro enterprise, Mudra loans",
      icon: <Briefcase className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
    },
    {
      id: "daily_wage_laborer",
      nameHi: "श्रमिक / दैनिक मजदूर",
      nameEn: "Daily Wage Laborer",
      descHi: "निर्माण कार्य, कृषि मजदूरी या असंगठित क्षेत्र",
      descEn: "Construction worker, unorganized labor",
      icon: <Hammer className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      id: "homemaker",
      nameHi: "गृहिणी",
      nameEn: "Homemaker",
      descHi: "पारिवारिक देखभाल, महिला कल्याण योजनाएं",
      descEn: "Domestic caregiver, Women welfare schemes",
      icon: <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
    },
    {
      id: "artisan_craftsperson",
      nameHi: "शिल्पकार / कारीगर",
      nameEn: "Artisan / Craftsperson",
      descHi: "हस्तशिल्प, बुनकर, बढ़ई, पारंपरिक कार्य",
      descEn: "Traditional craftsman, PM Vishwakarma",
      icon: <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    },
    {
      id: "unemployed",
      nameHi: "बेरोजगार युवा",
      nameEn: "Unemployed Youth",
      descHi: "रोजगार की तलाश में, कौशल प्रशिक्षण योजनाएं",
      descEn: "Looking for job, PMKVY skill training",
      icon: <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    },
    {
      id: "employed_private",
      nameHi: "निजी कर्मचारी",
      nameEn: "Private Sector Employee",
      descHi: "कंपनी या प्राइवेट संस्थान में सेवारत",
      descEn: "Employed in private company or enterprise",
      icon: <Building className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
    },
    {
      id: "employed_government",
      nameHi: "सरकारी कर्मचारी",
      nameEn: "Government Employee",
      descHi: "केंद्र या राज्य सरकार में स्थायी/संविदा पद",
      descEn: "Central/State government servant",
      icon: <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      id: "other",
      nameHi: "अन्य व्यवसाय",
      nameEn: "Other Occupation",
      descHi: "अन्य कोई कार्य या पेशा",
      descEn: "Any other occupation or freelancing",
      icon: <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
    },
  ];

  const quickLandHoldings = [0, 1, 2, 5, 10];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-300">
      {/* Step Heading */}
      <div className="border-b border-border/60 pb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span>{isHindi ? "चरण 2: आजीविका एवं व्यवसाय (Occupation)" : "Step 2: Occupation & Livelihood"}</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isHindi
            ? "सरकारी योजनाएं आपके मुख्य कार्यक्षेत्र और आजीविका के अनुसार लक्षित होती हैं。"
            : "Welfare programs provide direct subsidies, training, and loans matching your primary livelihood."}
        </p>
      </div>

      {/* 1. Occupation Cards Grid */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground block">
          {isHindi ? "अपना प्राथमिक व्यवसाय चुनें" : "Select Your Primary Occupation"}
          <span className="text-destructive ml-1">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {occupations.map((item) => {
            const isSelected = data.occupation === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onChange({ occupation: item.id })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-start space-x-3 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="p-2 rounded-lg bg-muted/60 shrink-0 mt-0.5">{item.icon}</div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {isHindi ? item.nameHi : item.nameEn}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                    {isHindi ? item.descHi : item.descEn}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Conditional Farmer Land Holding Section */}
      {data.occupation === "farmer" && (
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <label className="text-sm font-bold text-foreground">
                  {isHindi ? "कृषि भूमि का रकबा (एकड़ में)" : "Cultivable Land Holding (Acres)"}
                </label>
                <p className="text-[11px] text-muted-foreground">
                  {isHindi
                    ? "पीएम किसान सम्मान निधि और फसल बीमा पात्रता के लिए आवश्यक"
                    : "Crucial for PM-KISAN ₹6,000/yr and crop insurance benefits"}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-base border border-emerald-500/20">
              {data.land_holding_acres ?? 0} {isHindi ? "एकड़" : "Acres"}
            </div>
          </div>

          {/* Land Range Slider */}
          <input
            type="range"
            min="0"
            max="25"
            step="0.5"
            value={data.land_holding_acres ?? 0}
            onChange={(e) => onChange({ land_holding_acres: parseFloat(e.target.value) || 0 })}
            className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-muted-foreground mr-1">
              {isHindi ? "त्वरित चयन:" : "Quick select:"}
            </span>
            {quickLandHoldings.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ land_holding_acres: val })}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  (data.land_holding_acres ?? 0) === val
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-card text-muted-foreground border-border hover:border-emerald-500/40 hover:text-foreground"
                }`}
              >
                {val === 0 ? (isHindi ? "भूमिहीन (0)" : "Landless (0)") : `${val} ${isHindi ? "एकड़" : "acres"}`}
              </button>
            ))}
          </div>

          {(data.land_holding_acres ?? 0) <= 5 && (data.land_holding_acres ?? 0) > 0 && (
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              ✓ {isHindi ? "लघु एवं सीमांत किसान श्रेणी (< 5 एकड़) — PM-KISAN के पूर्ण पात्र।" : "Small & Marginal Farmer category (< 5 acres) — 100% eligible for PM-KISAN."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
