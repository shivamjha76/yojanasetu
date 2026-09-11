import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Globe,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

interface HeaderProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = "home",
  onNavigate = () => {},
}) => {
  const { language, toggleLanguage, theme, toggleTheme } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const isHindi = language === "hi";

  const navLinks = [
    {
      id: "home",
      labelHi: "Home",
      labelEn: "Home",
    },
    {
      id: "schemes",
      labelHi: "About",
      labelEn: "About",
    },
    {
      id: "csc",
      labelHi: "Contact",
      labelEn: "Contact",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-background/95 backdrop-blur border-b border-gray-100 dark:border-border transition-colors">
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl h-20 flex items-center justify-between">
        {/* Brand Logo (Exact Matching Screenshot) */}
        <div
          onClick={() => onNavigate("home")}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          {/* Leaf / Sprout Stylized Logo Icon */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9"
            >
              {/* Left Leaf */}
              <path
                d="M 18 30 C 18 30 7 24 7 13 C 7 7 12 5 18 10 C 18 10 12 18 18 30 Z"
                fill="#164e33"
              />
              {/* Center Stem Line */}
              <path
                d="M 18 32 L 18 10"
                stroke="#164e33"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Right Leaf */}
              <path
                d="M 18 28 C 18 28 29 22 29 11 C 29 5 24 3 18 8 C 18 8 24 16 18 28 Z"
                fill="#1b5e3f"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-gray-900 dark:text-white">
                Scheme Sarathi
              </span>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-muted-foreground font-medium -mt-0.5 tracking-tight">
              Government Benefits, Your Guide
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`relative py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-[#164e33] dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>{isHindi ? link.labelHi : link.labelEn}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#164e33] dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center space-x-3.5">
          {/* Language Selector Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-border text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-muted/40 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{isHindi ? "हिन्दी" : "English"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-card border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    if (language !== "en") toggleLanguage();
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-muted ${
                    language === "en" ? "text-primary font-bold bg-primary/5" : ""
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    if (language !== "hi") toggleLanguage();
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-muted ${
                    language === "hi" ? "text-primary font-bold bg-primary/5" : ""
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle (Subtle) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-muted transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary CTA "Get Started" (Exact Matching Screenshot) */}
          <button
            onClick={() => onNavigate("wizard")}
            className="bg-[#1b5038] hover:bg-[#14422e] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95"
          >
            {isHindi ? "शुरू करें" : "Get Started"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={toggleLanguage}
            className="p-2 text-xs font-bold border border-border rounded-xl"
          >
            {isHindi ? "EN" : "HI"}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold ${
                  currentView === link.id
                    ? "bg-emerald-50 text-[#164e33] dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span>{isHindi ? link.labelHi : link.labelEn}</span>
              </button>
            ))}
          </nav>

          <div className="pt-2 border-t border-border">
            <button
              onClick={() => {
                onNavigate("wizard");
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-[#1b5038] text-white py-2.5 rounded-xl font-semibold text-sm shadow-sm"
            >
              {isHindi ? "शुरू करें" : "Get Started"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
