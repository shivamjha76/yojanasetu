import React from "react";
import { useApp } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";

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
    <section className="relative overflow-hidden bg-[#FEFEFD] pt-4 sm:pt-8 pb-12 transition-colors">
      <div className="container mx-auto px-6 sm:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center min-h-[520px]">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Clean Typography & CTA Button               */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6 z-20 text-left">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-[#0C1924] leading-[1.08]">
              {isHindi ? (
                <>
                  खोजें सरकारी <br />
                  योजनाएं{" "}
                  <span className="text-[#1D5F49]">
                    खास
                  </span>
                  <br />
                  <span className="text-[#1D5F49]">
                    आपके लिए
                  </span>
                </>
              ) : (
                <>
                  Find Government <br />
                  Schemes{" "}
                  <span className="text-[#1D5F49]">
                    Made
                  </span>
                  <br />
                  <span className="text-[#1D5F49]">
                    For You
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-[15px] sm:text-base text-[#525B64] leading-relaxed max-w-md font-normal">
              {isHindi
                ? "बस अपने बारे में थोड़ा बताएं। Scheme Sarathi आपको उन सभी योजनाओं को खोजने में मदद करता है जिनके आप पात्र हैं और आगे के चरणों में आपका मार्गदर्शन करता है।"
                : "Just tell us about yourself. Scheme Sarathi helps you find the schemes you may qualify for and guide you on the next steps."}
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-3">
              <button
                onClick={onStartWizard}
                className="bg-[#1D5F49] hover:bg-[#174E3C] text-white px-7 py-3 rounded-xl font-semibold text-[15px] shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center space-x-2 active:scale-95 group cursor-pointer"
              >
                <span>{isHindi ? "शुरू करें" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-xs sm:text-[13px] text-[#737C85] font-normal">
                {isHindi
                  ? "सरल। व्यक्तिगत। आपकी अपनी भाषा में।"
                  : "Simple. Personal. In your language."}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Visual Composition Matching Reference      */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 relative flex items-center justify-center lg:justify-end">
            <div 
              onClick={onStartWizard}
              className="relative w-full max-w-[620px] cursor-pointer group select-none transition-transform duration-300 hover:scale-[1.01]"
              title="Click to discover schemes"
            >
              <img
                src="/images/hero_visual_transparent.png"
                alt="Scheme Sarathi Citizen Assistant finding welfare schemes"
                className="w-full h-auto object-contain drop-shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM MOTTO DIVIDER: "A MORE INFORMED. A STRONGER INDIA." */}
        {/* ======================================================== */}
        <div className="mt-14 sm:mt-20 pt-4 flex items-center justify-center">
          <div className="w-20 sm:w-36 h-[1px] bg-[#E2E8F0]" />
          <span className="px-4 sm:px-6 text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#64748B] uppercase text-center select-none">
            {isHindi
              ? "अधिक जागरूक • सशक्त भारत"
              : "A MORE INFORMED. A STRONGER INDIA."}
          </span>
          <div className="w-20 sm:w-36 h-[1px] bg-[#E2E8F0]" />
        </div>
      </div>
    </section>
  );
};
