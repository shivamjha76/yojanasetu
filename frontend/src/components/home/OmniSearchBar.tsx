import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import { api } from "@/services/api";
import { Search, Mic, X, ChevronRight, Building2, Coins, Sparkles, ArrowRight } from "lucide-react";

interface OmniSearchBarProps {
  onSearch?: (query: string) => void;
  onSelectScheme?: (schemeId: string) => void;
  onVoiceClick?: () => void;
}

export const OmniSearchBar: React.FC<OmniSearchBarProps> = ({
  onSearch = () => {},
  onSelectScheme = () => {},
  onVoiceClick = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Trending keyword pills
  const trendingSearches = isHindi
    ? [
        { label: "पीएम किसान", q: "kisan" },
        { label: "आयुष्मान कार्ड", q: "ayushman" },
        { label: "छात्रवृत्ति", q: "scholarship" },
        { label: "लाड़ली बहना", q: "ladli" },
        { label: "मुद्रा लोन", q: "mudra" },
        { label: "वृद्धावस्था पेंशन", q: "pension" },
      ]
    : [
        { label: "PM Kisan", q: "kisan" },
        { label: "Ayushman Card", q: "ayushman" },
        { label: "Scholarship", q: "scholarship" },
        { label: "Ladli Behna", q: "ladli" },
        { label: "Mudra Loan", q: "mudra" },
        { label: "Old Age Pension", q: "pension" },
      ];

  // Debounced live suggestion query
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.getSchemes({ q: query.trim(), limit: 5 });
        setSuggestions(res.schemes || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Failed to fetch search suggestions", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (schemeId: string) => {
    setIsOpen(false);
    onSelectScheme(schemeId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onSearch(query.trim());
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-30">
      {/* Omni-Search Box matching light theme */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white border border-[#CBD5E1] hover:border-[#1D5F49]/60 focus-within:border-[#1D5F49] focus-within:ring-4 focus-within:ring-[#1D5F49]/10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-1.5"
      >
        {/* Search Icon */}
        <div className="pl-3.5 pr-2.5 text-[#1D5F49] flex items-center shrink-0">
          <Search className="w-5 h-5 stroke-[2.2]" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={
            isHindi
              ? "योजना का नाम, मंत्रालय, या अपनी जरूरत खोजें (उदा. किसान, छात्रवृत्ति, आवास)..."
              : "Search by scheme name, ministry, or need (e.g. Kisan, Scholarship, Housing)..."
          }
          className="w-full py-2.5 px-2 bg-transparent text-sm sm:text-base text-[#0C1924] placeholder:text-[#94A3B8] font-normal focus:outline-none"
        />

        {/* Clear Query Button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1.5 mr-1 text-[#94A3B8] hover:text-[#0C1924] rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={onVoiceClick}
          className="p-2.5 rounded-xl bg-[#EAF6EE] hover:bg-[#D8EFE0] text-[#1D5F49] transition-all flex items-center justify-center shrink-0 shadow-2xs mr-1 cursor-pointer"
          title={isHindi ? "बोलकर खोजें / Search by Voice" : "Search by Voice"}
        >
          <Mic className="w-4 h-4 text-[#1D5F49]" />
        </button>

        {/* Search CTA Button */}
        <button
          type="submit"
          className="hidden sm:inline-flex items-center gap-1.5 bg-[#1D5F49] hover:bg-[#174E3C] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>{isHindi ? "खोजें" : "Search"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Debounced Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-40">
          <div className="p-3 bg-[#F8FAF9] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] flex items-center justify-between">
            <span>{isHindi ? "सुझाई गई योजनाएं" : "Suggested Schemes"}</span>
            {isLoading && <span className="animate-spin text-[#1D5F49]">●</span>}
          </div>

          {suggestions.length > 0 ? (
            <div className="divide-y divide-[#F1F5F9]">
              {suggestions.map((scheme) => (
                <div
                  key={scheme.id}
                  onClick={() => handleSelect(scheme.id)}
                  className="p-3.5 hover:bg-[#F0FDF4] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="text-sm font-bold text-[#0C1924] group-hover:text-[#1D5F49] transition-colors truncate">
                      {isHindi ? scheme.name_hi : scheme.name_en}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-[#64748B]">
                      <span className="flex items-center truncate">
                        <Building2 className="w-3 h-3 mr-1 text-[#1D5F49] shrink-0" />
                        <span className="truncate max-w-[220px]">{scheme.ministry}</span>
                      </span>
                      <span className="flex items-center text-[#1D5F49] font-semibold shrink-0">
                        <Coins className="w-3 h-3 mr-1 shrink-0" />
                        <span>{scheme.benefit_amount_text}</span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1D5F49] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#64748B]">
              {isHindi ? "कोई योजना नहीं मिली। अलग शब्द खोजें।" : "No schemes found matching this query."}
            </div>
          )}
        </div>
      )}

      {/* Trending Search Keywords */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-[#64748B] font-medium flex items-center mr-1">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500 fill-amber-400" />
          <span>{isHindi ? "लोकप्रिय:" : "Popular:"}</span>
        </span>
        {trendingSearches.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(item.label);
              onSearch(item.q);
            }}
            className="px-3 py-1 rounded-full bg-white hover:bg-[#EAF6EE] text-[#475569] hover:text-[#1D5F49] border border-[#E2E8F0] hover:border-[#1D5F49]/40 text-xs font-medium transition-all shadow-2xs cursor-pointer hover:scale-[1.02]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OmniSearchBar;
