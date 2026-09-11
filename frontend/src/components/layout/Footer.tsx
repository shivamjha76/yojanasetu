import React from "react";
import { useApp } from "@/context/AppContext";
import {
  ShieldAlert,
  PhoneCall,
  ExternalLink,
  Heart,
  Github,
  Building2,
  FileCheck,
} from "lucide-react";

export const Footer: React.FC = () => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const helplines = [
    {
      titleHi: "किसान कॉल सेंटर (PM-Kisan)",
      titleEn: "Kisan Call Center (PM-Kisan)",
      number: "1800-180-1551",
    },
    {
      titleHi: "आयुष्मान भारत PM-JAY टोल-फ्री",
      titleEn: "Ayushman Bharat PM-JAY",
      number: "14555 / 1800-111-565",
    },
    {
      titleHi: "राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)",
      titleEn: "National Scholarship Portal",
      number: "0120-6619540",
    },
    {
      titleHi: "एल्डर लाइन (वरिष्ठ नागरिक हेल्पलाइन)",
      titleEn: "Elder Line (Senior Citizens)",
      number: "14567",
    },
    {
      titleHi: "राष्ट्रीय आपातकालीन नंबर",
      titleEn: "National Emergency Number",
      number: "112",
    },
  ];

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      {/* National Helplines Strip */}
      <div className="border-b border-border/80 bg-muted/40 py-6 px-4 sm:px-8">
        <div className="container mx-auto">
          <div className="flex items-center space-x-2 text-sm font-semibold text-foreground mb-3">
            <PhoneCall className="w-4 h-4 text-primary" />
            <span>
              {isHindi ? "राष्ट्रीय सरकारी हेल्पलाइन नंबर" : "National Government Helplines"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {helplines.map((h, idx) => (
              <div
                key={idx}
                className="bg-background rounded-lg p-2.5 border border-border/70 text-xs shadow-subtle"
              >
                <div className="text-muted-foreground font-medium truncate">
                  {isHindi ? h.titleHi : h.titleEn}
                </div>
                <div className="text-primary font-bold mt-1 text-sm">{h.number}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto py-10 px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center">
                🌉
              </span>
              <span className="font-extrabold text-lg tracking-tight">
                योजना<span className="text-primary">सेतु</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isHindi
                ? "100% प्रत्यक्ष नागरिक कल्याण सेतु। गणितीय रूप से सटीक पात्रता नियम और AI-संचालित नागरिक समझ — बिना किसी बिचौलिए के।"
                : "100% Direct-to-Citizen Welfare Discovery. Deterministic rule-based eligibility calculation with zero hallucination."}
            </p>
            <div className="flex items-center space-x-2 pt-2 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isHindi ? "15 प्रमुख योजनाएं सक्रिय" : "15 Verified Schemes Active"}</span>
            </div>
          </div>

          {/* Col 2: Official Portals */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-foreground flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{isHindi ? "आधिकारिक पोर्टल" : "Official Portals"}</span>
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center space-x-1"
                >
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center space-x-1"
                >
                  <span>PM-Kisan Samman Nidhi</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center space-x-1"
                >
                  <span>Ayushman Bharat PM-JAY</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center space-x-1"
                >
                  <span>National Scholarship Portal</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Transparency & Open Data */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-foreground flex items-center space-x-1.5">
              <FileCheck className="w-3.5 h-3.5 text-primary" />
              <span>{isHindi ? "पारदर्शिता एवं डेटा" : "Transparency & Data"}</span>
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="https://github.com/shivamjha76/yojanasetu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center space-x-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <span className="hover:text-primary cursor-pointer">
                  {isHindi ? "ओपन स्कीम स्कीमा (JSON Schema)" : "Open Scheme Schema"}
                </span>
              </li>
              <li>
                <span className="hover:text-primary cursor-pointer">
                  {isHindi ? "नियम इंजन पद्धति" : "Deterministic Engine Specs"}
                </span>
              </li>
              <li>
                <span className="hover:text-primary cursor-pointer">
                  {isHindi ? "गोपनीयता नीति (Privacy First)" : "Privacy Policy"}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Citizen Disclaimer Box */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 text-xs space-y-2">
            <div className="flex items-center space-x-1.5 font-semibold text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{isHindi ? "नागरिक सुरक्षा सूचना" : "Citizen Advisory"}</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300/80 leading-relaxed text-[11px]">
              {isHindi
                ? "योजनासेतु किसी भी सेवा के लिए पैसे नहीं लेता। सरकारी योजनाओं के लिए किसी भी बिचौलिए को नकद भुगतान न करें। केवल आधिकारिक सरकारी पोर्टल (.gov.in / .nic.in) पर ही आवेदन करें।"
                : "YojanaSetu never charges money. Never pay bribes or middlemen for welfare benefits. Always apply directly on official .gov.in or .nic.in portals."}
            </p>
          </div>
        </div>

        {/* Copyright & Made with Heart */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <div>
            © {new Date().getFullYear()} योजनासेतु (YojanaSetu) •{" "}
            {isHindi ? "भारत के नागरिकों के लिए समर्पित" : "Built for the Citizens of India"}
          </div>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for Bharat</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
