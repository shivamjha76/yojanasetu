import React from "react";
import { useApp } from "@/context/AppContext";
import {
  PhoneCall,
  ExternalLink,
  Building2,
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
      titleHi: "आयुष्मान भारत PM-JAY",
      titleEn: "Ayushman Bharat PM-JAY",
      number: "14555 / 1800-111-565",
    },
    {
      titleHi: "राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)",
      titleEn: "National Scholarship Portal",
      number: "0120-6619540",
    },
    {
      titleHi: "एल्डर लाइन (वरिष्ठ नागरिक)",
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
    <footer className="w-full border-t border-[#E5ECE7] bg-[#F8FAF9] text-[#2C3E50] transition-colors">
      
      {/* ======================================================== */}
      {/* 1. National Helplines Strip (Light & Harmonious Cards)   */}
      {/* ======================================================== */}
      <div className="border-b border-[#E2EDE5] bg-[#EEF6F1]/60 py-6 px-4 sm:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#165D51] mb-3.5">
            <div className="w-6 h-6 rounded-full bg-[#165D51]/10 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5 text-[#165D51]" />
            </div>
            <span>
              {isHindi ? "राष्ट्रीय सरकारी हेल्पलाइन नंबर" : "National Government Helplines"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {helplines.map((h, idx) => (
              <a
                key={idx}
                href={`tel:${h.number.split("/")[0].trim().replace(/-/g, "")}`}
                className="bg-white rounded-2xl p-3 border border-[#E0EBE2] hover:border-[#165D51]/40 shadow-2xs hover:shadow-xs transition-all text-xs group block"
              >
                <div className="text-[#64748B] font-medium text-[11px] truncate group-hover:text-[#165D51] transition-colors">
                  {isHindi ? h.titleHi : h.titleEn}
                </div>
                <div className="text-[#165D51] font-bold mt-1 text-sm tracking-wide">
                  {h.number}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Main Footer Content: Logo + Verified Badge & Portals  */}
      {/* ======================================================== */}
      <div className="container mx-auto max-w-7xl py-8 sm:py-10 px-6 sm:px-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          
          {/* Left: Brand Logo & Verified Schemes Badge */}
          <div className="space-y-3 shrink-0">
            <div className="flex items-center select-none">
              <img
                src="/images/logo_exact_transparent.png"
                alt="Scheme Sarathi - Government Benefits, Your Guide"
                className="h-10 w-auto object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5EE] text-[#165D51] text-xs font-semibold border border-[#D5E7DA] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#185644] animate-pulse" />
              <span>{isHindi ? "15+ सत्यापित योजनाएं सक्रिय" : "15+ Verified Schemes Active"}</span>
            </div>
          </div>

          {/* Right: Official Portals Links */}
          <div className="space-y-2.5">
            <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-[#165D51]" />
              <span>{isHindi ? "आधिकारिक पोर्टल" : "Official Portals"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#525B64]">
              <a
                href="https://india.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#165D51] flex items-center space-x-1 transition-colors font-medium"
              >
                <span>National Portal of India</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <a
                href="https://pmkisan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#165D51] flex items-center space-x-1 transition-colors font-medium"
              >
                <span>PM-Kisan</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <a
                href="https://pmjay.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#165D51] flex items-center space-x-1 transition-colors font-medium"
              >
                <span>Ayushman Bharat PM-JAY</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <a
                href="https://scholarships.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#165D51] flex items-center space-x-1 transition-colors font-medium"
              >
                <span>National Scholarship Portal</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <a
                href="https://www.skillindiadigital.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#165D51] flex items-center space-x-1 transition-colors font-medium"
              >
                <span>Skill India Digital</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
