import React from "react";
import { useApp } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";
import { ParliamentWatermark } from "./ParliamentWatermark";

interface HeroSectionProps {
  onStartWizard?: () => void;
  onExploreSchemes?: () => void;
  onOpenAssistant?: () => void;
  onSearch?: (query: string) => void;
  onSelectScheme?: (schemeId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartWizard = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  return (
    <section className="relative overflow-hidden bg-white dark:bg-background pt-6 sm:pt-10 pb-16 transition-colors">
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center min-h-[580px]">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Clean High-Conversion Headline & CTA        */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-7 z-20 text-left">
            {/* Main Headline (Exact Typography matching reference) */}
            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08]">
              {isHindi ? (
                <>
                  खोजें सरकारी <br />
                  योजनाएं{" "}
                  <span className="text-[#1a4d36] dark:text-emerald-400">
                    खास
                  </span>
                  <br />
                  <span className="text-[#1a4d36] dark:text-emerald-400">
                    आपके लिए
                  </span>
                </>
              ) : (
                <>
                  Find Government <br />
                  Schemes{" "}
                  <span className="text-[#1a4d36] dark:text-emerald-400">
                    Made
                  </span>
                  <br />
                  <span className="text-[#1a4d36] dark:text-emerald-400">
                    For You
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-md font-normal">
              {isHindi
                ? "बस अपने बारे में थोड़ा बताएं। Scheme Sarathi आपको उन सभी योजनाओं को खोजने में मदद करता है जिनके आप पात्र हैं और आगे के चरणों में आपका मार्गदर्शन करता है।"
                : "Just tell us about yourself. Scheme Sarathi helps you find the schemes you may qualify for and guide you on the next steps."}
            </p>

            {/* Primary Action Button */}
            <div className="pt-1 space-y-3">
              <button
                onClick={onStartWizard}
                className="bg-[#1a4d36] hover:bg-[#143f2c] text-white px-8 py-3.5 rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center space-x-2 active:scale-95 group"
              >
                <span>{isHindi ? "शुरू करें" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 font-medium">
                {isHindi
                  ? "सरल। व्यक्तिगत। आपकी अपनी भाषा में।"
                  : "Simple. Personal. In your language."}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Interactive Hero Composition               */}
          {/* (Student Image + Organic Blob + Chat Bubbles + Tiranga) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[460px] sm:min-h-[540px]">
            
            {/* 1. Organic Mint/Sage Soft Background Shape */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] lg:w-[500px] h-[340px] sm:h-[460px] lg:h-[500px] bg-[#eef6f1] dark:bg-emerald-950/20 pointer-events-none -z-10 transition-all"
              style={{
                borderRadius: "44% 56% 62% 38% / 42% 48% 52% 58%",
              }}
            />

            {/* 2. Architectural Landmark Watermark (Parliament Dome & Flag) */}
            <div className="absolute right-[-10px] sm:right-[-20px] bottom-0 w-[240px] sm:w-[320px] lg:w-[360px] pointer-events-none opacity-80 z-0">
              <ParliamentWatermark className="w-full h-auto" />
            </div>

            {/* 3. Center Photographic Cutout of Indian Student with Smartphone */}
            <div className="relative z-10 max-w-[280px] sm:max-w-[340px] lg:max-w-[370px]">
              <img
                src="/images/hero-student.png"
                alt="Young Indian citizen discovering welfare schemes on smartphone"
                className="w-full h-auto object-contain mx-auto select-none pointer-events-none drop-shadow-sm"
              />
              {/* Bottom Subtle Gradient Mask for Smooth Cutout Fade */}
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white dark:from-background via-white/40 dark:via-background/40 to-transparent pointer-events-none" />
            </div>

            {/* 4. Top-Right Cursive Callout: "Sarkari Yojana, Ab Sabke Liye" + Tiranga */}
            <div className="absolute top-2 sm:top-6 right-2 sm:right-6 z-20 select-none text-right">
              <div
                className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#165337] dark:text-emerald-300 leading-[1.05] tracking-tight -rotate-3"
                style={{
                  fontFamily: "'Caveat', 'Kalam', cursive",
                }}
              >
                <div>Sarkari</div>
                <div>Yojana,</div>
                <div>Ab Sabke Liye</div>
              </div>

              {/* Hand-drawn styled Indian Tricolor Brush Underline */}
              <div className="flex justify-end mt-1.5 -rotate-3">
                <svg
                  width="115"
                  height="12"
                  viewBox="0 0 115 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Saffron line */}
                  <path
                    d="M 5 3 Q 55 1 110 3"
                    stroke="#ff9933"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* White subtle line */}
                  <path
                    d="M 12 6 Q 55 4 105 6"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Green line */}
                  <path
                    d="M 20 9 Q 60 7 112 8"
                    stroke="#138808"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* 5. Floating Conversational Chat Bubbles */}

            {/* --- Chat Bubble 1: Assistant Greeting (Top Right of Student) --- */}
            <div className="absolute top-[14%] sm:top-[16%] right-[6%] sm:right-[10%] lg:right-[14%] z-20 animate-in fade-in slide-in-from-top-3 duration-500">
              <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl rounded-bl-xs p-3 sm:p-3.5 shadow-lg shadow-black/5 max-w-[190px] sm:max-w-[220px]">
                <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center gap-1">
                  <span>Hi! 👋</span>
                </div>
                <div className="text-xs sm:text-[13px] text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">
                  {isHindi ? "अपने बारे में बताइए।" : "Tell me about yourself."}
                </div>
              </div>
            </div>

            {/* --- Chat Bubble 2: Citizen Response (Middle Right) --- */}
            <div className="absolute top-[40%] sm:top-[42%] right-[1%] sm:right-[3%] lg:right-[4%] z-20 animate-in fade-in slide-in-from-right-3 duration-700">
              <div className="bg-[#dcfce7] border border-[#bbf7d0] dark:bg-emerald-950/70 dark:border-emerald-800 text-[#14532d] dark:text-emerald-200 rounded-2xl rounded-tr-xs p-3 sm:p-3.5 shadow-sm max-w-[210px] sm:max-w-[240px]">
                <div className="text-xs sm:text-[13px] font-medium leading-snug">
                  {isHindi
                    ? "मैं राजस्थान से 21 वर्षीय छात्र हूँ।"
                    : "I am a student from Rajasthan, 21 years old."}
                </div>
              </div>
            </div>

            {/* --- Chat Bubble 3: Recommended Result (Bottom Right) --- */}
            <div className="absolute bottom-[10%] sm:bottom-[12%] right-[4%] sm:right-[8%] lg:right-[10%] z-20 animate-in fade-in slide-in-from-bottom-3 duration-900">
              <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl rounded-tl-xs p-3 sm:p-3.5 shadow-lg shadow-black/5 max-w-[210px] sm:max-w-[240px] space-y-1.5">
                <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  {isHindi ? "शानदार!" : "Great!"}
                </div>
                <div className="text-xs sm:text-[13px] text-gray-600 dark:text-gray-300 leading-snug">
                  {isHindi
                    ? "ये रहीं वे योजनाएं जिनके आप पात्र हैं:"
                    : "Here are the schemes you may qualify for."}
                </div>

                {/* Animated Typing Dots */}
                <div className="flex items-center space-x-1 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#165337] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#165337] animate-pulse [animation-delay:200ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#165337] animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM MOTTO DIVIDER: "A MORE INFORMED. A STRONGER INDIA." */}
        {/* ======================================================== */}
        <div className="mt-16 sm:mt-20 pt-8 flex items-center justify-center">
          <div className="w-16 sm:w-32 h-[1px] bg-gray-200 dark:bg-gray-700" />
          <span className="px-4 sm:px-6 text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-gray-500 dark:text-gray-400 uppercase text-center select-none">
            {isHindi
              ? "अधिक जागरूक • सशक्त भारत"
              : "A MORE INFORMED. A STRONGER INDIA."}
          </span>
          <div className="w-16 sm:w-32 h-[1px] bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </section>
  );
};
