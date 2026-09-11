import React from "react";
import { useApp } from "@/context/AppContext";
import { SocialCategory, RationCardType, MaritalStatus } from "@/types/schema";
import {
  Coins,
  Shield,
  CreditCard,
  HeartHandshake,
  Accessibility,
} from "lucide-react";

export interface Step3Data {
  category: SocialCategory;
  annual_income: number;
  ration_card_type?: RationCardType;
  marital_status?: MaritalStatus;
  is_differently_abled: boolean;
}

interface WizardStep3Props {
  data: Step3Data;
  onChange: (updated: Partial<Step3Data>) => void;
}

export const WizardStep3: React.FC<WizardStep3Props> = ({ data, onChange }) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const categories: Array<{ id: SocialCategory; labelHi: string; labelEn: string; descHi: string; descEn: string }> = [
    {
      id: "general",
      labelHi: "सामान्य (General)",
      labelEn: "General",
      descHi: "सभी सामान्य वर्ग योजनाएं",
      descEn: "Standard open welfare",
    },
    {
      id: "obc",
      labelHi: "ओबीसी (OBC)",
      labelEn: "OBC",
      descHi: "अन्य पिछड़ा वर्ग छात्रवृत्ति व ऋण",
      descEn: "Other Backward Classes",
    },
    {
      id: "sc",
      labelHi: "एससी (SC)",
      labelEn: "SC",
      descHi: "अनुसूचित जाति विशेष योजनाएं व 100% छात्रवृत्ति",
      descEn: "Scheduled Caste initiatives",
    },
    {
      id: "st",
      labelHi: "एसटी (ST)",
      labelEn: "ST",
      descHi: "अनुसूचित जनजाति विकास एवं छात्रवृत्ति",
      descEn: "Scheduled Tribe initiatives",
    },
    {
      id: "ews",
      labelHi: "ईडब्ल्यूएस (EWS)",
      labelEn: "EWS",
      descHi: "आर्थिक रूप से कमजोर सामान्य वर्ग",
      descEn: "Economically Weaker Section",
    },
  ];

  const incomeSlabs = [
    { label: "< ₹1,00,000", value: 80000 },
    { label: "₹1,80,000", value: 180000 },
    { label: "₹2,50,000", value: 250000 },
    { label: "₹5,00,000", value: 500000 },
    { label: "₹8,00,000", value: 800000 },
  ];

  const rationCardOptions: Array<{ id: RationCardType; labelHi: string; labelEn: string; color: string }> = [
    { id: "antyodaya", labelHi: "अन्त्योदय (AAY)", labelEn: "Antyodaya (AAY)", color: "border-pink-300" },
    { id: "bpl", labelHi: "बीपीएल (BPL)", labelEn: "BPL (Yellow/Blue)", color: "border-amber-300" },
    { id: "apl", labelHi: "एपीएल (APL)", labelEn: "APL (White)", color: "border-slate-300" },
    { id: "none", labelHi: "कोई नहीं (None)", labelEn: "No Ration Card", color: "border-border" },
  ];

  const maritalOptions: Array<{ id: MaritalStatus; labelHi: string; labelEn: string }> = [
    { id: "single", labelHi: "अविवाहित (Single)", labelEn: "Single" },
    { id: "married", labelHi: "विवाहित (Married)", labelEn: "Married" },
    { id: "widowed", labelHi: "विधवा / विधुर (Widowed)", labelEn: "Widowed" },
    { id: "divorced", labelHi: "परित्यक्ता / तलाकशुदा", labelEn: "Divorced" },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-300">
      {/* Step Heading */}
      <div className="border-b border-border/60 pb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          <span>{isHindi ? "चरण 3: आय, सामाजिक श्रेणी व अन्य विवरण" : "Step 3: Income, Social Category & Details"}</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isHindi
            ? "अधिकांश सरकारी लाभ परिवार की वार्षिक आय और सामाजिक वर्ग के आधार पर स्वीकृत होते हैं。"
            : "Income slabs and social categories determine exact eligibility thresholds for DBT welfare."}
        </p>
      </div>

      {/* 1. Social Category Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-primary" />
          <span>{isHindi ? "सामाजिक वर्ग (Social Category)" : "Social Category"}</span>
          <span className="text-destructive">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {categories.map((cat) => {
            const isSelected = data.category === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onChange({ category: cat.id })}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {isHindi ? cat.labelHi : cat.labelEn}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {isHindi ? cat.descHi : cat.descEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Annual Family Income with Slider & Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            {isHindi ? "परिवार की कुल वार्षिक आय (Annual Family Income)" : "Annual Family Income"}
            <span className="text-destructive ml-1">*</span>
          </label>
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-base border border-emerald-500/20">
            {formatCurrency(data.annual_income)} {isHindi ? "/ वर्ष" : "/ yr"}
          </div>
        </div>

        {/* Income Range Slider */}
        <input
          type="range"
          min="0"
          max="1200000"
          step="10000"
          value={data.annual_income}
          onChange={(e) => onChange({ annual_income: parseInt(e.target.value, 10) || 0 })}
          className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />

        {/* Quick Income Slabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground mr-1">
            {isHindi ? "त्वरित स्लैब:" : "Quick slabs:"}
          </span>
          {incomeSlabs.map((slab) => (
            <button
              key={slab.value}
              type="button"
              onClick={() => onChange({ annual_income: slab.value })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                data.annual_income === slab.value
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-card text-muted-foreground border-border hover:border-emerald-500/40 hover:text-foreground"
              }`}
            >
              {slab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Ration Card Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-primary" />
          <span>{isHindi ? "राशन कार्ड का प्रकार (Ration Card)" : "Ration Card Type"}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {rationCardOptions.map((opt) => {
            const isSelected = (data.ration_card_type || "none") === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onChange({ ration_card_type: opt.id })}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {isHindi ? opt.labelHi : opt.labelEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Marital Status & Differently Abled Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Marital Status */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-primary" />
            <span>{isHindi ? "वैवाहिक स्थिति (Marital Status)" : "Marital Status"}</span>
          </label>
          <select
            value={data.marital_status || "single"}
            onChange={(e) => onChange({ marital_status: e.target.value as MaritalStatus })}
            className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            {maritalOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {isHindi ? opt.labelHi : opt.labelEn}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            {isHindi ? "लाड़ली बहना व विधवा पेंशन पात्रता हेतु आवश्यक" : "Used for widow pension & women cash transfer eligibility"}
          </p>
        </div>

        {/* Differently Abled Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Accessibility className="w-4 h-4 text-primary" />
            <span>{isHindi ? "दिव्यांगजन स्थिति (Differently-Abled)" : "Differently-Abled Status"}</span>
          </label>
          <div className="grid grid-cols-2 gap-2 h-11">
            <button
              type="button"
              onClick={() => onChange({ is_differently_abled: false })}
              className={`rounded-xl border text-xs font-semibold transition-all ${
                !data.is_differently_abled
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {isHindi ? "नहीं (No)" : "No"}
            </button>
            <button
              type="button"
              onClick={() => onChange({ is_differently_abled: true })}
              className={`rounded-xl border text-xs font-semibold transition-all ${
                data.is_differently_abled
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {isHindi ? "हाँ (40%+ दिव्यांग)" : "Yes (40%+ Divyang)"}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isHindi ? "दिव्यांगजन पेंशन व सहायता उपकरण हेतु आवश्यक" : "Qualifies for Divyangjan pension & assistive grants"}
          </p>
        </div>
      </div>
    </div>
  );
};
