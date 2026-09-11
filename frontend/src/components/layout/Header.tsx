import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Moon,
  Globe,
  Sparkles,
  Menu,
  X,
  Compass,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

interface HeaderProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = "home",
  onNavigate = () => {},
}) => {
  const { language, toggleLanguage, theme, toggleTheme, setIsAssistantOpen } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHindi = language === "hi";

  const navLinks = [
    {
      id: "home",
      labelHi: "होम",
      labelEn: "Home",
      icon: <Compass className="w-4 h-4 mr-1.5" />,
    },
    {
      id: "schemes",
      labelHi: "योजनाएं खोजें",
      labelEn: "Explore Schemes",
      icon: <Compass className="w-4 h-4 mr-1.5" />,
    },
    {
      id: "wizard",
      labelHi: "पात्रता जांचें (2 मिनट)",
      labelEn: "Check Eligibility",
      icon: <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />,
      highlight: true,
    },
    {
      id: "csc",
      labelHi: "जन सेवा केंद्र खोजें",
      labelEn: "CSC Locator",
      icon: <MapPin className="w-4 h-4 mr-1.5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Govt Direct Action Bar */}
      <div className="hidden sm:flex items-center justify-between px-4 py-1 text-xs bg-muted/60 text-muted-foreground border-b border-border/40">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>
            {isHindi
              ? "100% प्रत्यक्ष नागरिक पोर्टल • कोई बिचौलिया नहीं"
              : "100% Direct-to-Citizen Welfare Bridge • Zero Middlemen"}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://india.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-foreground"
          >
            National Portal of India
          </a>
          <span>|</span>
          <span>Toll-free: 1800-11-0031</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate("home")}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md transition-transform group-hover:scale-105">
            🌉
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                योजना<span className="text-primary">सेतु</span>
              </span>
              <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
                GovTech
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
              {isHindi ? "सीधा नागरिक कल्याण सेतु" : "Citizen Welfare Discovery Bridge"}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <Button
                key={link.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onNavigate(link.id)}
                className={`font-medium transition-all ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                } ${link.highlight ? "border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300" : ""}`}
              >
                {link.icon}
                {isHindi ? link.labelHi : link.labelEn}
              </Button>
            );
          })}
        </nav>

        {/* Right Controls (Language Toggle, Theme Toggle, AI Sahayak Trigger) */}
        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-2.5 h-9 text-xs font-semibold"
            title="भाषा बदलें / Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 mr-1 text-primary" />
            <span>{isHindi ? "English" : "हिंदी"}</span>
          </Button>

          {/* Dark / Light Mode Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="थीम बदलें / Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* AI Setu Sahayak Quick Button */}
          <Button
            size="sm"
            onClick={() => setIsAssistantOpen(true)}
            className="hidden sm:inline-flex bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-medium text-xs px-3 shadow-sm items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{isHindi ? "सेतु सहायक AI" : "AI Assistant"}</span>
          </Button>

          {/* Mobile Hamburger Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden h-9 w-9 text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Button
              key={link.id}
              variant={currentView === link.id ? "secondary" : "ghost"}
              className="w-full justify-start text-sm py-2.5"
              onClick={() => {
                onNavigate(link.id);
                setIsMobileMenuOpen(false);
              }}
            >
              {link.icon}
              {isHindi ? link.labelHi : link.labelEn}
            </Button>
          ))}

          <div className="pt-2 border-t border-border">
            <Button
              className="w-full justify-center bg-primary text-white space-x-2"
              onClick={() => {
                setIsAssistantOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isHindi ? "सेतु सहायक (AI Assistant) खोलें" : "Open Setu Sahayak AI"}</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
