import React from "react";
import { useApp } from "@/context/AppContext";
import { SocialCategory } from "@/types/schema";

export interface Step3Data {
  category: SocialCategory;
  annual_income: number;
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
      descHi: "ओपन एवं सामान्य वर्ग योजनाएं",
      descEn: "Standard open welfare schemes",
    },
    {
      id: "obc",
      labelHi: "ओबीसी (OBC)",
      labelEn: "OBC",
      descHi: "अन्य पिछड़ा वर्ग छात्रवृत्ति व सब्सिडी",
      descEn: "Other Backward Classes benefits",
    },
    {
      id: "sc",
      labelHi: "अनुसूचित जाति (SC)",
      labelEn: "SC",
      descHi: "विशेष अनुदान, छात्रवृत्ति व ऋण",
      descEn: "Scheduled Caste targeted grants",
    },
    {
      id: "st",
      labelHi: "अनुसूचित जनजाति (ST)",
      labelEn: "ST",
      descHi: "जनजातीय विकास एवं कल्याण",
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
    { label: "₹8,00,000+", value: 800000 },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* 1. Social Category Selection */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          {isHindi ? "सामाजिक श्रेणी (Category)" : "Social Category"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const isSelected = data.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ category: cat.id })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all select-none ${
                  isSelected
                    ? "border-[#2D7A58] bg-[#F0F8F4] text-[#165D51] ring-1 ring-[#2D7A58]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                <div className={`text-sm font-semibold ${
                  isSelected ? "text-[#165D51]" : "text-gray-900"
                }`}>
                  {isHindi ? cat.labelHi : cat.labelEn}
                </div>
                <div className="text-xs text-gray-500 mt-1 leading-snug">
                  {isHindi ? cat.descHi : cat.descEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Annual Family Income */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-900 block">
            {isHindi ? "वार्षिक पारिवारिक आय" : "Annual Family Income"}{" "}
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <span className="text-sm font-bold text-[#165D51] bg-[#F0F8F4] px-3 py-1 rounded-lg border border-[#2D7A58]/30">
            {formatCurrency(data.annual_income || 0)} / {isHindi ? "वर्ष" : "yr"}
          </span>
        </div>

        <div className="relative flex items-center mb-3">
          <span className="absolute left-4 text-base font-bold text-gray-500 pointer-events-none">
            ₹
          </span>
          <input
            type="number"
            min="0"
            max="10000000"
            step="10000"
            value={data.annual_income || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange({ annual_income: isNaN(val) ? 0 : val });
            }}
            placeholder="180000"
            className="w-full h-12 pl-8 pr-16 rounded-xl border border-gray-200 bg-white text-gray-900 text-base font-medium focus:outline-none focus:border-[#165D51] focus:ring-2 focus:ring-[#165D51]/20 transition-all"
          />
          <span className="absolute right-4 text-sm text-gray-400 font-normal pointer-events-none select-none">
            {isHindi ? "रु/वर्ष" : "INR / yr"}
          </span>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">{isHindi ? "त्वरित विकल्प:" : "Common slabs:"}</span>
          {incomeSlabs.map((slab) => (
            <button
              key={slab.value}
              type="button"
              onClick={() => onChange({ annual_income: slab.value })}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                data.annual_income === slab.value
                  ? "bg-[#165D51] text-white border-[#165D51]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {slab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
