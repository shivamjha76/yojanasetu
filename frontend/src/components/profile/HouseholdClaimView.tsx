import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { HouseholdClaimResponse } from "@/types/household";
import { CitizenProfile, Gender, Occupation } from "@/types/schema";
import {
  Users,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  IndianRupee,
  HeartPulse,
  Landmark,
  ArrowLeft,
} from "lucide-react";

interface HouseholdMemberDraft {
  id: string;
  name: string;
  relation: string;
  profile: CitizenProfile;
}

interface HouseholdClaimViewProps {
  onBackToHome: () => void;
  onViewSchemeDetail?: (schemeId: string) => void;
}

const DEFAULT_FAMILY_MEMBERS: HouseholdMemberDraft[] = [
  {
    id: "mem_1",
    name: "Ramesh Sharma",
    relation: "self",
    profile: {
      age: 44,
      gender: "male",
      state: "Rajasthan",
      district: "Jaipur",
      area_type: "rural",
      occupation: "farmer",
      land_holding_acres: 2.0,
      category: "obc",
      annual_income: 140000,
      marital_status: "married",
      is_differently_abled: false,
      ration_card_type: "bpl",
    },
  },
  {
    id: "mem_2",
    name: "Sunita Sharma",
    relation: "spouse",
    profile: {
      age: 40,
      gender: "female",
      state: "Rajasthan",
      district: "Jaipur",
      area_type: "rural",
      occupation: "homemaker",
      land_holding_acres: 0,
      category: "obc",
      annual_income: 140000,
      marital_status: "married",
      is_differently_abled: false,
      ration_card_type: "bpl",
    },
  },
  {
    id: "mem_3",
    name: "Pooja Sharma",
    relation: "daughter",
    profile: {
      age: 19,
      gender: "female",
      state: "Rajasthan",
      district: "Jaipur",
      area_type: "rural",
      occupation: "student",
      land_holding_acres: 0,
      category: "obc",
      annual_income: 140000,
      marital_status: "single",
      is_differently_abled: false,
      ration_card_type: "bpl",
    },
  },
];

export const HouseholdClaimView: React.FC<HouseholdClaimViewProps> = ({
  onBackToHome,
  onViewSchemeDetail = () => {},
}) => {
  const { language } = useApp();
  const { user } = useAuth();
  const isHindi = language === "hi";

  const [familyName, setFamilyName] = useState<string>(
    user?.full_name ? `${user.full_name}'s Household` : "Sharma Household"
  );
  const [members, setMembers] = useState<HouseholdMemberDraft[]>(DEFAULT_FAMILY_MEMBERS);
  const [evalResult, setEvalResult] = useState<HouseholdClaimResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "deduplicated" | "members">("overview");

  const handleAddMember = () => {
    const newId = `mem_${Date.now()}`;
    const newMember: HouseholdMemberDraft = {
      id: newId,
      name: isHindi ? `सदस्य ${members.length + 1}` : `Member ${members.length + 1}`,
      relation: "son",
      profile: {
        age: 20,
        gender: "male",
        state: members[0]?.profile.state || "Rajasthan",
        district: members[0]?.profile.district || "Jaipur",
        area_type: members[0]?.profile.area_type || "rural",
        occupation: "student",
        land_holding_acres: 0,
        category: members[0]?.profile.category || "obc",
        annual_income: members[0]?.profile.annual_income || 140000,
        marital_status: "single",
        is_differently_abled: false,
        ration_card_type: members[0]?.profile.ration_card_type || "bpl",
      },
    };
    setMembers([...members, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleUpdateMember = (id: string, field: string, val: any) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (field === "name") return { ...m, name: val };
        if (field === "relation") return { ...m, relation: val };
        return {
          ...m,
          profile: {
            ...m.profile,
            [field]: val,
          },
        };
      })
    );
  };

  const handleEvaluateClaim = async () => {
    setIsLoading(true);
    try {
      const res = await api.evaluateHouseholdClaim({
        family_name: familyName,
        members: members.map((m) => ({
          id: m.id,
          name: m.name,
          relation: m.relation,
          profile: m.profile,
        })),
      });
      setEvalResult(res);
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err) {
      console.error("Household evaluation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* Header Banner (Landing Page Hero Style)                  */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E8F0] shadow-subtle relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 bg-[#1D5F49]/10 text-[#1D5F49] border border-[#1D5F49]/20 px-3.5 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? "नवाचार: संयुक्त पारिवारिक दावा" : "Unified Benefit: Household Combined Claim"}</span>
            </div>
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-[#CBD5E1] hover:border-[#1D5F49]/40 hover:bg-[#1D5F49]/5 text-xs text-[#334155] font-medium transition-colors cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isHindi ? "होम पर लौटें" : "Back to Home"}</span>
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0C1924] tracking-tight leading-tight">
            <span>{isHindi ? "एक परिवार, " : "One Household, "}</span>
            <span className="text-[#1D5F49]">
              {isHindi ? "एकीकृत योजना सेतु" : "Unified Benefits"}
            </span>
            <span>{isHindi ? " — संपूर्ण पारिवारिक लाभ दृश्य" : " — Combined Roadmap"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#525B64] leading-relaxed max-w-2xl font-normal">
            {isHindi
              ? "परिवार के सभी सदस्यों की एक साथ पात्रता जांचें। परिवार-स्तरीय योजनाओं (जैसे आयुष्मान भारत या राशन कार्ड) का दोहराव समाप्त करें और पूरे परिवार का कुल वार्षिक वित्तीय लाभ देखें।"
              : "Scan eligibility for all family members at once. Eliminate duplicate household caps (like shared Ayushman health cards) and unlock the total combined monetary value."}
          </p>
        </div>
      </div>

      {/* Main Grid: Left is Member Config, Right is Consolidated Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Family Setup (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1D5F49]/10 text-[#1D5F49] flex items-center justify-center">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-base font-bold text-[#0C1924]">
                  {isHindi ? "पारिवारिक सदस्य विवरण" : "Family Members Profile"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1D5F49]/10 text-[#1D5F49] hover:bg-[#1D5F49]/15 font-semibold text-xs transition-colors cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHindi ? "+ सदस्य जोड़ें" : "+ Add Member"}</span>
              </button>
            </div>

            {/* Family Reference Name */}
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                {isHindi ? "परिवार का नाम / संदर्भ" : "Household / Family Reference"}
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm font-semibold text-[#0C1924] focus:ring-2 focus:ring-[#1D5F49]/20 focus:border-[#1D5F49] outline-none transition-all bg-white"
              />
            </div>

            {/* List of Members */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {members.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/60 hover:bg-white hover:border-[#1D5F49]/40 transition-all space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-[#1D5F49] text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleUpdateMember(m.id, "name", e.target.value)}
                        className="text-xs font-bold text-[#0C1924] bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1D5F49] outline-none px-1"
                      />
                    </div>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-[#94A3B8] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Relation */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#64748B] mb-0.5">
                        {isHindi ? "संबंध (Relation)" : "Relation"}
                      </label>
                      <select
                        value={m.relation}
                        onChange={(e) => handleUpdateMember(m.id, "relation", e.target.value)}
                        className="w-full p-2 bg-white rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#0C1924] focus:ring-2 focus:ring-[#1D5F49]/20 focus:border-[#1D5F49] outline-none"
                      >
                        <option value="self">{isHindi ? "स्वयं (Self)" : "Self"}</option>
                        <option value="spouse">{isHindi ? "पति/पत्नी (Spouse)" : "Spouse"}</option>
                        <option value="son">{isHindi ? "बेटा (Son)" : "Son"}</option>
                        <option value="daughter">{isHindi ? "बेटी (Daughter)" : "Daughter"}</option>
                        <option value="father">{isHindi ? "पिता (Father)" : "Father"}</option>
                        <option value="mother">{isHindi ? "माता (Mother)" : "Mother"}</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#64748B] mb-0.5">
                        {isHindi ? "आयु (Age)" : "Age"}
                      </label>
                      <input
                        type="number"
                        value={m.profile.age}
                        onChange={(e) => handleUpdateMember(m.id, "age", parseInt(e.target.value) || 18)}
                        className="w-full p-2 bg-white rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#0C1924] focus:ring-2 focus:ring-[#1D5F49]/20 focus:border-[#1D5F49] outline-none"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#64748B] mb-0.5">
                        {isHindi ? "लिंग (Gender)" : "Gender"}
                      </label>
                      <select
                        value={m.profile.gender}
                        onChange={(e) => handleUpdateMember(m.id, "gender", e.target.value as Gender)}
                        className="w-full p-2 bg-white rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#0C1924] focus:ring-2 focus:ring-[#1D5F49]/20 focus:border-[#1D5F49] outline-none"
                      >
                        <option value="male">{isHindi ? "पुरुष (Male)" : "Male"}</option>
                        <option value="female">{isHindi ? "महिला (Female)" : "Female"}</option>
                        <option value="other">{isHindi ? "अन्य (Other)" : "Other"}</option>
                      </select>
                    </div>

                    {/* Occupation */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#64748B] mb-0.5">
                        {isHindi ? "व्यवसाय (Occupation)" : "Occupation"}
                      </label>
                      <select
                        value={m.profile.occupation}
                        onChange={(e) => handleUpdateMember(m.id, "occupation", e.target.value as Occupation)}
                        className="w-full p-2 bg-white rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#0C1924] focus:ring-2 focus:ring-[#1D5F49]/20 focus:border-[#1D5F49] outline-none"
                      >
                        <option value="farmer">{isHindi ? "किसान (Farmer)" : "Farmer"}</option>
                        <option value="student">{isHindi ? "विद्यार्थी (Student)" : "Student"}</option>
                        <option value="business_self_employed">{isHindi ? "स्वरोजगार (Business)" : "Business/Self"}</option>
                        <option value="homemaker">{isHindi ? "गृहणी (Homemaker)" : "Homemaker"}</option>
                        <option value="daily_wage_laborer">{isHindi ? "मजदूर (Laborer)" : "Laborer"}</option>
                        <option value="artisan_craftsperson">{isHindi ? "कारीगर (Artisan)" : "Artisan"}</option>
                        <option value="unemployed">{isHindi ? "बेरोजगार (Unemployed)" : "Unemployed"}</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Evaluate Button */}
            <button
              type="button"
              onClick={handleEvaluateClaim}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 active:scale-95"
            >
              {isLoading ? (
                <span>{isHindi ? "पारिवारिक लाभ की गणना हो रही है..." : "Computing Household Claim..."}</span>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>{isHindi ? "पारिवारिक दावा मूल्यांकन करें" : "Evaluate Household Combined Claim"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Consolidated Roadmap & Analytics (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!evalResult ? (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 sm:p-12 text-center space-y-4 shadow-subtle">
              <div className="w-16 h-16 rounded-2xl bg-[#1D5F49]/10 text-[#1D5F49] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#0C1924]">
                {isHindi ? "पारिवारिक दावा दृश्य अनलॉक करने के लिए तैयार" : "Ready to Unlock Household View"}
              </h3>
              <p className="text-xs text-[#525B64] max-w-md mx-auto leading-relaxed">
                {isHindi
                  ? "बाएं पैनल में परिवार के सदस्यों की जांच करें और 'पारिवारिक दावा मूल्यांकन करें' पर क्लिक करें। आपको कुल वार्षिक मूल्य और डी-डुप्लिकेटेड रोडमैप तुरंत प्राप्त होगा।"
                  : "Review your household members on the left and hit 'Evaluate Household Combined Claim' to view the aggregate benefits and deduplicated schemes."}
              </p>
              <button
                type="button"
                onClick={handleEvaluateClaim}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>{isHindi ? "अभी मूल्यांकन करें" : "Evaluate Now"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Financial Highlight Cards (Landing Page Category Card Style) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/80 shadow-subtle space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold mb-1">
                    <IndianRupee className="w-4 h-4" />
                    <span>{isHindi ? "वार्षिक नकद डीबीटी" : "Annual Cash DBT"}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1D5F49] tracking-tight">
                    ₹{evalResult.total_annual_cash_value.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {isHindi ? "प्रति वर्ष परिवार के खातों में" : "Per year direct to accounts"}
                  </div>
                </div>

                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200/80 shadow-subtle space-y-1">
                  <div className="flex items-center space-x-2 text-rose-800 text-xs font-bold mb-1">
                    <HeartPulse className="w-4 h-4" />
                    <span>{isHindi ? "पारिवारिक स्वास्थ्य कवच" : "Family Health Cover"}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight">
                    ₹{(evalResult.total_health_cover_value / 100000).toFixed(1)} लाख
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {isHindi ? "कैशलेस अस्पताल सुरक्षा" : "Cashless hospital insurance"}
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200/80 shadow-subtle space-y-1">
                  <div className="flex items-center space-x-2 text-blue-800 text-xs font-bold mb-1">
                    <Landmark className="w-4 h-4" />
                    <span>{isHindi ? "रियायती ऋण पहुंच" : "Subsidized Credit"}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
                    ₹{(evalResult.total_loan_credit_access / 100000).toFixed(1)} लाख
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {isHindi ? "बिना गारंटी व्यावसायिक ऋण" : "Collateral-free working capital"}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-subtle space-y-5">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === "overview"
                          ? "bg-[#1D5F49] text-white shadow-xs"
                          : "text-[#525B64] hover:text-[#0C1924] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      {isHindi ? "संयुक्त योजनाएं (Deduplicated)" : "Deduplicated Benefits"} (
                      {evalResult.deduplicated_benefits.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("members")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === "members"
                          ? "bg-[#1D5F49] text-white shadow-xs"
                          : "text-[#525B64] hover:text-[#0C1924] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      {isHindi ? "सदस्यवार विवरण" : "Member Breakdown"} ({evalResult.members_breakdown.length})
                    </button>
                  </div>
                </div>

                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium leading-relaxed">
                      💡{" "}
                      {isHindi
                        ? "स्मार्ट डी-डुप्लिकेशन सक्रिय: एक ही परिवार के एकाधिक सदस्य होने पर भी परिवार-स्तरीय योजनाओं को केवल 1 बार गिना गया है।"
                        : "Smart Deduplication active: Family-capped schemes (like Ayushman cards) are shared without double-counting."}
                    </div>

                    <div className="space-y-3">
                      {evalResult.deduplicated_benefits.map((b) => (
                        <div
                          key={b.scheme_id}
                          className="p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#1D5F49]/40 hover:shadow-card-hover transition-all bg-white space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm sm:text-base font-bold text-[#0C1924]">
                                  {isHindi ? b.scheme_name_hi : b.scheme_name_en}
                                </h4>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    b.claim_level === "family_shared"
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {b.claim_level === "family_shared"
                                    ? isHindi
                                      ? "संयुक्त परिवार कार्ड"
                                      : "Shared Household Card"
                                    : isHindi
                                    ? "व्यक्तिगत स्वतंत्र दावा"
                                    : "Individual Claim"}
                                </span>
                              </div>
                              <p className="text-xs text-[#525B64] mt-1 leading-relaxed">
                                {isHindi ? b.rationale_hi : b.rationale_en}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onViewSchemeDetail(b.scheme_id)}
                              className="px-3 py-1 text-xs font-semibold text-[#1D5F49] hover:text-[#174E3C] hover:underline cursor-pointer shrink-0 transition-colors"
                            >
                              {isHindi ? "विवरण देखें" : "View"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E2E8F0]/70">
                            <span className="text-[#525B64] font-medium">
                              {isHindi ? "पात्र सदस्य:" : "Beneficiaries:"}{" "}
                              <span className="font-bold text-[#0C1924]">
                                {b.beneficiary_member_names.join(", ")}
                              </span>
                            </span>
                            <span className="font-extrabold text-[#1D5F49]">
                              {b.benefit_amount_text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "members" && (
                  <div className="space-y-4">
                    {evalResult.members_breakdown.map((m) => (
                      <div
                        key={m.member_id}
                        className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/60 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-[#0C1924]">{m.member_name}</span>
                            <span className="text-xs text-[#737C85] ml-2">({m.relation})</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-[#1D5F49]/10 text-[#1D5F49] border border-[#1D5F49]/20 text-xs font-bold">
                            {m.eligible_schemes_count} {isHindi ? "योजनाएं पात्र" : "Schemes Unlocked"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {m.eligible_schemes.slice(0, 5).map((s) => (
                            <span
                              key={s.scheme_id}
                              onClick={() => onViewSchemeDetail(s.scheme_id)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#334155] hover:border-[#1D5F49] hover:text-[#1D5F49] cursor-pointer transition-colors shadow-2xs"
                            >
                              {isHindi ? s.scheme_name_hi : s.scheme_name_en}
                            </span>
                          ))}
                          {m.eligible_schemes.length > 5 && (
                            <span className="px-2 py-1 text-xs text-[#737C85]">
                              +{m.eligible_schemes.length - 5} {isHindi ? "और" : "more"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM MOTTO DIVIDER MATCHING LANDING PAGE               */}
      {/* ======================================================== */}
      <div className="mt-14 sm:mt-20 pt-4 flex items-center justify-center">
        <div className="w-20 sm:w-36 h-[1px] bg-[#E2E8F0]" />
        <span className="px-4 sm:px-6 text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#64748B] uppercase text-center select-none">
          {isHindi ? "अधिक जागरूक • सशक्त भारत" : "A MORE INFORMED. A STRONGER INDIA."}
        </span>
        <div className="w-20 sm:w-36 h-[1px] bg-[#E2E8F0]" />
      </div>
    </div>
  );
};
