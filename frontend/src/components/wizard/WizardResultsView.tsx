import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  CitizenProfile,
  EligibilityResult,
  RuleMatchEvidence,
  DocumentRequirement,
} from "@/types/schema";
import { EligibilityResponse } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit3,
  RotateCcw,
  Landmark,
  Coins,
  FileCheck,
  Building2,
  Info,
} from "lucide-react";

interface WizardResultsViewProps {
  results: EligibilityResponse;
  profile: CitizenProfile;
  onEditProfile: () => void;
  onReset: () => void;
  onViewSchemeDetail?: (schemeId: string) => void;
}

export const WizardResultsView: React.FC<WizardResultsViewProps> = ({
  results,
  profile,
  onEditProfile,
  onReset,
  onViewSchemeDetail = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [activeTab, setActiveTab] = useState<"eligible" | "ineligible">("eligible");
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(
    results.eligible_schemes.length > 0 ? results.eligible_schemes[0].scheme_id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedSchemeId(expandedSchemeId === id ? null : id);
  };

  const eligibleList = results.eligible_schemes || [];
  const ineligibleList = results.ineligible_schemes || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
      {/* 1. Celebration Match Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl">
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? "100% गणितीय मिलान सत्यापित" : "100% Mathematically Verified"}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {isHindi ? (
                <>
                  बधाई हो! आप <span className="text-amber-300 underline decoration-white/40">{results.eligible_count} सरकारी योजनाओं</span> के पूर्ण पात्र हैं
                </>
              ) : (
                <>
                  Congratulations! You qualify for{" "}
                  <span className="text-amber-300 underline decoration-white/40">
                    {results.eligible_count} government schemes
                  </span>
                </>
              )}
            </h2>

            <p className="text-sm text-white/90 leading-relaxed">
              {isHindi
                ? "आपके द्वारा दर्ज आयु, व्यवसाय, राज्य और आय के आधार पर नियम इंजन द्वारा आपकी सटीक पात्रता निकाली गई है।"
                : "Based on your demographic profile, our deterministic engine matched you with high-value welfare initiatives."}
            </p>
          </div>

          {/* Quick Counter Box */}
          <div className="p-5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center shrink-0 min-w-[170px]">
            <div className="text-4xl font-black text-amber-300 mb-1">
              {results.eligible_count}
            </div>
            <div className="text-xs font-semibold text-white/90 uppercase tracking-wider">
              {isHindi ? "पात्र योजनाएं" : "Eligible Schemes"}
            </div>
            <div className="mt-2 pt-2 border-t border-white/20 text-[11px] text-white/80">
              {isHindi
                ? `${results.total_schemes_evaluated} में से जांची गईं`
                : `Out of ${results.total_schemes_evaluated} evaluated`}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Citizen Profile Summary Strip */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-foreground mr-1">
            {isHindi ? "आपकी प्रोफाइल:" : "Your Profile:"}
          </span>
          <Badge variant="outline" className="text-xs">
            {profile.age} {isHindi ? "वर्ष" : "yrs"}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {profile.gender}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {profile.state}
          </Badge>
          <Badge variant="outline" className="text-xs uppercase">
            {profile.occupation}
          </Badge>
          <Badge variant="outline" className="text-xs uppercase">
            {profile.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            ₹{profile.annual_income?.toLocaleString("en-IN")}/yr
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditProfile}
            className="text-xs text-primary hover:text-primary space-x-1.5 h-8 px-2.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isHindi ? "विवरण बदलें" : "Edit Profile"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground space-x-1.5 h-8 px-2.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHindi ? "नई जांच" : "Reset"}</span>
          </Button>
        </div>
      </div>

      {/* 3. Filter Tabs: Eligible vs Ineligible */}
      <div className="flex items-center space-x-3 border-b border-border/70 pb-3">
        <button
          onClick={() => setActiveTab("eligible")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === "eligible"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isHindi ? "पात्र योजनाएं" : "Eligible Schemes"} ({results.eligible_count})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ineligible")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === "ineligible"
              ? "bg-slate-700 text-white shadow-md"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>
            {isHindi ? "अन्य योजनाएं (कारण सहित)" : "Other Schemes"} ({results.ineligible_count})
          </span>
        </button>
      </div>

      {/* 4. Schemes Results List */}
      <div className="space-y-4">
        {activeTab === "eligible" && (
          <>
            {eligibleList.length > 0 ? (
              eligibleList.map((scheme: EligibilityResult) => {
                const isExpanded = expandedSchemeId === scheme.scheme_id;
                return (
                  <div
                    key={scheme.scheme_id}
                    className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/30 bg-card shadow-subtle hover:border-emerald-500/60 transition-all space-y-4"
                  >
                    {/* Top Row: Title, Benefit & Match Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            100% {isHindi ? "पात्र" : "Eligible"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Building2 className="w-3.5 h-3.5 mr-1" />
                            <span className="capitalize">{scheme.category.replace("_", " ")}</span>
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                          onClick={() => onViewSchemeDetail(scheme.scheme_id)}
                        >
                          {isHindi ? scheme.scheme_name_hi : scheme.scheme_name_en}
                        </h3>
                      </div>

                      {/* Benefit Pill */}
                      <div className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm shrink-0">
                        <Coins className="w-4 h-4 mr-1.5" />
                        <span>{scheme.benefit_amount_text}</span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
                      {/* Why You Qualify Accordion Toggle */}
                      <button
                        onClick={() => toggleExpand(scheme.scheme_id)}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>
                          {isHindi ? "देखें आप क्यों पात्र हैं (नियम साक्ष्य)" : "Why You Qualify (Match Evidence)"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewSchemeDetail(scheme.scheme_id)}
                          className="text-xs h-8 rounded-lg"
                        >
                          {isHindi ? "विस्तार से देखें" : "View Details"}
                        </Button>

                        <a
                          href={scheme.official_portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm"
                        >
                          <span>{isHindi ? "आधिकारिक पोर्टल" : "Apply Online"}</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </a>
                      </div>
                    </div>

                    {/* Expandable "Why You Qualify" Explanation Panel */}
                    {isExpanded && (
                      <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3 animate-in fade-in duration-200">
                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>{isHindi ? "सत्यापित पात्रता नियम:" : "Satisfied Eligibility Criteria:"}</span>
                        </div>

                        <div className="space-y-1.5">
                          {scheme.matched_rules && scheme.matched_rules.length > 0 ? (
                            scheme.matched_rules.map((rule: RuleMatchEvidence, rIdx: number) => (
                              <div
                                key={rIdx}
                                className="text-xs text-foreground/80 flex items-start space-x-2"
                              >
                                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                                <span>{isHindi ? rule.evidence_text_hi : rule.evidence_text_en}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              {isHindi
                                ? "आपके सभी जनसांख्यिकीय मानदंड इस योजना के नियमों के पूर्ण अनुकूल हैं।"
                                : "All demographic criteria fully satisfy the rules of this welfare scheme."}
                            </div>
                          )}
                        </div>

                        {/* Documents Checklist preview */}
                        {scheme.required_documents && scheme.required_documents.length > 0 && (
                          <div className="pt-2 border-t border-emerald-500/20">
                            <div className="text-[11px] font-bold text-muted-foreground mb-1">
                              {isHindi ? "आवश्यक दस्तावेज:" : "Key Documents Needed:"}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {scheme.required_documents.map((doc: DocumentRequirement) => (
                                <Badge key={doc.id} variant="secondary" className="text-[10px]">
                                  {isHindi ? doc.name_hi : doc.name_en}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-card rounded-2xl border border-border">
                <p className="text-sm text-muted-foreground">
                  {isHindi
                    ? "वर्तमान प्रोफाइल के अनुसार कोई योजना पूरी तरह मेल नहीं खाती। कृपया अपनी जानकारी की समीक्षा करें।"
                    : "No schemes match with 100% criteria. Please review your answers."}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "ineligible" && (
          <>
            {ineligibleList.length > 0 ? (
              ineligibleList.map((scheme: EligibilityResult) => {
                const isExpanded = expandedSchemeId === scheme.scheme_id;
                return (
                  <div
                    key={scheme.scheme_id}
                    className="p-5 rounded-2xl border border-border bg-card/60 space-y-3 opacity-90"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-foreground">
                          {isHindi ? scheme.scheme_name_hi : scheme.scheme_name_en}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {scheme.benefit_amount_text}
                        </p>
                      </div>

                      <Badge variant="outline" className="text-xs text-destructive border-destructive/30 self-start sm:self-auto">
                        {isHindi ? "वर्तमान में अपात्र" : "Currently Ineligible"}
                      </Badge>
                    </div>

                    {/* Failing Rules Toggle */}
                    <button
                      onClick={() => toggleExpand(scheme.scheme_id)}
                      className="text-xs font-semibold text-destructive hover:underline flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>
                        {isHindi ? "देखें आप क्यों अपात्र हैं (कारण)" : "See Why You Do Not Qualify"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2 text-xs">
                        <div className="font-bold text-destructive">
                          {isHindi ? "अपात्रता के मुख्य कारण:" : "Reasons for ineligibility:"}
                        </div>
                        {scheme.ineligibility_reasons_hi && scheme.ineligibility_reasons_hi.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {((isHindi ? scheme.ineligibility_reasons_hi : scheme.ineligibility_reasons_en || scheme.ineligibility_reasons_hi) || []).map((r: string, i: number) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        ) : scheme.failing_rules && scheme.failing_rules.length > 0 ? (
                          <div className="space-y-1 text-muted-foreground">
                            {scheme.failing_rules.map((f: RuleMatchEvidence, i: number) => (
                              <div key={i} className="flex items-start space-x-1.5">
                                <span className="text-destructive font-bold">✕</span>
                                <span>{isHindi ? f.evidence_text_hi : f.evidence_text_en}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            {isHindi ? "मापदंड अनुकूल नहीं हैं।" : "Criteria not satisfied."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-card rounded-2xl border border-border">
                <p className="text-sm text-muted-foreground">
                  {isHindi ? "कोई अपात्र योजना नहीं है।" : "No ineligible schemes recorded."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. Direct Action Callout */}
      <div className="p-5 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Landmark className="w-6 h-6 text-primary shrink-0" />
          <div>
            <div className="text-sm font-bold text-foreground">
              {isHindi ? "बिना किसी बिचौलिये के सीधे आवेदन करें" : "Apply Directly With Zero Middlemen"}
            </div>
            <div className="text-xs text-muted-foreground">
              {isHindi
                ? "प्रत्येक योजना के आधिकारिक सरकारी पोर्टल पर जाकर ऑनलाइन आवेदन करें अथवा निकटतम CSC केंद्र जाएं।"
                : "Apply directly on official ministry portals or visit your nearest Jan Seva Kendra (CSC)."}
            </div>
          </div>
        </div>

        <Button
          onClick={onReset}
          variant="outline"
          className="w-full sm:w-auto shrink-0 text-xs font-bold rounded-xl"
        >
          {isHindi ? "नया मूल्यांकन प्रारंभ करें" : "Start New Check"}
        </Button>
      </div>
    </div>
  );
};
