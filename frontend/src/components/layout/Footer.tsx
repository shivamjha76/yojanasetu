import React from "react";
import { useApp } from "@/context/AppContext";
import {
  ShieldAlert,
  PhoneCall,
  ExternalLink,
  Heart,
  Github,
  Building2,
  ShieldCheck,
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
      {/* 2. Main Footer Content (4 Clean Columns)                 */}
      {/* ======================================================== */}
      <div className="container mx-auto max-w-7xl py-12 px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Mission (4 cols) */}
          <div className="space-y-4 md:col-span-4">
            <div className="flex items-center select-none">
              <img
                src="/images/logo_exact_transparent.png"
                alt="Scheme Sarathi - Government Benefits, Your Guide"
                className="h-10 w-auto object-contain"
              />
            </div>

            <p className="text-xs sm:text-[13px] text-[#525B64] leading-relaxed max-w-sm">
              {isHindi
                ? "100% प्रत्यक्ष नागरिक कल्याण खोज। गणितीय रूप से सटीक पात्रता गणना और सुरक्षित डिजिटल मार्गदर्शन — बिना किसी बिचौलिए के।"
                : "100% Direct-to-Citizen Welfare Guide. Deterministic rule-based eligibility calculation with zero middlemen and zero hallucination."}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5EE] text-[#165D51] text-xs font-semibold border border-[#D5E7DA] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#185644] animate-pulse" />
              <span>{isHindi ? "15+ सत्यापित योजनाएं सक्रिय" : "15+ Verified Schemes Active"}</span>
            </div>
          </div>

          {/* Col 2: Official Portals (3 cols) */}
          <div className="space-y-3.5 md:col-span-3 text-xs">
            <h4 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#165D51]" />
              <span>{isHindi ? "आधिकारिक पोर्टल" : "Official Portals"}</span>
            </h4>

            <ul className="space-y-2.5 text-[#525B64]">
              <li>
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#165D51] flex items-center space-x-1.5 transition-colors font-medium"
                >
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#165D51] flex items-center space-x-1.5 transition-colors font-medium"
                >
                  <span>PM-Kisan Samman Nidhi</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#165D51] flex items-center space-x-1.5 transition-colors font-medium"
                >
                  <span>Ayushman Bharat PM-JAY</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#165D51] flex items-center space-x-1.5 transition-colors font-medium"
                >
                  <span>National Scholarship Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.skillindiadigital.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#165D51] flex items-center space-x-1.5 transition-colors font-medium"
                >
                  <span>Skill India Digital</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Transparency & Services (2 cols) */}
          <div className="space-y-3.5 md:col-span-2 text-xs">
            <h4 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#165D51]" />
              <span>{isHindi ? "पारदर्शिता एवं डेटा" : "Transparency"}</span>
            </h4>

            <ul className="space-y-2.5 text-[#525B64]">
              <li>
                <a
                  href="https://github.com/shivamjha76/yojanasetu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#165D51] flex items-center space-x-1.5 transition-colors font-medium"
                >
                  <Github className="w-3.5 h-3.5 text-gray-500" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <span className="hover:text-[#165D51] cursor-pointer font-medium">
                  {isHindi ? "ओपन स्कीम स्कीमा" : "Open Scheme Schema"}
                </span>
              </li>
              <li>
                <span className="hover:text-[#165D51] cursor-pointer font-medium">
                  {isHindi ? "नियम इंजन पद्धति" : "Deterministic Engine"}
                </span>
              </li>
              <li>
                <span className="hover:text-[#165D51] cursor-pointer font-medium">
                  {isHindi ? "गोपनीयता नीति" : "Privacy Policy"}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Citizen Advisory Card (3 cols) */}
          <div className="md:col-span-3">
            <div className="p-4 rounded-3xl border border-[#FDE6CA] bg-[#FEF9F3] text-xs space-y-2 shadow-2xs">
              <div className="flex items-center space-x-1.5 font-bold text-[#B45309]">
                <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>{isHindi ? "नागरिक सुरक्षा सलाह" : "Citizen Advisory"}</span>
              </div>
              <p className="text-[#92400E] leading-relaxed text-[11px]">
                {isHindi
                  ? "Scheme Sarathi पूर्णतः निःशुल्क नागरिक सेवा है। किसी भी योजना के लिए किसी बिचौलिए को पैसे न दें। केवल आधिकारिक (.gov.in / .nic.in) पोर्टलों या अधिकृत जन सेवा केंद्रों पर ही आवेदन करें।"
                  : "Scheme Sarathi never charges money. Never pay bribes or middlemen for welfare benefits. Always apply directly on official .gov.in or .nic.in portals."}
              </p>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. Bottom Sub-Footer (Copyright & Indian Tricolor Dot)   */}
        {/* ======================================================== */}
        <div className="border-t border-[#E5ECE7] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-3">
          <div>
            © {new Date().getFullYear()} Scheme Sarathi (योजना सेतु) •{" "}
            {isHindi ? "भारत के नागरिकों के लिए समर्पित" : "Built for the Citizens of India"}
          </div>

          {/* Tricolor Accent Pill */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#FF9933] rounded-full" />
            <span className="w-3 h-1 bg-gray-300 rounded-full" />
            <span className="w-3 h-1 bg-[#138808] rounded-full" />
          </div>

          <div className="flex items-center space-x-1 font-medium">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for Bharat</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
