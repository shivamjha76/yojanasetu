import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { FamilyMember } from "@/types/auth";
import { EligibilityResult } from "@/types/schema";
import { api } from "@/services/api";
import {
  X,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface MemberSchemesModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onSelectScheme: (schemeId: string) => void;
}

export const MemberSchemesModal: React.FC<MemberSchemesModalProps> = ({
  isOpen,
  member,
  onClose,
  onSelectScheme,
}) => {
  const { language } = useApp();
  const { token } = useAuth();
  const isHindi = language === "hi";

  const [isLoading, setIsLoading] = useState(true);
  const [eligibleSchemes, setEligibleSchemes] = useState<EligibilityResult[]>([]);
  const [totalEvaluated, setTotalEvaluated] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!isOpen || !member) return;

    let isMounted = true;
    setIsLoading(true);
    setSearchQuery("");
    setSelectedCategory("all");

    const fetchEligibility = async () => {
      try {
        const authToken = token || "offline-token";
        const res = await api.getFamilyMemberEligibility(authToken, member.id);
        if (isMounted) {
          setEligibleSchemes(res.eligible_schemes || []);
          setTotalEvaluated(res.total_schemes_evaluated || 0);
        }
      } catch (err) {
        console.error("Failed to evaluate member schemes:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEligibility();

    return () => {
      isMounted = false;
    };
  }, [isOpen, member, token]);

  if (!isOpen || !member) return null;

  // Filter schemes
  const filteredSchemes = eligibleSchemes.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const nameMatch =
      item.scheme_name_hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scheme_name_en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && (searchQuery ? nameMatch : true);
  });

  // Extract unique categories in result
  const availableCategories = Array.from(new Set(eligibleSchemes.map((s) => s.category)));

  const getRelationshipBadge = (rel: string) => {
    switch (rel) {
      case "father":
        return isHindi ? "पिता (Father)" : "Father";
      case "mother":
        return isHindi ? "माता (Mother)" : "Mother";
      case "brother":
        return isHindi ? "भाई (Brother)" : "Brother";
      case "sister":
        return isHindi ? "बहन (Sister)" : "Sister";
      case "spouse":
        return isHindi ? "पति / पत्नी (Spouse)" : "Spouse";
      case "son":
        return isHindi ? "बेटा / पुत्र (Son)" : "Son";
      case "daughter":
        return isHindi ? "बेटी / पुत्री (Daughter)" : "Daughter";
      case "uncle":
        return isHindi ? "चाचा / मामा (Uncle)" : "Uncle";
      case "aunt":
        return isHindi ? "चाची / मौसी (Aunt)" : "Aunt";
      case "grandfather":
        return isHindi ? "दादा / नाना (Grandfather)" : "Grandfather";
      case "grandmother":
        return isHindi ? "दादी / नानी (Grandmother)" : "Grandmother";
      case "friend":
        return isHindi ? "मित्र / दोस्त (Friend)" : "Friend";
      default:
        return isHindi ? "सदस्य (Member)" : "Member";
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
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0D684E] to-[#148364] text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-300/25 text-emerald-100 border border-emerald-300/30">
              <span>{getRelationshipBadge(member.relationship)}</span>
            </span>
            <span className="text-xs text-emerald-200/90 font-medium">
              {member.age} {isHindi ? "वर्ष" : "yrs"} • {member.occupation} • {member.state || "India"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{member.name} {isHindi ? "के लिए पात्र योजनाएं" : "Eligible Schemes"}</span>
            {!isLoading && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-white border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{eligibleSchemes.length} {isHindi ? "योजनाएं" : "Schemes"}</span>
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
            {isHindi
              ? `${member.name} की प्रोफ़ाइल (उम्र: ${member.age}, पेशा: ${member.occupation}, आय: ₹${Number(member.annual_income || 0).toLocaleString("en-IN")}) के आधार पर चुनी गई लाभकारी योजनाएं:`
              : `Government schemes evaluated specifically for ${member.name} based on their profile:`}
          </p>
        </div>

        {/* Filter bar */}
        {!isLoading && eligibleSchemes.length > 0 && (
          <div className="p-3 sm:px-6 bg-gray-50 border-b border-gray-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? "योजना खोजें..." : "Search scheme by name..."}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs outline-hidden focus:border-[#0D684E] focus:ring-1 focus:ring-[#0D684E]"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Category Filter */}
            {availableCategories.length > 1 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs outline-hidden focus:border-[#0D684E] text-gray-700"
              >
                <option value="all">{isHindi ? "सभी श्रेणियां (All Categories)" : "All Categories"}</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Schemes List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-3.5">
          {isLoading ? (
            <div className="text-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-[#0D684E] animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-gray-600">
                {isHindi ? `${member.name} के लिए योजनाएं जांची जा रही हैं...` : "Evaluating scheme eligibility rules..."}
              </p>
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900">
                  {isHindi ? "कोई योजना नहीं मिली" : "No Schemes Found"}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {searchQuery
                    ? isHindi
                      ? "आपके खोज शब्द से मेल खाती कोई योजना नहीं है।"
                      : "No schemes match your search filter."
                    : isHindi
                    ? "इस प्रोफ़ाइल मापदंड के अनुसार वर्तमान में कोई सीधी योजना नहीं मिली। विवरण अपडेट करके पुनः जांच करें।"
                    : "No matching welfare schemes for this criteria. Try updating member attributes."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSchemes.map((item) => (
                <div
                  key={item.scheme_id}
                  className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0D684E] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-[#0D684E]" />
                        <span>{item.match_percentage}% {isHindi ? "पात्रता" : "Match"}</span>
                      </span>
                      <span className="text-[11px] font-medium text-gray-400 capitalize">
                        {item.category.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug group-hover:text-[#0D684E] transition-colors">
                      {isHindi ? item.scheme_name_hi : item.scheme_name_en}
                    </h3>

                    {/* Matched rules summary */}
                    {item.matched_rules && item.matched_rules.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.matched_rules.slice(0, 3).map((rule, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {isHindi ? rule.evidence_text_hi : rule.evidence_text_en}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="shrink-0 flex items-center justify-end sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectScheme(item.scheme_id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D684E] hover:bg-[#094D3A] text-white text-xs font-bold shadow-2xs hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <span>{isHindi ? "विवरण देखें" : "View Details"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 shrink-0 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-500 font-medium">
            {isHindi
              ? `कुल ${totalEvaluated} योजनाओं का मूल्यांकन किया गया`
              : `Scanned ${totalEvaluated} government schemes`}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
          >
            {isHindi ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
