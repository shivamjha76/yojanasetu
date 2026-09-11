import React from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  User,
  Briefcase,
  IndianRupee,
  Edit3,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";

interface MyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditDetails: () => void;
  onCheckEligibility: () => void;
}

export const MyDetailsModal: React.FC<MyDetailsModalProps> = ({
  isOpen,
  onClose,
  onEditDetails,
  onCheckEligibility,
}) => {
  const { language } = useApp();
  const { user } = useAuth();
  const isHindi = language === "hi";

  if (!isOpen || !user) return null;

  const details = user.citizen_details;

  // Localized helpers
  const getGenderLabel = (g?: string) => {
    switch (g) {
      case "female":
        return isHindi ? "महिला (Female)" : "Female";
      case "transgender":
        return isHindi ? "ट्रांसजेंडर (Transgender)" : "Transgender";
      default:
        return isHindi ? "पुरुष (Male)" : "Male";
    }
  };

  const getOccupationLabel = (o?: string) => {
    switch (o) {
      case "farmer":
        return isHindi ? "किसान / कृषक (Farmer)" : "Farmer / Agriculture";
      case "student":
        return isHindi ? "छात्र / विद्यार्थी (Student)" : "Student";
      case "homemaker":
        return isHindi ? "गृहणी (Homemaker)" : "Homemaker";
      case "employed_private":
        return isHindi ? "निजी नौकरी (Private Job)" : "Private Sector Employed";
      case "employed_government":
        return isHindi ? "सरकारी नौकरी (Govt Job)" : "Government Employed";
      case "business_self_employed":
        return isHindi ? "व्यवसायी / स्वरोजगार (Self Employed)" : "Business / Self Employed";
      case "daily_wage_laborer":
        return isHindi ? "दैनिक मजदूर (Daily Wage Laborer)" : "Daily Wage Laborer";
      case "unemployed":
        return isHindi ? "बेरोजगार (Unemployed)" : "Unemployed / Seeking Work";
      default:
        return isHindi ? "अन्य (Other)" : "Other";
    }
  };

  const getCategoryLabel = (c?: string) => {
    switch (c) {
      case "obc":
        return isHindi ? "ओबीसी (अन्य पिछड़ा वर्ग)" : "OBC (Other Backward Class)";
      case "sc":
        return isHindi ? "एससी (अनुसूचित जाति)" : "SC (Scheduled Caste)";
      case "st":
        return isHindi ? "एसटी (अनुसूचित जनजाति)" : "ST (Scheduled Tribe)";
      case "ews":
        return isHindi ? "ईडब्ल्यूएस (आर्थिक रूप से कमजोर)" : "EWS (Economically Weaker)";
      default:
        return isHindi ? "सामान्य (General)" : "General / Open";
    }
  };

  const getRationCardLabel = (r?: string) => {
    switch (r) {
      case "bpl":
        return isHindi ? "बीपीएल (गरीबी रेखा से नीचे)" : "BPL (Below Poverty Line)";
      case "antyodaya":
        return isHindi ? "अंत्योदय (AAY)" : "Antyodaya (AAY)";
      case "apl":
        return isHindi ? "एपीएल (गरीबी रेखा से ऊपर)" : "APL (Above Poverty Line)";
      default:
        return isHindi ? "कोई नहीं (None)" : "None";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0D684E] to-[#148364] text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-300/25 text-emerald-100 border border-emerald-300/30">
              <User className="w-3.5 h-3.5" />
              <span>{isHindi ? "नागरिक प्रोफ़ाइल" : "Citizen Profile"}</span>
            </span>
            <span className="text-xs text-emerald-200/90 font-medium">
              {user.email}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{isHindi ? "मेरे विवरण (My Details)" : "My Details"}</span>
            {details && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isHindi ? "सहेजे गए" : "Saved"}</span>
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
            {isHindi
              ? "आपके द्वारा सहेजी गई नागरिक जानकारी जिसके आधार पर सरकारी योजनाओं की पात्रता तय होती है।"
              : "Your saved citizen information used to deterministically evaluate your eligibility for government schemes."}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {!details ? (
            /* Empty State */
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-[#0D684E] flex items-center justify-center border border-emerald-100 shadow-xs">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {isHindi ? "आपने अभी तक अपने विवरण नहीं जोड़े हैं" : "No Profile Details Saved Yet"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  {isHindi
                    ? "एक बार अपना विवरण दर्ज करें ताकि आपको बार-बार फॉर्म न भरना पड़े और सभी योजनाएं तुरंत दिखें।"
                    : "Fill your details once to save time and discover eligible welfare schemes tailored specifically to you."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditDetails();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D684E] hover:bg-[#094D3A] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? "अभी विवरण भरें (Fill Details Now)" : "Fill Details Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Saved Details Grid */
            <div className="space-y-4">
              {/* Top Citizen Card */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0D684E] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{user.full_name}</h4>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditDetails();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#0D684E] text-[#0D684E] hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isHindi ? "संपादित करें" : "Edit Details"}</span>
                </button>
              </div>

              {/* 4 Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Basic Info */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0D684E]">
                    <User className="w-4 h-4" />
                    <span>{isHindi ? "बुनियादी जानकारी" : "Basic Information"}</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-gray-600">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>{isHindi ? "आयु (Age)" : "Age"}:</span>
                      <span className="font-semibold text-gray-900">{details.age} {isHindi ? "वर्ष" : "yrs"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>{isHindi ? "लिंग (Gender)" : "Gender"}:</span>
                      <span className="font-semibold text-gray-900">{getGenderLabel(details.gender)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>{isHindi ? "राज्य (State)" : "State"}:</span>
                      <span className="font-semibold text-gray-900">{details.state || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isHindi ? "जिला व क्षेत्र" : "District & Area"}:</span>
                      <span className="font-semibold text-gray-900">
                        {details.district || "—"} ({details.area_type || "urban"})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Occupation */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                    <Briefcase className="w-4 h-4" />
                    <span>{isHindi ? "व्यवसाय एवं आजीविका" : "Occupation & Work"}</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-gray-600">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>{isHindi ? "मुख्य व्यवसाय" : "Occupation"}:</span>
                      <span className="font-semibold text-gray-900 text-right truncate max-w-[160px]">
                        {getOccupationLabel(details.occupation)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isHindi ? "भूमि स्वामित्व" : "Land Holding"}:</span>
                      <span className="font-semibold text-gray-900">
                        {details.land_holding_acres ? `${details.land_holding_acres} एकड़` : isHindi ? "लागू नहीं / भूमिहीन" : "None / Landless"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Income & Category */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                    <IndianRupee className="w-4 h-4" />
                    <span>{isHindi ? "आय व सामाजिक श्रेणी" : "Income & Category"}</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-gray-600">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>{isHindi ? "वार्षिक आय" : "Annual Income"}:</span>
                      <span className="font-bold text-[#0D684E]">
                        ₹{Number(details.annual_income || 0).toLocaleString("en-IN")} / {isHindi ? "वर्ष" : "yr"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isHindi ? "सामाजिक श्रेणी" : "Category"}:</span>
                      <span className="font-semibold text-gray-900">{getCategoryLabel(details.category)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Welfare Details */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                    <HeartHandshake className="w-4 h-4" />
                    <span>{isHindi ? "कल्याणकारी विवरण" : "Welfare Information"}</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-gray-600">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>{isHindi ? "राशन कार्ड" : "Ration Card"}:</span>
                      <span className="font-semibold text-gray-900">{getRationCardLabel(details.ration_card_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isHindi ? "दिव्यांगजन" : "Divyangjan"}:</span>
                      <span className="font-semibold text-gray-900">
                        {details.is_differently_abled ? (isHindi ? "हाँ (Yes)" : "Yes") : (isHindi ? "नहीं (No)" : "No")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
          >
            {isHindi ? "बंद करें" : "Close"}
          </button>

          {details && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCheckEligibility();
              }}
              className="py-2.5 px-5 rounded-xl bg-[#0D684E] hover:bg-[#094D3A] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHindi ? "पात्र योजनाओं की जांच करें" : "Check Eligible Schemes"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDetailsModal;
