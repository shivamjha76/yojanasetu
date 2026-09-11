import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";
import { OmniSearchBar } from "./OmniSearchBar";

interface HeroSectionProps {
  onStartWizard?: () => void;
  onExploreSchemes?: () => void;
  onOpenAssistant?: () => void;
  onSearch?: (query: string) => void;
  onSelectScheme?: (schemeId: string) => void;
}

const EN_PIECES = {
  p1: "Find Government",
  p2: "Schemes ",
  p3: "Made",
  p4: "For You",
};

const HI_PIECES = {
  p1: "खोजें सरकारी",
  p2: "योजनाएं ",
  p3: "खास ",
  p4: "आपके लिए",
};

const splitGraphemes = (str: string, locale: string): string[] => {
  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    const Segmenter = (Intl as any).Segmenter;
    const seg = new Segmenter(locale, { granularity: "grapheme" });
    return [...seg.segment(str)].map((x: any) => x.segment);
  }
  return Array.from(str);
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartWizard = () => {},
  onExploreSchemes = () => {},
  onOpenAssistant = () => {},
  onSearch = () => {},
  onSelectScheme = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const currentPieces = isHindi ? HI_PIECES : EN_PIECES;
  const locale = isHindi ? "hi" : "en";

  const p1Graphemes = useMemo(() => splitGraphemes(currentPieces.p1, locale), [currentPieces.p1, locale]);
  const p2Graphemes = useMemo(() => splitGraphemes(currentPieces.p2, locale), [currentPieces.p2, locale]);
  const p3Graphemes = useMemo(() => splitGraphemes(currentPieces.p3, locale), [currentPieces.p3, locale]);
  const p4Graphemes = useMemo(() => splitGraphemes(currentPieces.p4, locale), [currentPieces.p4, locale]);

  const len1 = p1Graphemes.length;
  const len2 = p2Graphemes.length;
  const len3 = p3Graphemes.length;
  const len4 = p4Graphemes.length;
  const totalGraphemes = len1 + len2 + len3 + len4;

  const [charProgress, setCharProgress] = useState(0);
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Smooth written animation timer
  useEffect(() => {
    setCharProgress(0);
    setIsTypingDone(false);

    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setCharProgress(count);
      if (count >= totalGraphemes) {
        clearInterval(interval);
        setIsTypingDone(true);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [language, totalGraphemes]);

  // Derived visible strings
  const line1Text = p1Graphemes.slice(0, Math.min(charProgress, len1)).join("");
  const showLine2 = charProgress > len1;
  const line2Part1 = showLine2 ? p2Graphemes.slice(0, Math.min(charProgress - len1, len2)).join("") : "";
  const showLine2Part2 = charProgress > len1 + len2;
  const line2Part2 = showLine2Part2 ? p3Graphemes.slice(0, Math.min(charProgress - (len1 + len2), len3)).join("") : "";

  const showLine3 = charProgress > len1 + len2 + len3;
  const line3Text = showLine3 ? p4Graphemes.slice(0, Math.min(charProgress - (len1 + len2 + len3), len4)).join("") : "";

  const showCursorLine1 = charProgress <= len1;
  const showCursorLine2 = charProgress > len1 && charProgress <= len1 + len2 + len3;
  const showCursorLine3 = charProgress > len1 + len2 + len3;

  const renderCursor = () => (
    <span
      className={`inline-block w-[3.5px] h-[0.8em] bg-[#1D5F49] ml-1.5 align-baseline rounded-full ${
        isTypingDone ? "opacity-0 transition-opacity duration-700" : "animate-pulse opacity-100"
      }`}
    />
  );

  return (
    <section className="relative overflow-hidden bg-[#FEFEFD] pt-4 sm:pt-8 pb-12 transition-colors">
      <div className="container mx-auto px-6 sm:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center min-h-[520px]">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Clean Typography & CTA Button               */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6 z-20 text-left">
            
            {/* Main Headline with Smooth Written Animation */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-[#0C1924] leading-[1.08] min-h-[140px] sm:min-h-[165px] lg:min-h-[190px]">
              {/* Line 1 */}
              <span>
                {line1Text}
                {showCursorLine1 && renderCursor()}
              </span>

              {/* Line 2 */}
              {showLine2 && (
                <>
                  <br />
                  <span>{line2Part1}</span>
                  {showLine2Part2 && <span className="text-[#1D5F49]">{line2Part2}</span>}
                  {showCursorLine2 && renderCursor()}
                </>
              )}

              {/* Line 3 */}
              {showLine3 && (
                <>
                  <br />
                  <span className="text-[#1D5F49]">{line3Text}</span>
                  {showCursorLine3 && renderCursor()}
                </>
              )}
            </h1>

            {/* 4 to 5 Words Tagline */}
            <p className="text-base sm:text-lg text-[#525B64] font-medium leading-relaxed max-w-md">
              {isHindi ? "सरकारी योजनाएं अब सबके लिए।" : "Government schemes simplified for you."}
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onStartWizard}
                  className="bg-[#1D5F49] hover:bg-[#174E3C] text-white px-7 py-3 rounded-xl font-semibold text-[15px] shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center space-x-2 active:scale-95 group cursor-pointer"
                >
                  <span>{isHindi ? "शुरू करें" : "Get Started"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={onExploreSchemes}
                  className="border border-[#CBD5E1] hover:border-[#1D5F49]/40 hover:bg-muted/40 text-[#334155] px-5 py-3 rounded-xl font-medium text-[15px] transition-all duration-200 inline-flex items-center space-x-2 cursor-pointer"
                >
                  <span>{isHindi ? "योजनाएं देखें" : "Explore Schemes"}</span>
                </button>
              </div>

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
                alt="YojanaSetu Citizen Assistant finding welfare schemes"
                className="w-full h-auto object-contain drop-shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* OMNI SEARCH BAR (Live Search, Voice Input, Trending Tags)*/}
        {/* ======================================================== */}
        <div className="mt-8 sm:mt-12 max-w-2xl mx-auto">
          <OmniSearchBar
            onSearch={onSearch}
            onSelectScheme={onSelectScheme}
            onVoiceClick={onOpenAssistant}
          />
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

export default HeroSection;
