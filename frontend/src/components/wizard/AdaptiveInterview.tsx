import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { CitizenProfile, Gender, Occupation, SocialCategory, RationCardType } from "@/types/schema";
import {
  Sparkles,
  Mic,
  MicOff,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Check,
  User,
  MapPin,
  Briefcase,
  IndianRupee,
  Layers,
} from "lucide-react";

export interface AdaptiveInterviewProps {
  initialData?: Partial<CitizenProfile>;
  availableStates?: string[];
  onComplete: (profile: CitizenProfile) => void;
  onCancel?: () => void;
  onSwitchToClassicWizard?: () => void;
}

const TOP_STATES = [
  "Rajasthan",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Bihar",
  "Maharashtra",
  "Gujarat",
  "Haryana",
  "Delhi",
  "Jharkhand",
  "Punjab",
  "West Bengal",
  "Karnataka",
];

export const AdaptiveInterview: React.FC<AdaptiveInterviewProps> = ({
  initialData,
  availableStates,
  onComplete,
  onCancel,
  onSwitchToClassicWizard,
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  // Interview state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<CitizenProfile>({
    age: initialData?.age || 28,
    gender: initialData?.gender || "male",
    state: initialData?.state || "Rajasthan",
    district: initialData?.district || "Jaipur",
    area_type: initialData?.area_type || "rural",
    occupation: initialData?.occupation || "farmer",
    category: initialData?.category || "obc",
    annual_income: initialData?.annual_income ?? 150000,
    land_holding_acres: initialData?.land_holding_acres ?? 1.5,
    marital_status: initialData?.marital_status || "married",
    is_differently_abled: initialData?.is_differently_abled ?? false,
    ration_card_type: initialData?.ration_card_type || "bpl",
  });

  const statesToRender = (availableStates && availableStates.length > 0) ? availableStates.slice(0, 15) : TOP_STATES;

  // Cleanup speech synthesis on unmountate
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHindi ? "hi-IN" : "en-IN";

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setSpeechTranscript(text);
        setIsListening(false);
        handleVoiceInputMatch(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isHindi, currentStep]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert(
        isHindi
          ? "आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता। कृपया विकल्प चुनें।"
          : "Speech recognition not supported in this browser. Please select an option."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechTranscript("");
      try {
        recognitionRef.current.lang = isHindi ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Process voice text to auto-select
  const handleVoiceInputMatch = (text: string) => {
    const lower = text.toLowerCase();

    if (currentStep === 1) {
      // Age matching: extract digits
      const match = text.match(/\d+/);
      if (match) {
        const ageNum = parseInt(match[0]);
        if (ageNum >= 1 && ageNum <= 100) {
          setProfile((p) => ({ ...p, age: ageNum }));
          setTimeout(() => setCurrentStep(2), 600);
          return;
        }
      }
    }

    if (currentStep === 2) {
      // State matching
      for (const st of TOP_STATES) {
        if (lower.includes(st.toLowerCase())) {
          setProfile((p) => ({ ...p, state: st }));
          setTimeout(() => setCurrentStep(3), 600);
          return;
        }
      }
    }

    if (currentStep === 3) {
      // Occupation matching
      if (lower.includes("किसान") || lower.includes("kisan") || lower.includes("farm")) {
        setProfile((p) => ({ ...p, occupation: "farmer" }));
      } else if (lower.includes("छात्र") || lower.includes("student") || lower.includes("पढ़ाई")) {
        setProfile((p) => ({ ...p, occupation: "student" }));
      } else if (lower.includes("गृहणी") || lower.includes("housewife") || lower.includes("घर")) {
        setProfile((p) => ({ ...p, occupation: "homemaker" }));
      } else if (lower.includes("दुकान") || lower.includes("व्यापार") || lower.includes("business")) {
        setProfile((p) => ({ ...p, occupation: "business_self_employed" }));
      } else if (lower.includes("मजदूर") || lower.includes("labor")) {
        setProfile((p) => ({ ...p, occupation: "daily_wage_laborer" }));
      }
      setTimeout(() => setCurrentStep(4), 600);
      return;
    }

    if (currentStep === 5) {
      // Gender matching
      if (lower.includes("महिला") || lower.includes("female") || lower.includes("स्त्री")) {
        setProfile((p) => ({ ...p, gender: "female" }));
      } else if (lower.includes("पुरुष") || lower.includes("male") || lower.includes("मर्द")) {
        setProfile((p) => ({ ...p, gender: "male" }));
      }
      setTimeout(() => setCurrentStep(6), 600);
      return;
    }

    if (currentStep === 6) {
      // Category matching
      if (lower.includes("ओबीसी") || lower.includes("obc")) {
        setProfile((p) => ({ ...p, category: "obc" }));
      } else if (lower.includes("सामान्य") || lower.includes("general")) {
        setProfile((p) => ({ ...p, category: "general" }));
      } else if (lower.includes("एससी") || lower.includes("sc")) {
        setProfile((p) => ({ ...p, category: "sc" }));
      } else if (lower.includes("एसटी") || lower.includes("st")) {
        setProfile((p) => ({ ...p, category: "st" }));
      } else if (lower.includes("ईडब्ल्यूएस") || lower.includes("ews")) {
        setProfile((p) => ({ ...p, category: "ews" }));
      }
      setTimeout(() => setCurrentStep(7), 600);
      return;
    }
  };

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = Math.round((currentStep / 8) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#165D51]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isHindi ? "सेतु सहायक एडेप्टिव साक्षात्कार" : "Setu Sahayak Adaptive Interview"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {isHindi ? "मात्र 8 सवालों में अपनी सभी योजनाएं जानें" : "Discover All Your Benefits in 8 Quick Questions"}
          </h1>
          <p className="text-xs text-gray-500">
            {isHindi
              ? "आपको किसी योजना का नाम जानने की आवश्यकता नहीं है। सिर्फ अपनी स्थिति बताएं।"
              : "You never need to know a scheme's name. Just tell us your situation."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>{isHindi ? "क्लासिक फॉर्म" : "Classic Form"}</span>
            </button>
          )}
          {onSwitchToClassicWizard && !onCancel && (
            <button
              onClick={onSwitchToClassicWizard}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>{isHindi ? "क्लासिक फॉर्म" : "Classic Form"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Step Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-600">
          <span className="text-[#165D51]">
            {isHindi ? `प्रश्न ${currentStep} का 8` : `Question ${currentStep} of 8`}
          </span>
          <span>{progressPercentage}% {isHindi ? "पूर्ण" : "Completed"}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/60">
          <div
            className="bg-[#165D51] h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* Question Card                                            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Question 1: Age */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                1. {isHindi ? "नागरिक आयु" : "Citizen Age"}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isHindi ? "आपकी वर्तमान आयु (वर्ष) कितनी है?" : "What is your current age in years?"}
              </h2>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? "सरकारी योजनाओं में छात्रवृत्ति, युवा इंटर्नशिप, व वृद्धावस्था पेंशन आयु पर आधारित होती है।"
                  : "Determines eligibility for student scholarships, youth apprenticeships, and senior pensions."}
              </p>
            </div>

            {/* Quick Age Brackets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: isHindi ? "18 - 25 वर्ष (युवा/छात्र)" : "18 - 25 (Youth)", val: 21 },
                { label: isHindi ? "26 - 40 वर्ष (कार्यशील)" : "26 - 40 (Working)", val: 32 },
                { label: isHindi ? "41 - 59 वर्ष (प्रौढ़)" : "41 - 59 (Middle)", val: 48 },
                { label: isHindi ? "60+ वर्ष (वरिष्ठ नागरिक)" : "60+ (Senior)", val: 62 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setProfile({ ...profile, age: item.val })}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    Math.abs(profile.age - item.val) < 8
                      ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                      : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span>{item.label}</span>
                  {Math.abs(profile.age - item.val) < 8 && <Check className="w-3.5 h-3.5 text-[#165D51]" />}
                </button>
              ))}
            </div>

            {/* Exact Number Input */}
            <div className="pt-2">
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                {isHindi ? "या अपनी सटीक आयु यहाँ लिखें:" : "Or enter exact age:"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                  className="w-32 p-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#165D51]/20 focus:border-[#165D51]"
                />
                <span className="text-xs text-gray-500 font-medium">
                  {isHindi ? "वर्ष पूर्ण" : "Years completed"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Question 2: State */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                2. {isHindi ? "निवास का राज्य" : "State of Residence"}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isHindi ? "आप किस राज्य या केंद्र शासित प्रदेश के मूल निवासी हैं?" : "Which state or UT do you reside in?"}
              </h2>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? "राज्य-विशिष्ट योजनाओं (जैसे लाड़ली बहना या राज्य रोजगार योजना) का लाभ प्राप्त करने के लिए आवश्यक।"
                  : "Required for state-sponsored welfare grants in addition to central schemes."}
              </p>
            </div>

            {/* Quick State Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {statesToRender.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setProfile({ ...profile, state: st })}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    profile.state.toLowerCase() === st.toLowerCase()
                      ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                      : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{st}</span>
                  </span>
                  {profile.state.toLowerCase() === st.toLowerCase() && (
                    <Check className="w-3.5 h-3.5 text-[#165D51]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 3: Occupation */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                3. {isHindi ? "मुख्य व्यवसाय व आजीविका" : "Primary Occupation"}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isHindi ? "आपका मुख्य कार्य या आजीविका का साधन क्या है?" : "What is your primary livelihood or occupation?"}
              </h2>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? "किसान, छात्र, स्ट्रीट वेंडर और शिल्पकारों के लिए समर्पित सरकारी सहायता उपलब्ध है।"
                  : "Government grants dedicated subsidies for farmers, students, artisans, and vendors."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: "farmer", hi: "किसान / काश्तकार (Farmer)", en: "Farmer / Agriculture" },
                { id: "student", hi: "विद्यार्थी / छात्र (Student)", en: "Student / Higher Education" },
                { id: "business_self_employed", hi: "छोटा व्यापारी / स्वरोजगार (Self Employed)", en: "Small Business / Vendor" },
                { id: "homemaker", hi: "गृहणी (Homemaker)", en: "Homemaker" },
                { id: "daily_wage_laborer", hi: "दिहाड़ी मजदूर / निर्माण श्रमिक (Laborer)", en: "Daily Wage Laborer" },
                { id: "artisan_craftsperson", hi: "कारीगर / विश्वकर्मा (Artisan / Crafts)", en: "Artisan / Craftsperson" },
                { id: "unemployed", hi: "बेरोजगार (Unemployed Youth)", en: "Unemployed Youth" },
                { id: "employed_private", hi: "निजी कर्मचारी (Private Sector)", en: "Private Employee" },
              ].map((occ) => (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => setProfile({ ...profile, occupation: occ.id as Occupation })}
                  className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    profile.occupation === occ.id
                      ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                      : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                    <span>{isHindi ? occ.hi : occ.en}</span>
                  </span>
                  {profile.occupation === occ.id && <Check className="w-3.5 h-3.5 text-[#165D51]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 4: Adaptive Branching */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {profile.occupation === "farmer" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    4. {isHindi ? "कृषि भूमि (एडेप्टिव)" : "Land Holding (Adaptive)"}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {isHindi ? "आपके परिवार के पास कुल कितनी कृषि भूमि (एकड़ में) है?" : "How much agricultural land does your family hold?"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isHindi
                      ? "PM-KISAN और फसल बीमा हेतु लघु एवं सीमांत किसानों (5 एकड़ तक) को प्राथमिकता मिलती है।"
                      : "PM-KISAN and crop insurance prioritize small and marginal farmers with up to 5 acres."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: isHindi ? "भूमिहीन (0 एकड़)" : "Landless (0 Acres)", val: 0 },
                    { label: isHindi ? "सीमांत (< 2.5 एकड़)" : "Marginal (< 2.5 Acres)", val: 1.5 },
                    { label: isHindi ? "लघु (2.5 - 5 एकड़)" : "Small (2.5 - 5 Acres)", val: 3.5 },
                    { label: isHindi ? "बड़ा किसान (5+ एकड़)" : "Large (5+ Acres)", val: 7.0 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setProfile({ ...profile, land_holding_acres: item.val })}
                      className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                        profile.land_holding_acres === item.val
                          ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                          : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                      }`}
                    >
                      <span>{item.label}</span>
                      {profile.land_holding_acres === item.val && <Check className="w-3.5 h-3.5 text-[#165D51]" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : profile.occupation === "student" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    4. {isHindi ? "शिक्षा का स्तर (एडेप्टिव)" : "Education Level (Adaptive)"}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {isHindi ? "आप वर्तमान में किस कक्षा या पाठ्यक्रम में अध्ययनरत हैं?" : "What class or degree are you currently enrolled in?"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isHindi
                      ? "पोस्ट-मैट्रिक छात्रवृत्ति कक्षा 11वीं, 12वीं, कॉलेज स्नातक और व्यावसायिक पाठ्यक्रमों को कवर करती है।"
                      : "Post-Matric and Central Sector scholarships support higher secondary and degree programs."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { label: isHindi ? "कक्षा 11वीं या 12वीं (School Higher Secondary)" : "Class 11 or 12", area: "rural" },
                    { label: isHindi ? "कॉलेज स्नातक / डिग्री (Undergraduate BA/BSc/BTech)" : "Undergraduate Degree", area: "urban" },
                    { label: isHindi ? "स्नातकोत्तर (Postgraduate MA/MSc/MBA)" : "Postgraduate", area: "urban" },
                    { label: isHindi ? "आईटीआई / पॉलिटेक्निक डिप्लोमा (Vocational/Diploma)" : "Vocational / ITI", area: "rural" },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfile({ ...profile, area_type: item.area as any })}
                      className="p-3.5 rounded-2xl text-xs font-bold border bg-gray-50/70 border-gray-200 text-gray-800 hover:border-[#165D51] hover:bg-[#165D51]/5 text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <Check className="w-3.5 h-3.5 text-[#165D51]" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    4. {isHindi ? "आवासीय क्षेत्र (एडेप्टिव)" : "Residential Area (Adaptive)"}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {isHindi ? "आपका निवास ग्रामीण क्षेत्र में है या शहरी?" : "Do you reside in a rural or urban area?"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isHindi
                      ? "PMAY आवास योजना और स्ट्रीट वेंडर लोन (स्वनिधि) के लिए आवासीय क्षेत्र महत्वपूर्ण है।"
                      : "Crucial for urban street vendors (PM SVANidhi) and rural housing grants (PMAY-G)."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "rural", hi: "ग्रामीण क्षेत्र (Rural / Village)", en: "Rural Area" },
                    { id: "urban", hi: "शहरी क्षेत्र (Urban / Town / City)", en: "Urban Area" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, area_type: item.id as any })}
                      className={`p-4 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                        profile.area_type === item.id
                          ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                          : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                      }`}
                    >
                      <span>{isHindi ? item.hi : item.en}</span>
                      {profile.area_type === item.id && <Check className="w-3.5 h-3.5 text-[#165D51]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question 5: Gender */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                5. {isHindi ? "लिंग" : "Gender"}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isHindi ? "आपका लिंग क्या है?" : "What is your gender?"}
              </h2>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? "लाड़ली बहना, सुकन्या समृद्धि और महिला सशक्तिकरण की विशेष योजनाओं के लिए आवश्यक।"
                  : "Unlocks dedicated benefits for women, girl child, and maternity support."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "male", hi: "पुरुष (Male)", en: "Male" },
                { id: "female", hi: "महिला (Female)", en: "Female" },
                { id: "transgender", hi: "अन्य (Transgender)", en: "Other" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setProfile({ ...profile, gender: g.id as Gender })}
                  className={`p-4 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    profile.gender === g.id
                      ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                      : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>{isHindi ? g.hi : g.en}</span>
                  </span>
                  {profile.gender === g.id && <Check className="w-3.5 h-3.5 text-[#165D51]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 6: Social Category */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                6. {isHindi ? "सामाजिक श्रेणी" : "Social Category"}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isHindi ? "आपकी सामाजिक श्रेणी क्या है?" : "What is your social category?"}
              </h2>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? "छात्रवृत्ति, स्टैंड-अप इंडिया और विशेष आरक्षण लाभों की सटीक पात्रता सुनिश्चित करता है।"
                  : "Ensures eligibility for affirmative action, free coaching, and reserved MSME subsidies."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: "general", hi: "सामान्य (General)", en: "General" },
                { id: "obc", hi: "अन्य पिछड़ा वर्ग (OBC)", en: "OBC" },
                { id: "sc", hi: "अनुसूचित जाति (SC)", en: "SC" },
                { id: "st", hi: "अनुसूचित जनजाति (ST)", en: "ST" },
                { id: "ews", hi: "आर्थिक रूप से कमजोर (EWS)", en: "EWS" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setProfile({ ...profile, category: c.id as SocialCategory })}
                  className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    profile.category === c.id
                      ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                      : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span>{isHindi ? c.hi : c.en}</span>
                  {profile.category === c.id && <Check className="w-3.5 h-3.5 text-[#165D51]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 7: Annual Income */}
        {currentStep === 7 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                7. {isHindi ? "पारिवारिक वार्षिक आय" : "Annual Household Income"}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isHindi ? "आपके परिवार की कुल वार्षिक आय (सभी स्रोतों से) लगभग कितनी है?" : "What is your approximate annual household income?"}
              </h2>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? "अधिकांश कल्याणकारी योजनाओं में आय सीमा (जैसे ₹2.5 लाख तक) निर्धारित होती है।"
                  : "Most welfare schemes require income to be within specific caps (e.g., under ₹2.5 Lakh)."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: isHindi ? "₹1.5 लाख से कम" : "Under ₹1.5 Lakh", val: 120000 },
                { label: isHindi ? "₹1.5 - ₹2.5 लाख" : "₹1.5 - ₹2.5 Lakh", val: 200000 },
                { label: isHindi ? "₹2.5 - ₹5.0 लाख" : "₹2.5 - ₹5.0 Lakh", val: 350000 },
                { label: isHindi ? "₹5.0 लाख से अधिक" : "Above ₹5.0 Lakh", val: 600000 },
              ].map((inc) => (
                <button
                  key={inc.val}
                  type="button"
                  onClick={() => setProfile({ ...profile, annual_income: inc.val })}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    profile.annual_income === inc.val
                      ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                      : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                    <span>{inc.label}</span>
                  </span>
                  {profile.annual_income === inc.val && <Check className="w-3.5 h-3.5 text-[#165D51]" />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isHindi ? "सटीक वार्षिक आय दर्ज करें:" : "Or enter exact income (₹):"}
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={profile.annual_income}
                onChange={(e) => setProfile({ ...profile, annual_income: parseFloat(e.target.value) || 0 })}
                className="w-48 p-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#165D51]/20"
              />
            </div>
          </div>
        )}

        {/* Question 8: Ration Card & Disability */}
        {currentStep === 8 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                8. {isHindi ? "राशन कार्ड व विशेष सामाजिक सुरक्षा" : "Social Security Flags"}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isHindi ? "क्या आपके पास कोई विशेष राशन कार्ड या दिव्यांगता प्रमाण पत्र है?" : "Do you hold a ration card or disability certificate?"}
              </h2>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? "आयुष्मान भारत स्वास्थ्य बीमा, खाद्य सुरक्षा और दिव्यांग पेंशन योजनाओं का लाभ तुरंत प्राप्त करने हेतु।"
                  : "Crucial for Ayushman Bharat PM-JAY and national disability pensions."}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">
                {isHindi ? "राशन कार्ड का प्रकार:" : "Ration Card Classification:"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "bpl", hi: "बीपीएल (BPL)", en: "BPL Card" },
                  { id: "antyodaya", hi: "अंत्योदय (AAY)", en: "Antyodaya (AAY)" },
                  { id: "apl", hi: "एपीएल (APL)", en: "APL Card" },
                  { id: "none", hi: "कोई नहीं (None)", en: "No Ration Card" },
                ].map((rc) => (
                  <button
                    key={rc.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, ration_card_type: rc.id as RationCardType })}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      profile.ration_card_type === rc.id
                        ? "bg-[#165D51]/10 border-[#165D51] text-[#165D51]"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <span>{isHindi ? rc.hi : rc.en}</span>
                    {profile.ration_card_type === rc.id && <Check className="w-3.5 h-3.5 text-[#165D51]" />}
                  </button>
                ))}
              </div>

              {/* Differently Abled Checkbox */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between mt-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-900 block">
                    {isHindi ? "क्या आवेदक दिव्यांगजन (Divyangjan) हैं?" : "Is the applicant a Person with Disability?"}
                  </span>
                  <span className="text-[11px] text-amber-800 block">
                    {isHindi ? "मासिक दिव्यांग पेंशन और सहायक उपकरण अनुदान हेतु" : "For monthly pension and assistive aids"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.is_differently_abled}
                  onChange={(e) => setProfile({ ...profile, is_differently_abled: e.target.checked })}
                  className="w-5 h-5 text-[#165D51] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Voice Input Feedback Bar */}
        {speechTranscript && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>{isHindi ? "पहचाना गया वॉयस इनपुट:" : "Recognized Speech:"}</strong> "{speechTranscript}"
            </span>
          </div>
        )}

        {/* Controls Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isHindi ? "पिछला सवाल" : "Back"}</span>
              </button>
            )}

            {/* Microphone Tap Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
              title={isHindi ? "बोलकर उत्तर दें" : "Answer with voice"}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#165D51]" />}
              <span>{isListening ? (isHindi ? "सुन रहे हैं..." : "Listening...") : (isHindi ? "बोलें (Mic)" : "Speak")}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#165D51] hover:bg-[#114E43] text-white shadow-sm flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
          >
            <span>
              {currentStep === 8
                ? isHindi
                  ? "पात्र योजनाएं खोजें (Find Schemes)"
                  : "Find Eligible Schemes"
                : isHindi
                ? "अगला सवाल →"
                : "Next Question →"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveInterview;
