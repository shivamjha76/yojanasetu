import React from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  ShieldCheck,
  Landmark,
  ArrowRight,
  Sparkles,
  Lock,
  FileCheck,
} from "lucide-react";

interface HowItWorksProps {
  onStartWizard?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onStartWizard = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const steps = [
    {
      stepNumber: "01",
      icon: <UserCheck className="w-7 h-7 text-primary" />,
      titleHi: "अपनी बुनियादी जानकारी बताएं",
      titleEn: "Tell Us About Yourself",
      descHi:
        "बोलकर (हिंदी, English, Hinglish) या 2-मिनट के साधारण फॉर्म द्वारा अपनी आयु, व्यवसाय, राज्य और आय बताएं।",
      descEn:
        "Speak in conversational Hindi/Hinglish or fill our simple 2-minute form with basic demographic details.",
      pillHi: "100% गोपनीय व सुरक्षित",
      pillEn: "Zero Data Stored",
      pillIcon: <Lock className="w-3.5 h-3.5 mr-1 text-emerald-500" />,
      accentColor: "border-primary/20 bg-primary/5 dark:bg-primary/10",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      stepNumber: "02",
      icon: <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      titleHi: "सटीक गणितीय पात्रता मिलान",
      titleEn: "Deterministic Rule Evaluation",
      descHi:
        "हमारा नियम इंजन 15+ केंद्रीय और राज्य योजनाओं के नियमों से आपका मिलान करता है — 100% गणितीय सटीकता, शून्य AI भ्रम।",
      descEn:
        "Our deterministic rule engine compares your profile against verified criteria — zero AI hallucination, 100% precision.",
      pillHi: "शून्य भ्रम (Zero Hallucination)",
      pillEn: "100% Verified Logic",
      pillIcon: <FileCheck className="w-3.5 h-3.5 mr-1 text-primary" />,
      accentColor: "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20",
      iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      stepNumber: "03",
      icon: <Landmark className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
      titleHi: "आधिकारिक पोर्टल पर सीधा लाभ",
      titleEn: "Direct Benefit & Official Application",
      descHi:
        "बिना किसी बिचौलिये या रिश्वत के, आवश्यक दस्तावेजों की सूची के साथ सीधे आधिकारिक सरकारी पोर्टल पर आवेदन करें।",
      descEn:
        "Get direct links to official ministry portals with ready document checklists. No middlemen, no commission.",
      pillHi: "₹0 बिचौलिया शुल्क",
      pillEn: "Direct to Citizen",
      pillIcon: <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />,
      accentColor: "border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20",
      iconBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    },
  ];

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{isHindi ? "3 आसान चरण" : "Simple 3-Step Process"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {isHindi ? "योजनासेतु कैसे काम करता है?" : "How YojanaSetu Works"}
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isHindi
              ? "पारदर्शी, निष्पक्ष और पूर्णतः निःशुल्क। जानें कि आप किन सरकारी लाभों के हकदार हैं और कैसे सीधे आवेदन करें।"
              : "Transparent, unbiased, and completely free. Discover what you qualify for and apply directly on verified portals."}
          </p>
        </div>

        {/* 3-Step Grid with Connecting Line */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-6">
          {/* Desktop Connecting Line */}
          <div
            className="hidden md:block absolute top-1/3 left-1/6 right-1/6 h-0.5 -translate-y-6 bg-gradient-to-r from-primary/30 via-emerald-500/30 to-indigo-500/30 z-0 pointer-events-none"
            aria-hidden="true"
          />

          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative z-10 p-6 sm:p-7 rounded-2xl border bg-card shadow-subtle hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 ${step.accentColor}`}
            >
              <div>
                {/* Top Row: Icon & Step Number */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${step.iconBg}`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-3xl font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                    {step.stepNumber}
                  </span>
                </div>

                {/* Step Title */}
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2.5">
                  {isHindi ? step.titleHi : step.titleEn}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isHindi ? step.descHi : step.descEn}
                </p>
              </div>

              {/* Bottom Feature Pill */}
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center text-xs font-semibold text-foreground/80">
                {step.pillIcon}
                <span>{isHindi ? step.pillHi : step.pillEn}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Callout */}
        <div className="mt-12 sm:mt-16 text-center space-y-4 max-w-xl mx-auto">
          <p className="text-xs text-muted-foreground">
            {isHindi
              ? "किसी भी दस्तावेज़ को अपलोड किए बिना तुरंत परिणाम देखें"
              : "Instant results without needing to upload sensitive documents"}
          </p>

          <Button
            size="lg"
            onClick={onStartWizard}
            className="h-12 px-8 text-sm sm:text-base font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-150 hover:scale-[1.02]"
          >
            <span>{isHindi ? "अपनी पात्रता अभी जांचें (2 मिनट)" : "Check Your Eligibility Now (2 min)"}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
