import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { CitizenProfile } from "@/types/schema";
import { api, EligibilityResponse } from "@/services/api";
import { WizardStep1, Step1Data } from "./WizardStep1";
import { WizardStep2, Step2Data } from "./WizardStep2";
import { WizardStep3, Step3Data } from "./WizardStep3";
import { WizardStep4, Step4Data } from "./WizardStep4";
import { WizardStep5 } from "./WizardStep5";
import { WizardResultsView } from "./WizardResultsView";
import { getAllIndianStates } from "@/data/indianDistricts";
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
  Check,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export interface WizardContainerProps {
  onSubmit: (profile: CitizenProfile) => void;
  onCancel?: () => void;
  initialData?: Partial<CitizenProfile>;
  onViewSchemeDetail?: (schemeId: string) => void;
}

const DEFAULT_PROFILE: CitizenProfile = {
  age: 21,
  gender: "female",
  state: "Rajasthan",
  district: "Jaipur",
  area_type: "rural",
  occupation: "student",
  land_holding_acres: 0,
  category: "general",
  annual_income: 180000,
  marital_status: "single",
  is_differently_abled: false,
  ration_card_type: "none",
};

interface StepMetadata {
  id: number;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  cardTitleEn: string;
  cardTitleHi: string;
  cardSubtitleEn: string;
  cardSubtitleHi: string;
}

const WIZARD_STEPS: StepMetadata[] = [
  {
    id: 1,
    titleEn: "Basic Information",
    titleHi: "बुनियादी जानकारी",
    descEn: "Age, gender, location",
    descHi: "आयु, लिंग, निवास",
    cardTitleEn: "Let’s start with some basic information",
    cardTitleHi: "आइए कुछ बुनियादी जानकारी से शुरू करें",
    cardSubtitleEn: "This helps us find the most relevant government schemes for you.",
    cardSubtitleHi: "यह आपके लिए सबसे उपयुक्त सरकारी योजनाएं खोजने में मदद करता है।",
  },
  {
    id: 2,
    titleEn: "Occupation",
    titleHi: "व्यवसाय व आजीविका",
    descEn: "Work, livelihood, land",
    descHi: "कार्य, आजीविका, भूमि",
    cardTitleEn: "Tell us about your occupation & work",
    cardTitleHi: "अपने व्यवसाय एवं कार्य के बारे में बताएं",
    cardSubtitleEn: "Government schemes offer dedicated subsidies and support based on your livelihood.",
    cardSubtitleHi: "सरकारी योजनाएं आपकी आजीविका के अनुसार विशेष अनुदान व सहायता देती हैं।",
  },
  {
    id: 3,
    titleEn: "Income & Category",
    titleHi: "आय व सामाजिक श्रेणी",
    descEn: "Family income, social category",
    descHi: "पारिवारिक आय, सामाजिक वर्ग",
    cardTitleEn: "Your family income & social category",
    cardTitleHi: "आपकी पारिवारिक आय और सामाजिक श्रेणी",
    cardSubtitleEn: "Ensures eligibility for affirmative action, income subsidies, and educational grants.",
    cardSubtitleHi: "आरक्षण, आय सब्सिडी और छात्रवृत्ति लाभों की पात्रता सुनिश्चित करता है।",
  },
  {
    id: 4,
    titleEn: "Additional Details",
    titleHi: "अतिरिक्त विवरण",
    descEn: "As per your profile",
    descHi: "आपकी प्रोफाइल के अनुसार",
    cardTitleEn: "A few additional details",
    cardTitleHi: "कुछ अतिरिक्त महत्वपूर्ण विवरण",
    cardSubtitleEn: "Helps discover special benefits for food security, pensions, and accessibility.",
    cardSubtitleHi: "खाद्य सुरक्षा, पेंशन और विशेष सहायता योजनाओं को खोजने में मदद करता है।",
  },
  {
    id: 5,
    titleEn: "Review & Continue",
    titleHi: "समीक्षा व पात्रता",
    descEn: "Find your eligible schemes",
    descHi: "पात्र योजनाएं खोजें",
    cardTitleEn: "Review your details & find eligible schemes",
    cardTitleHi: "अपने विवरण की समीक्षा करें और योजनाएं पाएं",
    cardSubtitleEn: "Double-check your information to get 100% accurate AI-matched schemes.",
    cardSubtitleHi: "100% सटीक मिलान वाली सरकारी योजनाएं देखने के लिए पुष्टि करें।",
  },
];

export const WizardContainer: React.FC<WizardContainerProps> = ({
  onSubmit,
  onCancel,
  initialData,
  onViewSchemeDetail = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CitizenProfile>({
    ...DEFAULT_PROFILE,
    ...initialData,
  });
  const [availableStates, setAvailableStates] = useState<string[]>(getAllIndianStates());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EligibilityResponse | null>(null);

  // AI Voice / Text Autofill modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiInputText, setAiInputText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load backend states if available
  useEffect(() => {
    async function loadStates() {
      try {
        const res = await api.getStates();
        if (res.states && res.states.length > 0) {
          const names = res.states.map((s) => s.name).filter((n) => n !== "All India");
          setAvailableStates(names);
        }
      } catch {
        // Fallback to static dataset
      }
    }
    loadStates();
  }, []);

  const updateStep1 = (updated: Partial<Step1Data>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const updateStep2 = (updated: Partial<Step2Data>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const updateStep3 = (updated: Partial<Step3Data>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const updateStep4 = (updated: Partial<Step4Data>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
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

  const handleReset = () => {
    setFormData(DEFAULT_PROFILE);
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.checkEligibility(formData);
      setEvaluationResult(res);
      onSubmit(formData);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Eligibility check failed", err);
      onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          ? "विवरण समझने में समस्या हुई। कृपया दोबारा प्रयास करें।"
          : "Could not extract details. Please try again or fill manually."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // If already evaluated, show full results view
  if (evaluationResult) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        <WizardResultsView
          results={evaluationResult}
          profile={formData}
          onEditProfile={() => setEvaluationResult(null)}
          onReset={() => {
            setEvaluationResult(null);
            handleReset();
          }}
          onViewSchemeDetail={onViewSchemeDetail}
        />
      </div>
    );
  }

  const currentMeta = WIZARD_STEPS[currentStep - 1];

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#F8FAF9] flex flex-col justify-between overflow-hidden">
      {/* ======================================================== */}
      {/* Background Decor: Parliament Building in Bottom-Left     */}
      {/* ======================================================== */}
      <div className="pointer-events-none select-none absolute bottom-0 left-0 z-0 opacity-80 hidden md:block">
        <img
          src="/images/wizard_parliament_transparent.png"
          alt=""
          className="w-72 lg:w-84 max-h-48 object-contain object-left-bottom"
        />
      </div>

      {/* ======================================================== */}
      {/* Main Content: 3-Column Layout Matching Design Screenshot */}
      {/* ======================================================== */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12 relative z-10 flex-1">
        
        {/* Mobile Step Header (for small screens) */}
        <div className="lg:hidden mb-6 bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-[#165D51]">
              {isHindi ? `चरण ${currentStep} / 5` : `Step ${currentStep} of 5`}:{" "}
              {isHindi ? currentMeta.titleHi : currentMeta.titleEn}
            </span>
            <span className="text-gray-500">{Math.round((currentStep / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#165D51] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Vertical Connected Stepper + Trust Card    */}
          {/* ======================================================== */}
          <div className="hidden lg:block lg:col-span-3 space-y-8 pt-2">
            
            {/* 5-Step Vertical Stepper */}
            <div className="space-y-0 relative">
              {WIZARD_STEPS.map((step, idx) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isLast = idx === WIZARD_STEPS.length - 1;

                return (
                  <div key={step.id} className="relative flex items-start group">
                    {/* Vertical connecting line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[17px] top-[36px] w-[2px] h-[34px] -ml-[1px] transition-colors ${
                          isCompleted ? "bg-[#165D51]" : "bg-gray-200"
                        }`}
                      />
                    )}

                    {/* Step Icon / Number */}
                    <button
                      type="button"
                      disabled={!isCompleted && !isCurrent}
                      onClick={() => isCompleted && setCurrentStep(step.id)}
                      className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all select-none ${
                        isCurrent
                          ? "bg-[#165D51] text-white ring-4 ring-[#165D51]/15 shadow-sm"
                          : isCompleted
                          ? "bg-[#165D51] text-white hover:opacity-90 cursor-pointer shadow-xs"
                          : "bg-gray-100 text-gray-500 border border-gray-200 cursor-default"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                    </button>

                    {/* Step Label & Subtext */}
                    <div
                      onClick={() => isCompleted && setCurrentStep(step.id)}
                      className={`ml-3.5 pb-7 text-left ${
                        isCompleted ? "cursor-pointer" : ""
                      }`}
                    >
                      <div
                        className={`text-sm font-bold leading-tight transition-colors ${
                          isCurrent
                            ? "text-gray-900"
                            : isCompleted
                            ? "text-gray-800 group-hover:text-[#165D51]"
                            : "text-gray-500 font-medium"
                        }`}
                      >
                        {isHindi ? step.titleHi : step.titleEn}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-snug">
                        {isHindi ? step.descHi : step.descEn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "Your information is safe" Trust Card */}
            <div className="p-4 rounded-2xl bg-[#EAF5EE] border border-[#D5ECDB] flex items-start space-x-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#165D51] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 leading-tight">
                  {isHindi ? "आपकी जानकारी सुरक्षित है" : "Your information is safe"}
                </div>
                <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {isHindi
                    ? "हम आपकी गोपनीयता का पूरा सम्मान करते हैं और डेटा कभी साझा नहीं करते।"
                    : "We respect your privacy and never share your data."}
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* CENTER COLUMN: The Main White Form Card                 */}
          {/* ======================================================== */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-gray-200/70 shadow-sm p-6 sm:p-10 relative">
              
              {/* Top Row: Step Indicator & Optional AI Voice Pill */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#165D51] tracking-wide">
                  {isHindi ? `चरण ${currentStep} / 5` : `Step ${currentStep} of 5`}
                </span>

                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F0F8F4] border border-[#2D7A58]/30 text-[#165D51] hover:bg-[#E2F2E9] transition-colors text-xs font-semibold cursor-pointer select-none"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>{isHindi ? "AI से भरें" : "AI Voice Autofill"}</span>
                </button>
              </div>

              {/* Card Title & Subtitle */}
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight leading-snug">
                {isHindi ? currentMeta.cardTitleHi : currentMeta.cardTitleEn}
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 mb-7 leading-relaxed">
                {isHindi ? currentMeta.cardSubtitleHi : currentMeta.cardSubtitleEn}
              </p>

              {/* Step Forms */}
              <div className="min-h-[290px]">
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

                {currentStep === 4 && (
                  <WizardStep4
                    data={formData}
                    onChange={updateStep4}
                  />
                )}

                {currentStep === 5 && (
                  <WizardStep5
                    data={formData}
                    onJumpToStep={(s) => setCurrentStep(s)}
                  />
                )}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
                {/* Back / Cancel button */}
                <div>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-500" />
                      <span>{isHindi ? "पिछला" : "Back"}</span>
                    </button>
                  ) : onCancel ? (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2 py-1"
                    >
                      {isHindi ? "रद्द करें" : "Cancel"}
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Next Step / Evaluate Button */}
                <div>
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#165D51] hover:bg-[#114E43] text-white font-semibold text-sm px-7 py-3 rounded-xl shadow-xs hover:shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <span>{isHindi ? "अगला चरण" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-[#165D51] hover:bg-[#114E43] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isHindi ? "जांच हो रही है..." : "Evaluating..."}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isHindi ? "मेरी पात्रता जांचें" : "Evaluate My Eligibility"}</span>
                          <ArrowRight className="w-4 h-4 ml-0.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Speech Bubble + Illustration + Slogan      */}
          {/* ======================================================== */}
          <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-start space-y-6 pt-3 select-none">
            
            {/* Thought / Speech Bubble */}
            <div className="relative bg-[#E8F4EC] border border-[#D5ECDB] rounded-2xl p-4 text-center max-w-[240px] shadow-2xs">
              <p className="text-xs font-semibold text-gray-800 leading-snug">
                {isHindi
                  ? "बस कुछ बुनियादी विवरण और हम आपके लिए सभी उपयुक्त सरकारी योजनाएं खोज लेंगे।"
                  : "Just a few details and we’ll find the schemes you may qualify for."}
              </p>
              {/* Bubble pointer triangle */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#E8F4EC]" />
            </div>

            {/* Illustration: Student with laptop */}
            <div className="w-full flex items-center justify-center pt-2">
              <img
                src="/images/wizard_student_laptop_transparent.png"
                alt="Citizen using scheme portal"
                className="w-56 h-auto max-h-60 object-contain drop-shadow-xs"
              />
            </div>

            {/* Slogan & Tricolor Accent */}
            <div className="text-center pt-2 max-w-[220px]">
              <p className="text-sm font-medium text-gray-700 italic leading-snug">
                “ Same Opportunities.
                <br />
                A Stronger India. ”
              </p>
              
              {/* Indian Tricolor Swoosh Stroke */}
              <div className="flex items-center justify-center mt-2.5">
                <svg viewBox="0 0 90 12" className="w-24 h-3.5" fill="none">
                  <path
                    d="M 5 4 C 30 1, 60 7, 85 3"
                    stroke="#FF9933"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 12 7.5 C 35 4.5, 65 10.5, 82 6"
                    stroke="#138808"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* AI Voice / Prompt Extraction Dialog                      */}
      {/* ======================================================== */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6">
          <DialogHeader>
            <div className="inline-flex items-center space-x-1.5 text-xs text-[#165D51] font-bold mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isHindi ? "सेतु सहायक AI वॉइस इनपुट" : "Setu Sahayak AI Voice"}</span>
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {isHindi ? "बोलकर या लिखकर अपनी जानकारी बताएं" : "Tell Us About Yourself"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
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
                    ? "उदा: 'मैं 21 साल की छात्रा हूं, राजस्थान के जयपुर में रहती हूं, ग्रामीण क्षेत्र से हूं और परिवार की सालाना आय 1.8 लाख है...'"
                    : "e.g., 'I am a 21-year-old female student living in rural Jaipur, Rajasthan with annual income 1.8 lakh...'"
                }
                className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#165D51]/20 focus:border-[#165D51] resize-none"
              />
              <button
                type="button"
                onClick={() => {
                  setAiInputText(
                    isHindi
                      ? "मैं 21 वर्ष की छात्रा हूं, राजस्थान के जयपुर के ग्रामीण क्षेत्र में रहती हूं, सामान्य श्रेणी और परिवार की वार्षिक आय 1.8 लाख है।"
                      : "I am a 21-year-old female student from rural Jaipur, Rajasthan, general category with annual family income 1.8 lakh."
                  );
                }}
                className="absolute right-3 bottom-3 text-[11px] text-[#165D51] hover:underline font-medium cursor-pointer"
              >
                {isHindi ? "नमूना भरें" : "Insert sample"}
              </button>
            </div>

            {aiError && (
              <p className="text-xs text-rose-600 font-medium">{aiError}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleAiExtract}
                disabled={isExtracting || !aiInputText.trim()}
                className="bg-[#165D51] hover:bg-[#114E43] text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
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
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
