import React from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  ChevronRight,
  Building2,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface SchemeCardProps {
  scheme: Scheme;
  matchPercentage?: number;
  isEligible?: boolean;
  onViewDetails?: (id: string) => void;
  onCheckEligibility?: (id: string) => void;
}

const CATEGORY_STYLES: Record<string, { labelHi: string; labelEn: string; color: string }> = {
  agriculture: {
    labelHi: "कृषि एवं किसान",
    labelEn: "Agriculture",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/40",
  },
  education_scholarships: {
    labelHi: "शिक्षा एवं छात्रवृत्ति",
    labelEn: "Education",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/40",
  },
  healthcare: {
    labelHi: "स्वास्थ्य एवं चिकित्सा",
    labelEn: "Healthcare",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300/40",
  },
  women_child: {
    labelHi: "महिला एवं बाल कल्याण",
    labelEn: "Women & Child",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300/40",
  },
  housing_urban: {
    labelHi: "आवास एवं बुनियादी ढांचा",
    labelEn: "Housing & Shelter",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40",
  },
  business_msme_loans: {
    labelHi: "व्यापार एवं मुद्रा ऋण",
    labelEn: "Business & MSME",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300/40",
  },
  skills_employment: {
    labelHi: "कौशल एवं रोजगार",
    labelEn: "Skills & Jobs",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/40",
  },
  social_security_pensions: {
    labelHi: "सामाजिक सुरक्षा व पेंशन",
    labelEn: "Social Security",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300/40",
  },
};

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  matchPercentage,
  isEligible,
  onViewDetails,
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const catMeta = CATEGORY_STYLES[scheme.category] || {
    labelHi: scheme.category,
    labelEn: scheme.category,
    color: "bg-muted text-muted-foreground",
  };

  const isStateLevel = scheme.level === "state" && scheme.applicable_state;

  return (
    <Card className="card-interactive flex flex-col justify-between overflow-hidden border border-border/90 bg-card hover:border-primary/50">
      <div>
        {/* Top Badges Strip */}
        <div className="p-5 pb-0 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category Pill */}
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catMeta.color}`}
            >
              {isHindi ? catMeta.labelHi : catMeta.labelEn}
            </span>

            {/* Level Tag (Central or State) */}
            <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
              {isStateLevel ? `State: ${scheme.applicable_state}` : "Central Govt"}
            </Badge>
          </div>

          {/* Match Score (when displayed in eligibility results) */}
          {typeof matchPercentage === "number" && (
            <div>
              {isEligible ? (
                <Badge variant="success" className="flex items-center space-x-1 font-bold text-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>
                    {isHindi
                      ? `${matchPercentage}% पात्र`
                      : `${matchPercentage}% Eligible`}
                  </span>
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center space-x-1 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{isHindi ? "अपात्र" : "Ineligible"}</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Card Header & Titles */}
        <CardHeader className="pt-3 pb-2">
          <CardTitle className="text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2">
            {isHindi ? scheme.name_hi : scheme.name_en}
          </CardTitle>
          <div className="flex items-center text-xs text-muted-foreground mt-1 line-clamp-1">
            <Building2 className="w-3.5 h-3.5 mr-1 shrink-0 text-primary/70" />
            <span className="truncate">{scheme.ministry}</span>
          </div>
        </CardHeader>

        {/* Card Content & Benefit Amount Highlight */}
        <CardContent className="space-y-3 pb-3">
          {/* High-Impact Benefit Amount Pill */}
          <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground">
                {isHindi ? "योजना का मुख्य लाभ" : "Key Benefit Amount"}
              </div>
              <div className="text-sm font-bold text-primary">
                {scheme.benefit_amount_text}
              </div>
            </div>
          </div>

          {/* Short Summary Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {isHindi ? scheme.short_summary_hi : scheme.short_summary_en}
          </p>

          {/* Documents Count indicator */}
          <div className="flex items-center space-x-1.5 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isHindi
                ? `${scheme.documents.length} आवश्यक दस्तावेज`
                : `${scheme.documents.length} required documents`}
            </span>
          </div>
        </CardContent>
      </div>

      {/* Card Action Buttons */}
      <CardFooter className="pt-2 pb-4 flex items-center justify-between gap-2 border-t border-border/50 bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails && onViewDetails(scheme.id)}
          className="text-xs flex-1 hover:border-primary/40 font-medium"
        >
          <span>{isHindi ? "विस्तार से देखें" : "View Details"}</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>

        <a
          href={scheme.official_portal_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-9 px-3 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border shrink-0"
          title={isHindi ? "आधिकारिक सरकारी पोर्टल खोलें" : "Open official portal"}
        >
          <span className="hidden sm:inline mr-1">
            {isHindi ? "आधिकारिक पोर्टल" : "Portal"}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-primary" />
        </a>
      </CardFooter>
    </Card>
  );
};
