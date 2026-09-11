import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Gender, AreaType } from "@/types/schema";
import { User, Home, Building2, ChevronDown } from "lucide-react";
import { getAllIndianStates, getDistrictsForState } from "@/data/indianDistricts";

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

export const WizardStep1: React.FC<WizardStep1Props> = ({
  data,
  onChange,
  availableStates = getAllIndianStates(),
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  // Available districts based on selected state
  const stateDistricts = getDistrictsForState(data.state || "Rajasthan");

  // Keep district valid when state changes — compute fresh districts inside effect
  useEffect(() => {
    const freshDistricts = getDistrictsForState(data.state || "Rajasthan");
    if (!data.district || !freshDistricts.includes(data.district)) {
      onChange({ district: freshDistricts[0] || "Jaipur" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.state]); // intentionally only re-run when state changes


  const genderOptions: Array<{ id: Gender; labelHi: string; labelEn: string }> = [
    { id: "female", labelHi: "महिला (Female)", labelEn: "Female" },
    { id: "male", labelHi: "पुरुष (Male)", labelEn: "Male" },
    { id: "transgender", labelHi: "अन्य (Other)", labelEn: "Other" },
  ];

  const areaOptions: Array<{ id: AreaType; labelHi: string; labelEn: string; icon: React.ReactNode }> = [
    {
      id: "rural",
      labelHi: "ग्रामीण (Rural)",
      labelEn: "Rural",
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: "urban",
      labelHi: "शहरी (Urban)",
      labelEn: "Urban",
      icon: <Building2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Age Input */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          {isHindi ? "आपकी आयु" : "Your Age"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            type="number"
            min="1"
            max="110"
            value={data.age || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange({ age: isNaN(val) ? 18 : val });
            }}
            placeholder={isHindi ? "अपनी आयु दर्ज करें" : "21"}
            className="w-full h-12 px-4 pr-16 rounded-xl border border-gray-200 bg-white text-gray-900 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#165D51] focus:ring-2 focus:ring-[#165D51]/20 transition-all"
          />
          <span className="absolute right-4 text-sm text-gray-400 font-normal pointer-events-none select-none">
            {isHindi ? "वर्ष" : "years"}
          </span>
        </div>
      </div>

      {/* 2. Gender Selection */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          {isHindi ? "लिंग" : "Gender"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {genderOptions.map((opt) => {
            const isSelected = data.gender === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ gender: opt.id })}
                className={`h-12 px-4 rounded-xl border flex items-center justify-center space-x-2 cursor-pointer font-medium text-sm transition-all select-none ${
                  isSelected
                    ? "border-[#2D7A58] bg-[#F0F8F4] text-[#165D51] font-semibold ring-1 ring-[#2D7A58]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    isSelected ? "text-[#165D51]" : "text-gray-500"
                  }`}
                />
                <span>{isHindi ? opt.labelHi : opt.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. State & District (2 Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* State Dropdown */}
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-2">
            {isHindi ? "राज्य" : "State"}{" "}
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <select
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
              className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium appearance-none focus:outline-none focus:border-[#165D51] focus:ring-2 focus:ring-[#165D51]/20 transition-all cursor-pointer"
            >
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* District Dropdown */}
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-2">
            {isHindi ? "ज़िला" : "District"}{" "}
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <select
              value={data.district || stateDistricts[0]}
              onChange={(e) => onChange({ district: e.target.value })}
              className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium appearance-none focus:outline-none focus:border-[#165D51] focus:ring-2 focus:ring-[#165D51]/20 transition-all cursor-pointer"
            >
              {stateDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Residence Area (Rural vs Urban) */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          {isHindi ? "निवास क्षेत्र" : "Residence Area"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3.5">
          {areaOptions.map((opt) => {
            const isSelected = data.area_type === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ area_type: opt.id })}
                className={`h-12 px-4 rounded-xl border flex items-center justify-center space-x-2.5 cursor-pointer font-medium text-sm transition-all select-none ${
                  isSelected
                    ? "border-[#2D7A58] bg-[#F0F8F4] text-[#165D51] font-semibold ring-1 ring-[#2D7A58]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                <span
                  className={
                    isSelected ? "text-[#165D51]" : "text-gray-500"
                  }
                >
                  {opt.icon}
                </span>
                <span>{isHindi ? opt.labelHi : opt.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
