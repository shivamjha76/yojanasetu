import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Laptop,
  Store,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface HowToApplySectionProps {
  scheme: Scheme;
  onLocateCsc?: () => void;
}

export const HowToApplySection: React.FC<HowToApplySectionProps> = ({
  scheme,
  onLocateCsc = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [activeChannel, setActiveChannel] = useState<"online" | "csc">("online");

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-subtle">
      {/* Section Header */}
      <div className="space-y-1 border-b border-border/60 pb-4">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>{isHindi ? "आवेदन प्रक्रिया" : "Application Guide"}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          {isHindi ? "आवेदन कैसे करें: 2 आसान तरीके" : "How to Apply: 2 Direct Pathways"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isHindi
            ? "बिना किसी दलाल या बिचौलिये के — ऑनलाइन पोर्टल द्वारा अथवा अपने नजदीकी जन सेवा केंद्र (CSC) पर जाकर आवेदन करें।"
            : "Direct citizen pathways with zero middlemen fees: online self-application or verified CSC center."}
        </p>
      </div>

      {/* Channel Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-muted/40 border border-border">
        <button
          onClick={() => setActiveChannel("online")}
          className={`p-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
            activeChannel === "online"
              ? "bg-card text-primary shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Laptop className="w-4 h-4 text-primary" />
          <span>{isHindi ? "1. ऑनलाइन डिजिटल माध्यम" : "1. Online Portal (Self)"}</span>
        </button>

        <button
          onClick={() => setActiveChannel("csc")}
          className={`p-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
            activeChannel === "csc"
              ? "bg-card text-primary shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isHindi ? "2. जन सेवा केंद्र (CSC)" : "2. Jan Seva Kendra (CSC)"}</span>
        </button>
      </div>

      {/* Channel 1: Online Digital Route */}
      {activeChannel === "online" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-primary">
                {isHindi ? "सत्यापित सरकारी पोर्टल" : "Verified Official Government Portal"}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate max-w-sm">
                {scheme.official_portal_url}
              </div>
            </div>

            <a
              href={scheme.official_portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 shrink-0 space-x-1.5 transition-all"
            >
              <span>{isHindi ? "पोर्टल खोलें एवं आवेदन करें" : "Open Official Portal"}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          {/* Sequential Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isHindi ? "चरण-दर-चरण ऑनलाइन प्रक्रिया:" : "Step-by-step online process:"}
            </h4>

            {scheme.application_steps_hi && scheme.application_steps_hi.length > 0 ? (
              <div className="space-y-2.5">
                {(isHindi ? scheme.application_steps_hi : scheme.application_steps_en).map(
                  (step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border/80 bg-card flex items-start space-x-3 text-xs sm:text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground">{step}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {idx === 0 && (isHindi ? "पोर्टल पर 'New Registration' या 'नागरिक लॉगिन' पर क्लिक करें" : "Click 'New Citizen Registration' on the official site")}
                          {idx === 1 && (isHindi ? "आधार से लिंक मोबाइल नंबर पर आए OTP से ई-केवाईसी पूर्ण करें" : "Verify Aadhaar OTP sent to linked mobile number")}
                          {idx === 2 && (isHindi ? "दस्तावेज स्कैन कॉपी अपलोड करें और बैंक पासबुक संख्या दर्ज करें" : "Upload documents and enter DBT-enabled bank account details")}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-border bg-card flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">1</div>
                  <span>{isHindi ? "आधिकारिक पोर्टल पर जाएं और 'नया आवेदन' चुनें" : "Visit official portal and select New Application"}</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">2</div>
                  <span>{isHindi ? "आधार ओटीपी से प्रमाणीकरण पूरा करें" : "Complete Aadhaar OTP authentication"}</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">3</div>
                  <span>{isHindi ? "आवेदन संख्या (Application ID) नोट करें और रसीद डाउनलोड करें" : "Save application tracking reference number"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Channel 2: Offline CSC / Jan Seva Kendra Route */}
      {activeChannel === "csc" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {isHindi ? "जन सेवा केंद्र (Common Services Center)" : "Jan Seva Kendra / CSC Route"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isHindi
                  ? "यदि आपके पास कंप्यूटर या स्मार्टफोन नहीं है, तो अपने निकटतम CSC केंद्र जाकर बायोमेट्रिक से आवेदन कराएं।"
                  : "Assisted offline application at verified CSC centers with biometric eKYC."}
              </p>
            </div>

            <Button
              onClick={onLocateCsc}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 px-5 shrink-0 shadow-md shadow-emerald-600/20 space-x-1.5"
            >
              <span>{isHindi ? "नजदीकी केंद्र खोजें" : "Locate Nearest CSC"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* CSC Checklist to carry */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? "केंद्र पर साथ ले जाने वाले मूल दस्तावेज:" : "Original documents to carry:"}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl border border-border bg-card flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isHindi ? "मूल आधार कार्ड (Aadhaar Original)" : "Original Aadhaar Card"}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isHindi ? "बैंक पासबुक (DBT सक्रिय बैंक खाता)" : "Bank Passbook with DBT active"}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isHindi ? "राशन कार्ड / समग्र आईडी (यदि लागू हो)" : "Ration Card or Family ID"}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isHindi ? "2 पासपोर्ट साइज रंगीन फोटो" : "2 Passport-sized photographs"}</span>
              </div>
            </div>
          </div>

          {/* CSC Fee Notice */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">
              {isHindi ? "अधिकृत सरकारी शुल्क: " : "Authorized Government Fee: "}
            </span>
            {isHindi
              ? "CSC केंद्र पर केवल ₹20 - ₹50 का नाममात्र सरकारी पोर्टल सेवा शुल्क लगता है। किसी भी अतिरिक्त 'कमीशन' या रिश्वत की मांग करना गैरकानूनी है।"
              : "Only nominal CSC processing fee (₹20-₹50) is applicable. Asking for bribe or extra commission is strictly illegal."}
          </div>
        </div>
      )}

      {/* Official Helplines & Anti-Corruption Footer */}
      <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3 text-muted-foreground">
          <PhoneCall className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-bold text-foreground">
              {isHindi ? "राष्ट्रीय हेल्पलाइन: " : "National Helpline: "}
            </span>
            <span>1947 (UIDAI) • 155261 (DBT भारत)</span>
          </div>
        </div>

        <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>{isHindi ? "100% बिचौलिया-मुक्त योजनासेतु गारंटी" : "100% Middleman-Free Guarantee"}</span>
        </div>
      </div>
    </div>
  );
};
