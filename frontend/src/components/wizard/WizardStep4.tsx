import React from "react";
import { useApp } from "@/context/AppContext";
import { RationCardType, MaritalStatus } from "@/types/schema";
import { CreditCard, Accessibility, Check } from "lucide-react";

export interface Step4Data {
  marital_status?: MaritalStatus;
  ration_card_type?: RationCardType;
  is_differently_abled: boolean;
}

interface WizardStep4Props {
  data: Step4Data;
  onChange: (updated: Partial<Step4Data>) => void;
}

export const WizardStep4: React.FC<WizardStep4Props> = ({ data, onChange }) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const maritalOptions: Array<{ id: MaritalStatus; labelHi: string; labelEn: string }> = [
    { id: "single", labelHi: "अविवाहित (Single)", labelEn: "Single" },
    { id: "married", labelHi: "विवाहित (Married)", labelEn: "Married" },
    { id: "widowed", labelHi: "विधवा / विधुर (Widowed)", labelEn: "Widowed" },
    { id: "divorced", labelHi: "तलाकशुदा (Divorced)", labelEn: "Divorced" },
  ];

  const rationCardOptions: Array<{ id: RationCardType; labelHi: string; labelEn: string; desc: string }> = [
    { id: "antyodaya", labelHi: "अन्त्योदय (AAY)", labelEn: "Antyodaya (AAY)", desc: "Poorest of poor ration card" },
    { id: "bpl", labelHi: "बीपीएल (BPL)", labelEn: "BPL Card", desc: "Below Poverty Line benefits" },
    { id: "apl", labelHi: "एपीएल (APL)", labelEn: "APL Card", desc: "Above Poverty Line standard card" },
    { id: "none", labelHi: "कोई नहीं (None)", labelEn: "No Ration Card", desc: "No subsidized food card" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Marital Status */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          {isHindi ? "वैवाहिक स्थिति" : "Marital Status"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {maritalOptions.map((opt) => {
            const isSelected = data.marital_status === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ marital_status: opt.id })}
                className={`h-12 px-3 rounded-xl border flex items-center justify-center space-x-2 cursor-pointer font-medium text-sm transition-all select-none ${
                  isSelected
                    ? "border-[#2D7A58] bg-[#F0F8F4] text-[#165D51] font-semibold ring-1 ring-[#2D7A58]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                <span>{isHindi ? opt.labelHi : opt.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Ration Card Type */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          {isHindi ? "राशन कार्ड का प्रकार" : "Ration Card Type"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rationCardOptions.map((opt) => {
            const isSelected = data.ration_card_type === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ ration_card_type: opt.id })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3 select-none ${
                  isSelected
                    ? "border-[#2D7A58] bg-[#F0F8F4] text-[#165D51] ring-1 ring-[#2D7A58]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  isSelected ? "bg-white shadow-xs text-[#165D51]" : "bg-gray-100 text-gray-500"
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${
                    isSelected ? "text-[#165D51]" : "text-gray-900"
                  }`}>
                    {isHindi ? opt.labelHi : opt.labelEn}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Differently Abled (Divyangjan) */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          {isHindi ? "क्या आप विशेष रूप से सक्षम / दिव्यांगजन हैं?" : "Differently Abled (Divyangjan)?"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => onChange({ is_differently_abled: true })}
            className={`h-12 px-4 rounded-xl border flex items-center justify-center space-x-2.5 cursor-pointer font-medium text-sm transition-all select-none ${
              data.is_differently_abled
                ? "border-[#2D7A58] bg-[#F0F8F4] text-[#165D51] font-semibold ring-1 ring-[#2D7A58]"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
            }`}
          >
            <Accessibility className={`w-4 h-4 ${data.is_differently_abled ? "text-[#165D51]" : "text-gray-500"}`} />
            <span>{isHindi ? "हाँ (Yes)" : "Yes"}</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ is_differently_abled: false })}
            className={`h-12 px-4 rounded-xl border flex items-center justify-center space-x-2.5 cursor-pointer font-medium text-sm transition-all select-none ${
              !data.is_differently_abled
                ? "border-[#2D7A58] bg-[#F0F8F4] text-[#165D51] font-semibold ring-1 ring-[#2D7A58]"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
            }`}
          >
            <Check className={`w-4 h-4 ${!data.is_differently_abled ? "text-[#165D51]" : "text-gray-500"}`} />
            <span>{isHindi ? "नहीं (No)" : "No"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
