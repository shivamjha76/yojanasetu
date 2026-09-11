import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import { api } from "@/services/api";
import { Search, Mic, X, ChevronRight, Building2, Coins, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        { label: "छात्रवृत्ति (Scholarship)", q: "scholarship" },
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
      {/* Omni-Search Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-card border-2 border-border/80 rounded-2xl shadow-md hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200"
      >
        <div className="pl-4 pr-2 text-muted-foreground">
          <Search className="w-5 h-5 text-primary" />
        </div>

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
          className="w-full py-3.5 pr-20 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />

        {/* Clear Query Button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1.5 mr-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={onVoiceClick}
          className="mr-2.5 p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center shrink-0"
          title={isHindi ? "बोलकर खोजें / Search by Voice" : "Search by Voice"}
        >
          <Mic className="w-4 h-4 text-primary" />
        </button>
      </form>

      {/* Debounced Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-border/60 text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>{isHindi ? "सुझाई गई योजनाएं" : "Suggested Schemes"}</span>
            {isLoading && <span className="animate-spin text-primary">●</span>}
          </div>

          {suggestions.length > 0 ? (
            <div className="divide-y divide-border/60">
              {suggestions.map((scheme) => (
                <div
                  key={scheme.id}
                  onClick={() => handleSelect(scheme.id)}
                  className="p-3 hover:bg-muted/60 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {isHindi ? scheme.name_hi : scheme.name_en}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Building2 className="w-3 h-3 mr-1 text-primary/70" />
                        <span className="truncate max-w-[200px]">{scheme.ministry}</span>
                      </span>
                      <span className="flex items-center text-primary font-medium">
                        <Coins className="w-3 h-3 mr-1" />
                        <span>{scheme.benefit_amount_text}</span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground">
              {isHindi ? "कोई योजना नहीं मिली। अलग शब्द खोजें।" : "No schemes found matching this query."}
            </div>
          )}
        </div>
      )}

      {/* Trending Search Keywords */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
        <span className="text-muted-foreground flex items-center mr-1">
          <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
          <span>{isHindi ? "लोकप्रिय:" : "Popular:"}</span>
        </span>
        {trendingSearches.map((item, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            onClick={() => {
              setQuery(item.label);
              onSearch(item.q);
            }}
            className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors py-0.5 px-2.5 text-[11px]"
          >
            {item.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};
