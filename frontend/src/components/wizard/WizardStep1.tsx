import React from "react";
import { useApp } from "@/context/AppContext";
import { Gender, AreaType } from "@/types/schema";
import { User, MapPin, Building, Trees } from "lucide-react";

export interface Step1Data {
  age: number;
  gender: Gender;
  state: string;
  district?: string;
  area_type?: AreaType;
}

interface WizardStep1Props {
  data: Step1Data;
  onChange: (updated: Partial<Step1Data>) => void;
  availableStates?: string[];
}

const DEFAULT_INDIAN_STATES = [
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Bihar",
  "Rajasthan",
  "Maharashtra",
  "Gujarat",
  "Delhi",
  "Haryana",
  "Punjab",
  "West Bengal",
  "Tamil Nadu",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Odisha",
  "Jharkhand",
  "Chhattisgarh",
  "Assam",
  "Kerala",
  "Himachal Pradesh",
  "Uttarakhand",
  "Goa",
];

export const WizardStep1: React.FC<WizardStep1Props> = ({
  data,
  onChange,
  availableStates = DEFAULT_INDIAN_STATES,
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const genderOptions: Array<{ id: Gender; labelHi: string; labelEn: string; icon: string }> = [
    { id: "female", labelHi: "महिला (Female)", labelEn: "Female", icon: "👩" },
    { id: "male", labelHi: "पुरुष (Male)", labelEn: "Male", icon: "👨" },
    { id: "transgender", labelHi: "तृतीय लिंग / ट्रांसजेंडर", labelEn: "Transgender", icon: "⚧" },
  ];

  const areaOptions: Array<{ id: AreaType; labelHi: string; labelEn: string; subHi: string; subEn: string; icon: React.ReactNode }> = [
    {
      id: "rural",
      labelHi: "ग्रामीण (Rural)",
      labelEn: "Rural",
      subHi: "ग्राम पंचायत, देहात",
      subEn: "Village / Gram Panchayat",
      icon: <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: "urban",
      labelHi: "शहरी (Urban)",
      labelEn: "Urban",
      subHi: "नगर पालिका / नगर निगम",
      subEn: "Municipality / City",
      icon: <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
  ];

  const quickAges = [18, 25, 35, 50, 60];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-300">
      {/* Step Heading */}
      <div className="border-b border-border/60 pb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <span>{isHindi ? "चरण 1: बुनियादी जनसांख्यिकी (Basic Demographics)" : "Step 1: Basic Demographics"}</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isHindi
            ? "आयु, लिंग और निवास स्थान के आधार पर कई सरकारी योजनाएं लक्षित होती हैं。"
            : "Age, gender, and regional location are key deterministic criteria for welfare benefits."}
        </p>
      </div>

      {/* 1. Age Input with Slider & Quick Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            {isHindi ? "आपकी आयु (वर्ष)" : "Your Age (Years)"}
            <span className="text-destructive ml-1">*</span>
          </label>
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold text-base border border-primary/20">
            {data.age} {isHindi ? "वर्ष" : "years"}
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="1"
          max="100"
          value={data.age}
          onChange={(e) => onChange({ age: parseInt(e.target.value, 10) || 18 })}
          className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />

        {/* Quick Age Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground mr-1">
            {isHindi ? "त्वरित चयन:" : "Quick select:"}
          </span>
          {quickAges.map((ageVal) => (
            <button
              key={ageVal}
              type="button"
              onClick={() => onChange({ age: ageVal })}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                data.age === ageVal
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {ageVal} {isHindi ? "वर्ष" : "yrs"}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Gender Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground block">
          {isHindi ? "लिंग (Gender)" : "Gender"}
          <span className="text-destructive ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {genderOptions.map((opt) => {
            const isSelected = data.gender === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onChange({ gender: opt.id })}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex items-center space-x-3.5 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <span className="text-2xl" role="img" aria-label={opt.labelEn}>
                  {opt.icon}
                </span>
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {isHindi ? opt.labelHi : opt.labelEn}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {opt.id === "female" ? (isHindi ? "लाड़ली बहना, सुकन्या" : "Women initiatives") : ""}
                    {opt.id === "male" ? (isHindi ? "किसान, स्वरोजगार" : "All central schemes") : ""}
                    {opt.id === "transgender" ? (isHindi ? "समान अधिकार व पेंशन" : "Equal welfare") : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. State and District Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* State Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{isHindi ? "राज्य (State)" : "State"}</span>
            <span className="text-destructive">*</span>
          </label>
          <select
            value={data.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            {isHindi
              ? "राज्य-विशिष्ट योजनाओं (जैसे लाड़ली बहना) के लिए आवश्यक"
              : "Determines state-specific welfare initiatives"}
          </p>
        </div>

        {/* District Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground block">
            {isHindi ? "जिला (District)" : "District"}
          </label>
          <input
            type="text"
            value={data.district || ""}
            onChange={(e) => onChange({ district: e.target.value })}
            placeholder={isHindi ? "उदा. भोपाल, पटना, लखनऊ" : "e.g. Bhopal, Patna, Lucknow"}
            className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <p className="text-[11px] text-muted-foreground">
            {isHindi ? "निकटतम CSC केंद्र खोजने में उपयोगी" : "Used for locating local Seva Kendras"}
          </p>
        </div>
      </div>

      {/* 4. Area Type Selection (Rural vs Urban) */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground block">
          {isHindi ? "निवास क्षेत्र (Area Type)" : "Residence Area"}
          <span className="text-destructive ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {areaOptions.map((opt) => {
            const isSelected = data.area_type === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onChange({ area_type: opt.id })}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex items-center space-x-3.5 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-muted/60">{opt.icon}</div>
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {isHindi ? opt.labelHi : opt.labelEn}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isHindi ? opt.subHi : opt.subEn}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
