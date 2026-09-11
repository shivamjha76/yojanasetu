import React from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Mic,
  Compass,
} from "lucide-react";

interface HeroSectionProps {
  onStartWizard?: () => void;
  onExploreSchemes?: () => void;
  onOpenAssistant?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartWizard = () => {},
  onExploreSchemes = () => {},
  onOpenAssistant = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  return (
    <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24 border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Background Decorative Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container mx-auto px-4 sm:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Official Trust Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-subtle animate-in fade-in slide-in-from-top-3 duration-500">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>
              {isHindi
                ? "100% प्रत्यक्ष नागरिक कल्याण सेतु • कोई बिचौलिया नहीं"
                : "100% Direct-to-Citizen Welfare Bridge • Zero Middlemen"}
            </span>
          </div>

          {/* High-Impact Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] sm:leading-[1.15]">
            {isHindi ? (
              <>
                जानिए आप <span className="text-primary underline decoration-primary/30 decoration-wavy">किन सरकारी योजनाओं</span> के हकदार हैं
              </>
            ) : (
              <>
                Know what government welfare you{" "}
                <span className="text-primary underline decoration-primary/30 decoration-wavy">
                  truly qualify for
                </span>
              </>
            )}
          </h1>

          {/* Subtitle & Golden Rule Pledge */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            {isHindi
              ? "बिना किसी दलाल या रिश्वत के, 15+ केंद्रीय और राज्य योजनाओं में अपनी पात्रता 2 मिनट में निःशुल्क जांचें। सटीक और निष्पक्ष।"
              : "Zero commission, zero middlemen. Evaluate your exact eligibility in 2 minutes across 15+ central & state schemes with 100% mathematical precision."}
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md sm:max-w-none mx-auto">
            {/* Primary CTA: 2-Minute Eligibility Wizard */}
            <Button
              size="lg"
              onClick={onStartWizard}
              className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-150 hover:scale-[1.02]"
            >
              <span>{isHindi ? "अपनी पात्रता जांचें (2 मिनट)" : "Check Your Eligibility (2 min)"}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Secondary CTA: Explore Schemes */}
            <Button
              variant="outline"
              size="lg"
              onClick={onExploreSchemes}
              className="w-full sm:w-auto h-12 px-6 text-base font-medium rounded-xl hover:border-primary/40"
            >
              <Compass className="w-4 h-4 mr-2 text-primary" />
              <span>{isHindi ? "सभी योजनाएं देखें" : "Explore All Schemes"}</span>
            </Button>

            {/* Voice Assistant Mic Quick Trigger */}
            <Button
              variant="secondary"
              size="lg"
              onClick={onOpenAssistant}
              className="w-full sm:w-auto h-12 px-5 text-sm font-medium rounded-xl border border-border text-foreground hover:border-primary/40 space-x-2"
              title="बोलकर बताएं / Speak via Voice"
            >
              <Mic className="w-4 h-4 text-primary animate-pulse" />
              <span>{isHindi ? "बोलकर बताएं" : "Speak to AI"}</span>
            </Button>
          </div>

          {/* Quick Voice / Language Assurance Pill */}
          <div className="pt-2 text-xs text-muted-foreground flex items-center justify-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isHindi
                ? "हिंदी, English या Hinglish में बोलकर या लिखकर पूछें — सेतु सहायक AI समझता है"
                : "Ask in Hindi, English, or Hinglish via voice or text — Setu Sahayak understands"}
            </span>
          </div>

          {/* Trust Statistics Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-border/60">
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">15+</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isHindi ? "सत्यापित फ्लैगशिप योजनाएं" : "Verified Schemes"}
              </div>
            </div>

            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isHindi ? "गणितीय नियम सटीकता" : "Deterministic Precision"}
              </div>
            </div>

            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">₹0</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isHindi ? "निःशुल्क एवं सुरक्षित" : "Zero Middleman Fees"}
              </div>
            </div>

            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">2 min</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isHindi ? "त्वरित पात्रता परिणाम" : "Instant Evaluation"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
