import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { FamilyMember, FamilyMemberInput } from "@/types/auth";
import { MemberFormModal, RELATIONSHIPS } from "./MemberFormModal";
import { MemberSchemesModal } from "./MemberSchemesModal";
import {
  X,
  User,
  Users,
  Briefcase,
  IndianRupee,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";

interface MyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditDetails: () => void;
  onCheckEligibility: () => void;
  onSelectScheme?: (schemeId: string) => void;
  initialTab?: "profile" | "members";
}

export const MyDetailsModal: React.FC<MyDetailsModalProps> = ({
  isOpen,
  onClose,
  onEditDetails,
  onCheckEligibility,
  onSelectScheme = () => {},
  initialTab = "profile",
}) => {
  const { language } = useApp();
  const { user, familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useAuth();
  const isHindi = language === "hi";

  const [activeTab, setActiveTab] = useState<"profile" | "members">(initialTab);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [schemesMember, setSchemesMember] = useState<FamilyMember | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !user) return null;

  const details = user.citizen_details;
  const hasDetails = Boolean(
    details &&
      Object.keys(details).length > 0 &&
      (details.age !== undefined || details.occupation !== undefined || details.state !== undefined)
  );

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
      case "artisan_craftsperson":
        return isHindi ? "कारीगर / हस्तशिल्पी (Artisan)" : "Artisan / Craftsperson";
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

  const getRelationshipInfo = (rel: string) => {
    const found = RELATIONSHIPS.find((r) => r.key === rel);
    if (found) {
      return {
        label: isHindi ? found.labelHi : found.labelEn,
        icon: found.icon,
      };
    }
    return { label: rel, icon: "👤" };
  };

  const handleSaveMember = async (memberData: FamilyMemberInput) => {
    if (editingMember) {
      await updateFamilyMember(editingMember.id, memberData);
    } else {
      await addFamilyMember(memberData);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const confirmMsg = isHindi
      ? "क्या आप वाकई इस सदस्य को हटाना चाहते हैं?"
      : "Are you sure you want to remove this member?";
    if (window.confirm(confirmMsg)) {
      try {
        setIsDeletingId(memberId);
        await deleteFamilyMember(memberId);
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  return (
    <>
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
          <div className="p-5 sm:p-6 bg-white border-b border-[#E2E8F0] shrink-0 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>

            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1D5F49]/10 text-[#1D5F49] border border-[#1D5F49]/20">
                <User className="w-3.5 h-3.5" />
                <span>{isHindi ? "नागरिक प्रोफ़ाइल" : "Citizen Profile"}</span>
              </span>
              <span className="text-xs text-[#525B64] font-medium">
                {user.email}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0C1924] flex items-center gap-2">
              <span>{isHindi ? "प्रोफ़ाइल एवं परिवार प्रबंधन" : "Profile & Family Management"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#525B64] mt-1 leading-relaxed">
              {isHindi
                ? "अपने स्वयं के और परिवार के सभी सदस्यों के विवरण प्रबंधित करें व सीधे उनके नाम पर सरकारी योजनाएं खोजें।"
                : "Manage personal and family member details to evaluate and discover eligible government schemes."}
            </p>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-[#1D5F49] text-white shadow-xs"
                    : "bg-slate-100 text-[#525B64] hover:bg-slate-200"
                }`}
              >
                <User className="w-4 h-4" />
                <span>{isHindi ? "मेरा विवरण (My Details)" : "My Details"}</span>
                {hasDetails && (
                  <span className={`w-2 h-2 rounded-full ${activeTab === "profile" ? "bg-emerald-300" : "bg-[#1D5F49]"}`} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("members")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "members"
                    ? "bg-[#1D5F49] text-white shadow-xs"
                    : "bg-slate-100 text-[#525B64] hover:bg-slate-200"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{isHindi ? "परिवार एवं सदस्य (Family)" : "Family Members"}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                    activeTab === "members"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-[#0C1924]"
                  }`}
                >
                  {familyMembers.length}
                </span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
            {activeTab === "profile" ? (
              /* TAB 1: Citizen's Personal Details */
              !hasDetails || !details ? (
                /* Empty State */
                <div className="text-center py-12 px-4 space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#1D5F49]/10 text-[#1D5F49] flex items-center justify-center border border-[#1D5F49]/20 shadow-xs">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#0C1924]">
                      {isHindi ? "आपने अभी तक अपने विवरण नहीं जोड़े हैं" : "No Profile Details Saved Yet"}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#525B64] max-w-md mx-auto leading-relaxed">
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
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
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#1D5F49] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0C1924]">{user.full_name}</h4>
                        <p className="text-xs text-[#525B64]">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditDetails();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1D5F49] text-[#1D5F49] hover:bg-[#1D5F49]/10 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isHindi ? "संपादित करें" : "Edit Details"}</span>
                    </button>
                  </div>

                  {/* 4 Details Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. Basic Info */}
                    <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1D5F49]">
                        <User className="w-4 h-4" />
                        <span>{isHindi ? "बुनियादी जानकारी" : "Basic Information"}</span>
                      </div>
                      <div className="text-xs space-y-1.5 text-gray-600">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>{isHindi ? "आयु (Age)" : "Age"}:</span>
                          <span className="font-semibold text-gray-900">
                            {details.age} {isHindi ? "वर्ष" : "yrs"}
                          </span>
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
                    <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white space-y-2.5 shadow-2xs">
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
                            {details.land_holding_acres
                              ? `${details.land_holding_acres} एकड़`
                              : isHindi
                              ? "लागू नहीं / भूमिहीन"
                              : "None / Landless"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Income & Category */}
                    <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                        <IndianRupee className="w-4 h-4" />
                        <span>{isHindi ? "आय व सामाजिक श्रेणी" : "Income & Category"}</span>
                      </div>
                      <div className="text-xs space-y-1.5 text-gray-600">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>{isHindi ? "वार्षिक आय" : "Annual Income"}:</span>
                          <span className="font-bold text-[#1D5F49]">
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
              )
            ) : (
              /* TAB 2: Family & Dependent Members */
              <div className="space-y-4">
                {/* Actions row */}
                <div className="flex items-center justify-between gap-3 bg-[#1D5F49]/5 p-3.5 rounded-2xl border border-[#1D5F49]/15">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#1D5F49]" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0C1924]">
                        {isHindi ? "परिवार एवं अन्य सदस्य" : "Family & Beneficiary Members"}
                      </h4>
                      <p className="text-[11px] text-[#525B64]">
                        {isHindi
                          ? "माता, पिता, भाई, बहन, दोस्त आदि को जोड़ें और योजनाएं देखें।"
                          : "Add father, mother, sister, brother, uncle, friend etc. to evaluate schemes."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingMember(null);
                      setIsMemberFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white text-xs font-bold shadow-xs hover:scale-[1.01] transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isHindi ? "सदस्य जोड़ें" : "Add Member"}</span>
                  </button>
                </div>

                {familyMembers.length === 0 ? (
                  /* Empty State for Members */
                  <div className="text-center py-12 px-4 space-y-3.5 bg-gray-50/80 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#1D5F49]/10 text-[#1D5F49] flex items-center justify-center shadow-2xs">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-[#0C1924]">
                        {isHindi ? "अभी तक कोई अन्य सदस्य नहीं जोड़ा गया" : "No Family Members Added Yet"}
                      </h4>
                      <p className="text-xs text-[#525B64] max-w-md mx-auto leading-relaxed">
                        {isHindi
                          ? "आप अपने पिता (किसान), बहन (विद्यार्थी), माता (गृहणी), भाई या दोस्त को यहां जोड़ सकते हैं ताकि सीधे उनके लिए उपलब्ध योजनाएं देख सकें।"
                          : "You can add your father (farmer), sister (student), mother (homemaker), brother, or friend to find schemes tailored specifically for them."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(null);
                        setIsMemberFormOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white text-xs font-bold shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isHindi ? "पहला सदस्य जोड़ें" : "Add First Member"}</span>
                    </button>
                  </div>
                ) : (
                  /* Members Cards List */
                  <div className="grid grid-cols-1 gap-3">
                    {familyMembers.map((m) => {
                      const relInfo = getRelationshipInfo(m.relationship);
                      return (
                        <div
                          key={m.id}
                          className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs hover:shadow-xs transition-all space-y-3"
                        >
                          {/* Top Row: Avatar, Name, Relationship, and Edit/Delete */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-[#1D5F49]/10 text-[#1D5F49] text-lg flex items-center justify-center shadow-2xs shrink-0">
                                {relInfo.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-[#0C1924]">{m.name}</h4>
                                  <span className="px-2 py-0.5 rounded-full bg-[#1D5F49]/10 text-[#1D5F49] border border-[#1D5F49]/20 text-[10px] font-bold">
                                    {relInfo.label}
                                  </span>
                                </div>
                                <p className="text-xs text-[#525B64]">
                                  {m.age} {isHindi ? "वर्ष" : "yrs"} • {getGenderLabel(m.gender)} • {m.state || user.state || "India"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMember(m);
                                  setIsMemberFormOpen(true);
                                }}
                                title={isHindi ? "संपादित करें" : "Edit"}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(m.id)}
                                disabled={isDeletingId === m.id}
                                title={isHindi ? "हटाएं" : "Delete"}
                                className="p-2 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-40"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Member Attributes Pill Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#525B64] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                            <div>
                              <span className="text-gray-400 block">{isHindi ? "पेशा:" : "Occupation:"}</span>
                              <span className="font-semibold text-gray-800 truncate block">
                                {getOccupationLabel(m.occupation)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 block">{isHindi ? "वार्षिक आय:" : "Income:"}</span>
                              <span className="font-semibold text-[#1D5F49] block">
                                ₹{Number(m.annual_income || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 block">{isHindi ? "श्रेणी व राशन:" : "Category:"}</span>
                              <span className="font-semibold text-gray-800 block capitalize">
                                {m.category} {m.ration_card_type && m.ration_card_type !== "none" ? `• ${m.ration_card_type.toUpperCase()}` : ""}
                              </span>
                            </div>
                          </div>

                          {/* Action Button: Check Eligible Schemes for this member */}
                          <div className="pt-1 flex items-center justify-between gap-2 border-t border-gray-100">
                            <span className="text-[11px] text-gray-500 font-medium">
                              {isHindi ? "योजना पात्रता जांचें:" : "Eligibility Check:"}
                            </span>

                            <button
                              type="button"
                              onClick={() => setSchemesMember(m)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white text-xs font-bold shadow-2xs hover:scale-[1.02] transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                              <span>{isHindi ? "योजनाएं देखें (View Schemes)" : "View Schemes"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 bg-[#F8FAFC] border-t border-[#E2E8F0] shrink-0 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
            >
              {isHindi ? "बंद करें" : "Close"}
            </button>

            {activeTab === "profile" && hasDetails && details && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCheckEligibility();
                }}
                className="py-2.5 px-5 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHindi ? "पात्र योजनाओं की जांच करें" : "Check Eligible Schemes"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {activeTab === "members" && (
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setIsMemberFormOpen(true);
                }}
                className="py-2.5 px-5 rounded-xl bg-[#1D5F49] hover:bg-[#174E3C] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHindi ? "+ नया सदस्य जोड़ें" : "+ Add New Member"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Member Form Modal */}
      <MemberFormModal
        isOpen={isMemberFormOpen}
        onClose={() => {
          setIsMemberFormOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        initialMember={editingMember}
        defaultState={user.state || "Rajasthan"}
      />

      {/* Member-specific Schemes Evaluation Modal */}
      <MemberSchemesModal
        isOpen={!!schemesMember}
        member={schemesMember}
        onClose={() => setSchemesMember(null)}
        onSelectScheme={(schemeId) => {
          setSchemesMember(null);
          onClose();
          onSelectScheme(schemeId);
        }}
      />
    </>
  );
};

export default MyDetailsModal;
