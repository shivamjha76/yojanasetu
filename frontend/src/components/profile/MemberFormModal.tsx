import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { FamilyMember, FamilyMemberInput, MemberRelationship } from "@/types/auth";
import { INDIAN_DISTRICTS } from "@/data/indianDistricts";
import {
  X,
  User,
  Heart,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: FamilyMemberInput) => Promise<void>;
  initialMember?: FamilyMember | null;
  defaultState?: string;
}

export const RELATIONSHIPS: { key: MemberRelationship; labelHi: string; labelEn: string; icon: string }[] = [
  { key: "father", labelHi: "पिता (Father)", labelEn: "Father", icon: "👨" },
  { key: "mother", labelHi: "माता (Mother)", labelEn: "Mother", icon: "👩" },
  { key: "brother", labelHi: "भाई (Brother)", labelEn: "Brother", icon: "👦" },
  { key: "sister", labelHi: "बहन (Sister)", labelEn: "Sister", icon: "👧" },
  { key: "spouse", labelHi: "पति / पत्नी (Spouse)", labelEn: "Spouse (Husband/Wife)", icon: "💍" },
  { key: "son", labelHi: "बेटा / पुत्र (Son)", labelEn: "Son", icon: "🧒" },
  { key: "daughter", labelHi: "बेटी / पुत्री (Daughter)", labelEn: "Daughter", icon: "👧" },
  { key: "uncle", labelHi: "चाचा / मामा (Uncle)", labelEn: "Uncle", icon: "🧔" },
  { key: "aunt", labelHi: "चाची / मामी / मौसी (Aunt)", labelEn: "Aunt", icon: "🧕" },
  { key: "grandfather", labelHi: "दादा / नाना (Grandfather)", labelEn: "Grandfather", icon: "👴" },
  { key: "grandmother", labelHi: "दादी / नानी (Grandmother)", labelEn: "Grandmother", icon: "👵" },
  { key: "friend", labelHi: "मित्र / दोस्त (Friend)", labelEn: "Friend", icon: "🤝" },
  { key: "other", labelHi: "अन्य संबंधी (Other)", labelEn: "Other Relative / Dependent", icon: "👤" },
];

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMember,
  defaultState = "Rajasthan",
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const isEditing = !!initialMember;

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<MemberRelationship>("father");
  const [age, setAge] = useState<number | "">(35);
  const [gender, setGender] = useState("male");
  const [state, setState] = useState(defaultState);
  const [district, setDistrict] = useState("");
  const [areaType, setAreaType] = useState("urban");
  const [occupation, setOccupation] = useState("farmer");
  const [category, setCategory] = useState("general");
  const [annualIncome, setAnnualIncome] = useState<number | "">(120000);
  const [isDifferentlyAbled, setIsDifferentlyAbled] = useState(false);
  const [rationCardType, setRationCardType] = useState("none");
  const [landHoldingAcres, setLandHoldingAcres] = useState<number | "">(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (initialMember) {
      setName(initialMember.name);
      setRelationship(initialMember.relationship as MemberRelationship);
      setAge(initialMember.age);
      setGender(initialMember.gender);
      setState(initialMember.state || defaultState);
      setDistrict(initialMember.district || "");
      setAreaType(initialMember.area_type || "urban");
      setOccupation(initialMember.occupation);
      setCategory(initialMember.category);
      setAnnualIncome(initialMember.annual_income);
      setIsDifferentlyAbled(Boolean(initialMember.is_differently_abled));
      setRationCardType(initialMember.ration_card_type || "none");
      setLandHoldingAcres(initialMember.land_holding_acres || 0);
    } else {
      setName("");
      setRelationship("father");
      setAge(35);
      setGender("male");
      setState(defaultState);
      setDistrict("");
      setAreaType("urban");
      setOccupation("farmer");
      setCategory("general");
      setAnnualIncome(120000);
      setIsDifferentlyAbled(false);
      setRationCardType("none");
      setLandHoldingAcres(0);
    }
    setError(null);
  }, [initialMember, defaultState, isOpen]);

  // Adjust default gender when relationship implies gender
  const handleRelationshipChange = (rel: MemberRelationship) => {
    setRelationship(rel);
    if (rel === "father" || rel === "brother" || rel === "son" || rel === "uncle" || rel === "grandfather") {
      setGender("male");
    } else if (rel === "mother" || rel === "sister" || rel === "daughter" || rel === "aunt" || rel === "grandmother") {
      setGender("female");
    }
  };

  const availableStates = Object.keys(INDIAN_DISTRICTS);
  const availableDistricts = INDIAN_DISTRICTS[state] || [];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isHindi ? "कृपया सदस्य का नाम दर्ज करें।" : "Please enter the member's full name.");
      return;
    }
    if (age === "" || Number(age) < 0 || Number(age) > 130) {
      setError(isHindi ? "कृपया वैध आयु दर्ज करें (0 - 130)।" : "Please enter a valid age (0 - 130).");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        name: name.trim(),
        relationship,
        age: Number(age),
        gender,
        state,
        district: district || (availableDistricts[0] || ""),
        area_type: areaType,
        occupation,
        category,
        annual_income: Number(annualIncome) || 0,
        is_differently_abled: isDifferentlyAbled,
        ration_card_type: rationCardType,
        land_holding_acres: Number(landHoldingAcres) || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || (isHindi ? "सदस्य को सहेजने में विफल।" : "Failed to save member."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#E2E8F0] shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#CBD5E1] bg-white hover:bg-gray-100 flex items-center justify-center text-[#525B64] hover:text-[#0C1924] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#1D5F49]/10 text-[#1D5F49] border border-[#1D5F49]/20">
              <Heart className="w-3.5 h-3.5" />
              <span>{isHindi ? "परिवार एवं लाभार्थी सदस्य" : "Family & Beneficiary"}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0C1924] flex items-center gap-2">
            {isEditing ? (
              <span>{isHindi ? "सदस्य विवरण संपादित करें" : "Edit Member Details"}</span>
            ) : (
              <span>{isHindi ? "नया सदस्य जोड़ें (Add Member)" : "Add Family Member"}</span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#525B64] mt-1 leading-relaxed">
            {isHindi
              ? "सदस्य की जानकारी दर्ज करें ताकि सीधे उनके नाम पर सरकारी योजनाओं की जांच की जा सके।"
              : "Save member details to instantly check tailored government schemes for them without extra forms."}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Name & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "सदस्य का पूरा नाम *" : "Member's Full Name *"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isHindi ? "उदा. रमेश शर्मा" : "e.g. Ramesh Sharma"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1D5F49] focus:ring-2 focus:ring-[#1D5F49]/20 text-xs sm:text-sm outline-hidden transition-all"
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "आपसे रिश्ता (Relationship) *" : "Relationship to You *"}
              </label>
              <select
                value={relationship}
                onChange={(e) => handleRelationshipChange(e.target.value as MemberRelationship)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1D5F49] focus:ring-2 focus:ring-[#1D5F49]/20 text-xs sm:text-sm outline-hidden transition-all bg-white"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel.key} value={rel.key}>
                    {rel.icon} {isHindi ? rel.labelHi : rel.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Age & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "आयु (वर्ष में) *" : "Age (in years) *"}
              </label>
              <input
                type="number"
                min="0"
                max="130"
                required
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="उदा. 45"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1D5F49] focus:ring-2 focus:ring-[#1D5F49]/20 text-xs sm:text-sm outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "लिंग (Gender) *" : "Gender *"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "male", labelHi: "पुरुष", labelEn: "Male" },
                  { key: "female", labelHi: "महिला", labelEn: "Female" },
                  { key: "transgender", labelHi: "अन्य", labelEn: "Other" },
                ].map((g) => (
                  <button
                    type="button"
                    key={g.key}
                    onClick={() => setGender(g.key)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                      gender === g.key
                        ? "bg-[#1D5F49] text-white border-[#1D5F49] shadow-2xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {isHindi ? g.labelHi : g.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. State, District & Area Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "राज्य (State)" : "State"}
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const dists = INDIAN_DISTRICTS[e.target.value] || [];
                  setDistrict(dists[0] || "");
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-hidden bg-white focus:border-[#1D5F49] focus:ring-1 focus:ring-[#1D5F49]"
              >
                {availableStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "जिला (District)" : "District"}
              </label>
              <select
                value={district || availableDistricts[0] || ""}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-hidden bg-white focus:border-[#1D5F49] focus:ring-1 focus:ring-[#1D5F49]"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "क्षेत्र प्रकार (Area)" : "Area Type"}
              </label>
              <select
                value={areaType}
                onChange={(e) => setAreaType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-hidden bg-white focus:border-[#1D5F49] focus:ring-1 focus:ring-[#1D5F49]"
              >
                <option value="rural">{isHindi ? "ग्रामीण (Rural)" : "Rural"}</option>
                <option value="urban">{isHindi ? "शहरी (Urban)" : "Urban"}</option>
                <option value="semi-urban">{isHindi ? "अर्ध-शहरी (Semi-Urban)" : "Semi-Urban"}</option>
              </select>
            </div>
          </div>

          {/* 4. Occupation & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "मुख्य व्यवसाय (Occupation) *" : "Occupation *"}
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1D5F49] focus:ring-2 focus:ring-[#1D5F49]/20 text-xs sm:text-sm outline-hidden transition-all bg-white"
              >
                <option value="farmer">{isHindi ? "किसान / कृषक (Farmer)" : "Farmer / Agriculture"}</option>
                <option value="student">{isHindi ? "छात्र / विद्यार्थी (Student)" : "Student"}</option>
                <option value="homemaker">{isHindi ? "गृहणी (Homemaker)" : "Homemaker"}</option>
                <option value="employed_private">{isHindi ? "निजी नौकरी (Private Job)" : "Private Sector Employed"}</option>
                <option value="employed_government">{isHindi ? "सरकारी नौकरी (Govt Job)" : "Government Employed"}</option>
                <option value="business_self_employed">{isHindi ? "व्यवसायी / स्वरोजगार (Self Employed)" : "Business / Self Employed"}</option>
                <option value="daily_wage_laborer">{isHindi ? "दैनिक मजदूर (Daily Wage Laborer)" : "Daily Wage Laborer"}</option>
                <option value="artisan_craftsperson">{isHindi ? "कारीगर / हस्तशिल्पी (Artisan)" : "Artisan / Craftsperson"}</option>
                <option value="unemployed">{isHindi ? "बेरोजगार (Unemployed)" : "Unemployed / Seeking Work"}</option>
                <option value="other">{isHindi ? "अन्य (Other)" : "Other"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "सामाजिक श्रेणी (Category) *" : "Social Category *"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1D5F49] focus:ring-2 focus:ring-[#1D5F49]/20 text-xs sm:text-sm outline-hidden transition-all bg-white"
              >
                <option value="general">{isHindi ? "सामान्य (General / Open)" : "General / Open"}</option>
                <option value="obc">{isHindi ? "ओबीसी (OBC)" : "OBC (Other Backward Class)"}</option>
                <option value="sc">{isHindi ? "एससी (SC - Scheduled Caste)" : "SC (Scheduled Caste)"}</option>
                <option value="st">{isHindi ? "एसटी (ST - Scheduled Tribe)" : "ST (Scheduled Tribe)"}</option>
                <option value="ews">{isHindi ? "ईडब्ल्यूएस (EWS)" : "EWS (Economically Weaker)"}</option>
              </select>
            </div>
          </div>

          {/* 5. Annual Income & Land Holding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "वार्षिक आय (Annual Income in ₹)" : "Annual Income (in ₹)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="उदा. 120000"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1D5F49] focus:ring-2 focus:ring-[#1D5F49]/20 text-xs sm:text-sm outline-hidden transition-all"
                />
                <IndianRupee className="absolute left-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "कृषि भूमि (Agricultural Land in Acres)" : "Land Holding (in Acres)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={landHoldingAcres}
                onChange={(e) => setLandHoldingAcres(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="उदा. 2.5 (भूमिहीन होने पर 0 छोड़ें)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1D5F49] focus:ring-2 focus:ring-[#1D5F49]/20 text-xs sm:text-sm outline-hidden transition-all"
              />
            </div>
          </div>

          {/* 6. Welfare Details: Ration Card & Divyangjan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isHindi ? "राशन कार्ड (Ration Card)" : "Ration Card Type"}
              </label>
              <select
                value={rationCardType}
                onChange={(e) => setRationCardType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-hidden bg-white focus:border-[#1D5F49] focus:ring-1 focus:ring-[#1D5F49]"
              >
                <option value="none">{isHindi ? "कोई नहीं (None)" : "None"}</option>
                <option value="bpl">{isHindi ? "बीपीएल (BPL)" : "BPL (Below Poverty Line)"}</option>
                <option value="antyodaya">{isHindi ? "अंत्योदय (AAY)" : "Antyodaya (AAY)"}</option>
                <option value="apl">{isHindi ? "एपीएल (APL)" : "APL (Above Poverty Line)"}</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDifferentlyAbled}
                  onChange={(e) => setIsDifferentlyAbled(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-[#1D5F49] focus:ring-[#1D5F49] border-gray-300 cursor-pointer accent-[#1D5F49]"
                />
                <span className="text-xs font-bold text-gray-800">
                  {isHindi ? "दिव्यांगजन / PwD (Differently Abled)" : "Differently Abled (PwD)"}
                </span>
              </label>
            </div>
          </div>

          {/* Footer inside form */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isHindi ? "सहेज रहे हैं..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? (isHindi ? "अपडेट करें" : "Update Member") : (isHindi ? "सदस्य जोड़ें" : "Save Member")}</span>
                </>
              )}
            </button>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isHindi ? "सहेज रहे हैं..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? (isHindi ? "अपडेट करें" : "Update Member") : (isHindi ? "सदस्य जोड़ें" : "Save Member")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
