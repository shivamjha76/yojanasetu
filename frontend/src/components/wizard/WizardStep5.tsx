import React from "react";
import { useApp } from "@/context/AppContext";
import { CitizenProfile } from "@/types/schema";
import { CheckCircle2, Edit3 } from "lucide-react";

interface WizardStep5Props {
  data: CitizenProfile;
  onJumpToStep: (stepNumber: number) => void;
}

export const WizardStep5: React.FC<WizardStep5Props> = ({ data, onJumpToStep }) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const formatCurrency = (val?: number) => {
    if (!val) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getGenderLabel = (g?: string) => {
    if (g === "female") return isHindi ? "महिला (Female)" : "Female";
    if (g === "male") return isHindi ? "पुरुष (Male)" : "Male";
    return isHindi ? "अन्य (Other)" : "Other";
  };

  const getAreaLabel = (a?: string) => {
    if (a === "rural") return isHindi ? "ग्रामीण (Rural)" : "Rural";
    return isHindi ? "शहरी (Urban)" : "Urban";
  };

  return (
    <div className="space-y-6">
      {/* Intro prompt */}
      <div className="p-4 rounded-2xl bg-[#F0F8F4] border border-emerald-200/80 flex items-start space-x-3.5">
        <div className="w-8 h-8 rounded-full bg-[#165D51] text-white flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#165D51]">
            {isHindi ? "आपकी जानकारी तैयार है!" : "Your profile summary is ready!"}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            {isHindi
              ? "कृपया अपने विवरण की पुष्टि करें। नीचे दिए गए बटन पर क्लिक करते ही हमारा AI सिस्टम 100+ केंद्रीय व राज्य योजनाओं में आपकी पात्रता का मूल्यांकन करेगा।"
              : "Please confirm your details below. Once you proceed, our rule engine will evaluate your exact eligibility across 100+ central & state welfare schemes."}
          </p>
        </div>
      </div>

      {/* Profile Review Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Basic Information Card */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#165D51] uppercase tracking-wider">
              {isHindi ? "1. बुनियादी जानकारी" : "1. Basic Info"}
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs text-gray-400 hover:text-[#165D51] flex items-center gap-1 cursor-pointer font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isHindi ? "संपादित करें" : "Edit"}</span>
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-800">
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "आयु:" : "Age:"}</span>
              <span className="font-semibold">{data.age} {isHindi ? "वर्ष" : "years"}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "लिंग:" : "Gender:"}</span>
              <span className="font-semibold">{getGenderLabel(data.gender)}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "स्थान:" : "Location:"}</span>
              <span className="font-semibold">{data.district}, {data.state}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "क्षेत्र:" : "Area:"}</span>
              <span className="font-semibold">{getAreaLabel(data.area_type)}</span>
            </div>
          </div>
        </div>

        {/* Occupation Card */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#165D51] uppercase tracking-wider">
              {isHindi ? "2. व्यवसाय व भूमि" : "2. Occupation"}
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs text-gray-400 hover:text-[#165D51] flex items-center gap-1 cursor-pointer font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isHindi ? "संपादित करें" : "Edit"}</span>
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-800">
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "पेशा:" : "Occupation:"}</span>
              <span className="font-semibold capitalize">{data.occupation?.replace(/_/g, " ")}</span>
            </div>
            {data.occupation === "farmer" && (
              <div>
                <span className="text-gray-500 text-xs mr-2">{isHindi ? "कृषि भूमि:" : "Land:"}</span>
                <span className="font-semibold">{data.land_holding_acres ?? 0} {isHindi ? "एकड़" : "acres"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Income & Category Card */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#165D51] uppercase tracking-wider">
              {isHindi ? "3. आय व श्रेणी" : "3. Income & Category"}
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-xs text-gray-400 hover:text-[#165D51] flex items-center gap-1 cursor-pointer font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isHindi ? "संपादित करें" : "Edit"}</span>
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-800">
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "सामाजिक श्रेणी:" : "Category:"}</span>
              <span className="font-semibold uppercase">{data.category}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "वार्षिक आय:" : "Income:"}</span>
              <span className="font-semibold text-[#165D51]">{formatCurrency(data.annual_income)} / yr</span>
            </div>
          </div>
        </div>

        {/* Additional Details Card */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#165D51] uppercase tracking-wider">
              {isHindi ? "4. अतिरिक्त विवरण" : "4. Additional Details"}
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="text-xs text-gray-400 hover:text-[#165D51] flex items-center gap-1 cursor-pointer font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isHindi ? "संपादित करें" : "Edit"}</span>
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-800">
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "वैवाहिक स्थिति:" : "Marital:"}</span>
              <span className="font-semibold capitalize">{data.marital_status || "Single"}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "राशन कार्ड:" : "Ration Card:"}</span>
              <span className="font-semibold uppercase">{data.ration_card_type || "None"}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-2">{isHindi ? "दिव्यांगजन:" : "Divyangjan:"}</span>
              <span className="font-semibold">{data.is_differently_abled ? (isHindi ? "हाँ" : "Yes") : (isHindi ? "नहीं" : "No")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
