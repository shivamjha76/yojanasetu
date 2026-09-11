import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { CitizenProfile } from "@/types/schema";
import { api } from "@/services/api";
import { WizardStep1, Step1Data } from "./WizardStep1";
import { WizardStep2, Step2Data } from "./WizardStep2";
import { WizardStep3, Step3Data } from "./WizardStep3";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";

export interface WizardContainerProps {
  onSubmit: (profile: CitizenProfile) => void;
  onCancel?: () => void;
  initialData?: Partial<CitizenProfile>;
}

const DEFAULT_PROFILE: CitizenProfile = {
  age: 28,
  gender: "female",
  state: "Madhya Pradesh",
  district: "Bhopal",
  area_type: "rural",
  occupation: "farmer",
  land_holding_acres: 2,
  category: "obc",
  annual_income: 180000,
  marital_status: "married",
  is_differently_abled: false,
  ration_card_type: "bpl",
};

export const WizardContainer: React.FC<WizardContainerProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CitizenProfile>({
    ...DEFAULT_PROFILE,
    ...initialData,
  });
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // AI Voice / Text Autofill state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiInputText, setAiInputText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fetch states from metadata API on mount
  useEffect(() => {
    async function loadStates() {
      try {
        const res = await api.getStates();
        if (res.states && res.states.length > 0) {
          const names = res.states.map((s) => s.name).filter((n) => n !== "All India");
          setAvailableStates(names);
        }
      } catch (err) {
        console.warn("Using default states list:", err);
      }
    }
    loadStates();
  }, []);

  // Update handlers
  const updateStep1 = (updated: Partial<Step1Data>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const updateStep2 = (updated: Partial<Step2Data>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const updateStep3 = (updated: Partial<Step3Data>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_PROFILE);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    try {
      onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI Profile Extraction handler
  const handleAiExtract = async () => {
    if (!aiInputText.trim()) return;
    setIsExtracting(true);
    setAiError(null);
    try {
      const res = await api.extractProfile(aiInputText.trim());
      if (res && res.extracted_profile) {
        setFormData((prev) => ({
          ...prev,
          ...res.extracted_profile,
        }));
        setIsAiModalOpen(false);
        setAiInputText("");
      }
    } catch (err) {
      console.error("AI extraction error:", err);
      setAiError(
        isHindi
          ? "विवरण समझने में समस्या हुई। कृपया दोबारा प्रयास करें या सामान्य रूप से फॉर्म भरें।"
          : "Could not extract details. Please try again or fill the form directly."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Step indicators metadata
  const stepsMeta = [
    {
      num: 1,
      titleHi: "बुनियादी विवरण",
      titleEn: "Basic Info",
      subHi: "आयु, लिंग, राज्य",
      subEn: "Age, Gender, State",
    },
    {
      num: 2,
      titleHi: "आजीविका व व्यवसाय",
      titleEn: "Occupation",
      subHi: "कार्य, भूमि रकबा",
      subEn: "Livelihood, Land",
    },
    {
      num: 3,
      titleHi: "आय व श्रेणी",
      titleEn: "Income & Category",
      subHi: "वार्षिक आय, राशन कार्ड",
      subEn: "Annual income, Ration",
    },
  ];

  const progressPercentage = Math.round((currentStep / 3) * 100);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Header & AI Autofill Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{isHindi ? "2 मिनट पात्रता विज़ार्ड" : "2-Minute Eligibility Wizard"}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            {isHindi ? "अपनी सटीक सरकारी पात्रता जानें" : "Evaluate Your Exact Welfare Eligibility"}
          </h2>
        </div>

        {/* AI Voice Fill Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAiModalOpen(true)}
          className="self-start sm:self-auto rounded-xl border-primary/40 text-primary hover:bg-primary/10 hover:border-primary text-xs font-semibold shadow-sm space-x-2"
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>{isHindi ? "AI से बोलकर भरें" : "Auto-Fill via AI Voice"}</span>
        </Button>
      </div>

      {/* Wizard Progress Card (Step 38) */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-subtle mb-8">
        {/* Step Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>
              {isHindi
                ? `चरण ${currentStep} / 3: ${stepsMeta[currentStep - 1].titleHi}`
                : `Step ${currentStep} of 3: ${stepsMeta[currentStep - 1].titleEn}`}
            </span>
            <span className="text-primary">{progressPercentage}% पूर्ण</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Tabs Grid */}
        <div className="grid grid-cols-3 gap-2">
          {stepsMeta.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (isCompleted) setCurrentStep(s.num);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCompleted ? "cursor-pointer hover:border-primary/50" : ""
                } ${
                  isCurrent
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20"
                    : "border-border/60 bg-muted/20 opacity-60"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? "✓" : s.num}
                  </div>
                  <div className="text-xs font-bold truncate text-foreground">
                    {isHindi ? s.titleHi : s.titleEn}
                  </div>
                </div>
                <div className="hidden sm:block text-[10px] text-muted-foreground truncate pl-7">
                  {isHindi ? s.subHi : s.subEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Content Form */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm mb-8">
        {currentStep === 1 && (
          <WizardStep1
            data={formData}
            onChange={updateStep1}
            availableStates={availableStates}
          />
        )}

        {currentStep === 2 && (
          <WizardStep2
            data={formData}
            onChange={updateStep2}
          />
        )}

        {currentStep === 3 && (
          <WizardStep3
            data={formData}
            onChange={updateStep3}
          />
        )}
      </div>

      {/* Navigation Buttons Row */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div>
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handlePrev}
              className="rounded-xl px-5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>{isHindi ? "पिछला चरण" : "Previous"}</span>
            </Button>
          ) : onCancel ? (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHindi ? "रीसेट करें" : "Reset Form"}</span>
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              className="rounded-xl px-6 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
            >
              <span>{isHindi ? "अगला चरण" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl px-8 h-11 text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>{isHindi ? "पात्रता जांची जा रही है..." : "Evaluating..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span>{isHindi ? "मेरी पात्रता जांचें (परिणाम देखें)" : "Evaluate My Eligibility"}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* AI Voice / Text Autofill Modal */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="inline-flex items-center space-x-1 text-xs text-primary font-bold mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isHindi ? "सेतु सहायक AI वॉइस इनपुट" : "Setu Sahayak AI Voice"}</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {isHindi ? "बोलकर या लिखकर अपनी जानकारी बताएं" : "Tell Us About Yourself"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isHindi
                ? "अपनी भाषा (हिंदी, Hinglish या English) में बताएं। AI इसे समझकर आपके फॉर्म के सभी चरणों को स्वतः भर देगा।"
                : "Speak or type in your words. AI will extract your demographic details and auto-fill the wizard."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="relative">
              <textarea
                rows={4}
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder={
                  isHindi
                    ? "उदा: 'मैं 32 साल का किसान हूं, बिहार में रहता हूं, 2 एकड़ जमीन है और सालाना आय 1.2 लाख है...'"
                    : "e.g., 'I am a 32-year-old farmer living in Bihar with 2 acres of land and annual income 1.2 lakh...'"
                }
                className="w-full p-3.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <button
                type="button"
                onClick={() => {
                  setAiInputText(
                    isHindi
                      ? "मैं 28 वर्ष की महिला हूं, मध्य प्रदेश के भोपाल में रहती हूं, किसान परिवार से हूं और 2 एकड़ जमीन है।"
                      : "I am a 28-year-old woman from Bhopal, Madhya Pradesh, farming family with 2 acres of land."
                  );
                }}
                className="absolute right-3 bottom-3 text-[11px] text-primary hover:underline font-medium"
              >
                {isHindi ? "नमूना भरें" : "Insert sample"}
              </button>
            </div>

            {aiError && (
              <p className="text-xs text-destructive font-medium">{aiError}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAiModalOpen(false)}
                className="text-xs"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </Button>

              <Button
                size="sm"
                onClick={handleAiExtract}
                disabled={isExtracting || !aiInputText.trim()}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-sm space-x-1.5"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isHindi ? "पहचान की जा रही है..." : "Extracting..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isHindi ? "फॉर्म में भरें" : "Extract & Auto-Fill"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
