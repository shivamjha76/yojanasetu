import React from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import { DocumentChecklist } from "./DocumentChecklist";
import { WhyYouQualifyAccordion } from "./WhyYouQualifyAccordion";
import { HowToApplySection } from "./HowToApplySection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Coins,
  ShieldCheck,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";

interface SchemeDetailPageProps {
  scheme: Scheme;
  onBack: () => void;
  onCheckEligibility?: () => void;
  onLocateCsc?: () => void;
}

export const SchemeDetailPage: React.FC<SchemeDetailPageProps> = ({
  scheme,
  onBack,
  onCheckEligibility = () => {},
  onLocateCsc = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const isStateLevel = scheme.level === "state" && scheme.applicable_state;

  return (
    <div className="min-h-screen bg-background text-foreground py-8 animate-in fade-in duration-300">
      <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
        {/* 1. Breadcrumb & Back Button */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <button
            onClick={onBack}
            className="hover:text-foreground flex items-center space-x-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>{isHindi ? "वापस जाएं" : "Back to Schemes"}</span>
          </button>
          <span>/</span>
          <span className="capitalize">{scheme.category.replace(/_/g, " ")}</span>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {isHindi ? scheme.name_hi : scheme.name_en}
          </span>
        </div>

        {/* 2. Scheme Detail Header */}
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-subtle space-y-6 mb-8">
          <div className="space-y-3">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {scheme.category.toUpperCase().replace(/_/g, " ")}
              </span>

              <Badge variant="outline" className="text-xs font-medium">
                {isStateLevel ? `State: ${scheme.applicable_state}` : "Central Government Scheme"}
              </Badge>

              <div className="inline-flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold ml-auto">
                <ShieldCheck className="w-4 h-4" />
                <span>{isHindi ? "मंत्रालय द्वारा सत्यापित" : "Official & Verified"}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {isHindi ? scheme.name_hi : scheme.name_en}
            </h1>

            {/* Ministry */}
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">{scheme.ministry}</span>
            </div>

            {/* Short Summary */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2">
              {isHindi ? scheme.short_summary_hi : scheme.short_summary_en}
            </p>
          </div>

          {/* 3. High-Impact Key Benefits Box (Step 43 Star Feature) */}
          <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Coins className="w-4 h-4" />
                  <span>{isHindi ? "कुल वित्तीय सहायता / मुख्य लाभ" : "Key Financial Benefit"}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">
                  {scheme.benefit_amount_text}
                </div>
              </div>

              <Badge variant="success" className="text-xs px-3 py-1 self-start sm:self-auto uppercase tracking-wide">
                {scheme.benefit_type.replace(/_/g, " ")}
              </Badge>
            </div>

            {/* Action Buttons inside Key Benefit Box */}
            <div className="pt-3 border-t border-primary/20 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={scheme.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.01]"
              >
                <span>{isHindi ? "आधिकारिक पोर्टल पर आवेदन करें" : "Apply on Official Govt Portal"}</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>

              <Button
                variant="outline"
                onClick={onCheckEligibility}
                className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-semibold hover:border-primary/50"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
                <span>{isHindi ? "अपनी पात्रता जांचें" : "Check My Eligibility"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4. Detailed Description & Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left 2 Cols: Details & Application Process */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detailed Description */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>{isHindi ? "योजना का विस्तृत विवरण" : "Detailed Overview"}</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isHindi ? scheme.detailed_description_hi : scheme.detailed_description_en}
              </p>
            </div>

            {/* Step 44: Why You Qualify Accordion */}
            <WhyYouQualifyAccordion
              scheme={scheme}
              onCheckEligibility={onCheckEligibility}
            />

            {/* Step 45: How To Apply Section */}
            <HowToApplySection
              scheme={scheme}
              onLocateCsc={onLocateCsc}
            />
          </div>

          {/* Right Col: Documents Checklist */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <DocumentChecklist documents={scheme.documents} />

              {/* Portal Card */}
              <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isHindi ? "सत्यापित पोर्टल लिंक" : "Official Government Portal"}
                </div>
                <div className="text-xs text-foreground truncate font-mono bg-muted p-2 rounded-lg">
                  {scheme.official_portal_url}
                </div>
                <a
                  href={scheme.official_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center h-10 px-4 rounded-xl bg-card border border-border hover:border-primary/50 text-xs font-semibold text-primary transition-colors space-x-1.5"
                >
                  <span>{isHindi ? "वेबसाइट खोलें" : "Visit Portal"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
