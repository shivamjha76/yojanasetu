import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Scheme, Rule } from "@/types/schema";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface WhyYouQualifyAccordionProps {
  scheme: Scheme;
  onCheckEligibility?: () => void;
}

export const WhyYouQualifyAccordion: React.FC<WhyYouQualifyAccordionProps> = ({
  scheme,
  onCheckEligibility = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [isOpen, setIsOpen] = useState(true);

  // Friendly human rule formatter
  const formatRule = (rule: Rule) => {
    if (isHindi && rule.description_hi) return rule.description_hi;
    if (!isHindi && rule.description_en) return rule.description_en;

    const fieldMap: Record<string, { hi: string; en: string }> = {
      age: { hi: "आयु सीमा", en: "Age Limit" },
      annual_income: { hi: "वार्षिक पारिवारिक आय", en: "Annual Family Income" },
      gender: { hi: "पात्र लिंग", en: "Eligible Gender" },
      occupation: { hi: "पात्र व्यवसाय", en: "Eligible Occupation" },
      state: { hi: "निवास राज्य", en: "Resident State" },
      land_holding_acres: { hi: "कृषि भूमि रकबा", en: "Land Holding" },
      category: { hi: "सामाजिक वर्ग", en: "Social Category" },
      is_differently_abled: { hi: "दिव्यांगजन स्थिति", en: "Differently Abled" },
    };

    const fieldLabel = fieldMap[rule.field]
      ? isHindi
        ? fieldMap[rule.field].hi
        : fieldMap[rule.field].en
      : rule.field;

    let opText = `${rule.operator} ${rule.value}`;
    if (rule.operator === "<=") opText = isHindi ? `अधिकतम ₹${rule.value?.toLocaleString("en-IN")}` : `Up to ${rule.value}`;
    if (rule.operator === ">=") opText = isHindi ? `न्यूनतम ${rule.value}` : `At least ${rule.value}`;
    if (rule.operator === "==") opText = isHindi ? `${rule.value}` : `${rule.value}`;
    if (rule.operator === "IN") opText = isHindi ? `${Array.isArray(rule.value) ? rule.value.join(", ") : rule.value}` : `${rule.value}`;

    return `${fieldLabel}: ${opText}`;
  };

  const rulesList = scheme.rules || [];

  return (
    <div className="rounded-2xl border-2 border-emerald-500/30 bg-card overflow-hidden shadow-subtle">
      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer flex items-center justify-between transition-colors hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>{isHindi ? "पात्रता मानदंड एवं नियम (सत्यापित शर्तें)" : "Eligibility Rules & Qualifying Criteria"}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                100% Deterministic
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isHindi
                ? "सरकारी राजपत्र और मंत्रालय के नियमों पर आधारित शून्य-भ्रम शर्तें"
                : "Ministry-verified mathematical rules with zero hallucination"}
            </p>
          </div>
        </div>

        <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
          {/* Rules Checklist */}
          <div className="space-y-3">
            {rulesList.length > 0 ? (
              rulesList.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex items-start space-x-3 text-xs sm:text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">
                      {formatRule(rule)}
                    </div>
                    {rule.field === "annual_income" && (
                      <div className="text-[11px] text-muted-foreground">
                        {isHindi
                          ? "तहसीलदार / राजस्व विभाग द्वारा जारी आय प्रमाण पत्र अनुसार"
                          : "As per income certificate issued by competent revenue authority"}
                      </div>
                    )}
                    {rule.field === "age" && (
                      <div className="text-[11px] text-muted-foreground">
                        {isHindi
                          ? "आधार कार्ड या जन्म प्रमाण पत्र में दर्ज आयु मान्य"
                          : "Age verified as per Aadhaar or Matriculation certificate"}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex items-center space-x-3 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-foreground">
                  {isHindi
                    ? "भारत के सभी स्थायी नागरिक इस योजना के सामान्य दिशानिर्देशों के अंतर्गत पात्र हैं।"
                    : "All permanent Indian residents meeting basic sector criteria qualify."}
                </span>
              </div>
            )}
          </div>

          {/* Quick Eligibility Test Callout */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground font-medium">
                {isHindi
                  ? "क्या आप जानना चाहते हैं कि आपकी प्रोफ़ाइल इन सभी नियमों को पूरा करती है?"
                  : "Want to verify if your profile satisfies all these conditions?"}
              </span>
            </div>

            <Button
              size="sm"
              onClick={onCheckEligibility}
              className="w-full sm:w-auto shrink-0 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold h-9 px-4 shadow-sm"
            >
              <span>{isHindi ? "पात्रता जांचें (2 मिनट)" : "Check Eligibility (2 min)"}</span>
            </Button>
          </div>

          {/* Verification Guarantee Footnote */}
          <div className="flex items-center space-x-2 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {isHindi
                ? "योजनासेतु का स्वर्णिम नियम: पात्रता का निर्णय 100% गणितीय नियमों द्वारा होता है, किसी AI मॉडल के अनुमान द्वारा नहीं।"
                : "YojanaSetu Golden Rule: Eligibility is decided with 100% mathematical precision by rules, never by AI guesswork."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
