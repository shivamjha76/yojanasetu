import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import { Scheme } from "@/types/schema";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UploadCloud,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SchemeIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchemeAdded?: (scheme: Scheme) => void;
}

const SAMPLE_GAZETTE_TEXT = `MINISTRY OF SKILL DEVELOPMENT & ENTREPRENEURSHIP
NOTIFICATION: PM VIKAS INTERNSHIP & LIVELIHOOD PROGRAM 2026

Under this scheme, eligible unemployed youth will receive a monthly stipend of ₹5,000 and 6 months of industrial apprenticeship.

Eligibility Conditions:
1. Candidate age must be between 18 to 28 years.
2. Candidate must belong to general, obc, sc, or st category.
3. Annual family income must be less than or equal to ₹3.0 Lakhs.
4. Candidate must be registered as unemployed youth.

Required Documentation:
- Aadhaar Card (linked with bank account for direct benefit transfer)
- Educational qualification marksheets
- Income certificate issued by Tahsildar / Revenue Authority

Application Procedure:
Submit online application at skillindia.gov.in and undergo biometric eKYC.`;

export const SchemeIngestModal: React.FC<SchemeIngestModalProps> = ({
  isOpen,
  onClose,
  onSchemeAdded = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [rawText, setRawText] = useState<string>("");
  const [schemeId, setSchemeId] = useState<string>("");
  const [categoryHint, setCategoryHint] = useState<string>("skills_employment");
  const [saveToCatalog, setSaveToCatalog] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleIngest = async () => {
    if (!rawText.trim()) return;
    setIsIngesting(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await api.ingestSchemeProse({
        raw_text: rawText.trim(),
        scheme_id_override: schemeId.trim() || undefined,
        category_hint: categoryHint,
        save_to_catalog: saveToCatalog,
      });

      setResult(res);
      if (res.success && res.parsed_scheme) {
        onSchemeAdded(res.parsed_scheme);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse scheme prose");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_GAZETTE_TEXT);
    setSchemeId("pm-vikas-internship-2026");
    setCategoryHint("skills_employment");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#165D51] mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isHindi ? "योजना गद्य इनजेशन पाइपलाइन" : "Scheme Prose Ingestion Pipeline (PS #1)"}</span>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {isHindi ? "सरकारी गैजेट / दस्तावेज़ से मशीन-पठनीय नियम बनाएं" : "Convert Official Gazette / Prose to Machine Rules"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {isHindi
              ? "किसी भी सरकारी आदेश, अधिसूचना या पीडीएफ के गद्य को यहां पेस्ट करें। हमारा इंजन इसे Pydantic स्कीमा के अनुरूप नियमों, दस्तावेजों और पात्रता शर्तों में स्वचालित रूप से रूपांतरित करेगा।"
              : "Paste raw government prose, gazette notifications, or guidelines. Our engine compiles them into strict, machine-executable deterministic rules."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Top helper actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">
              {isHindi ? "कच्चा दस्तावेज़ पाठ (Raw Prose):" : "Raw Scheme Text / Gazette Prose:"}
            </span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-[#165D51] hover:underline font-semibold cursor-pointer"
            >
              {isHindi ? "नमूना गैजेट लोड करें" : "Load Sample Gazette"}
            </button>
          </div>

          <textarea
            rows={7}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={
              isHindi
                ? "यहां सरकारी अधिसूचना, पात्रता मानदंड, अनुदान विवरण और आवश्यक दस्तावेजों का पाठ पेस्ट करें..."
                : "Paste government notification text, eligibility conditions, benefit amounts, and documents here..."
            }
            className="w-full p-3.5 rounded-2xl border border-gray-200 text-xs font-mono bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#165D51]/20 focus:border-[#165D51] outline-none transition-colors resize-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {isHindi ? "योजना आईडी (Slug):" : "Scheme Slug ID (Optional):"}
              </label>
              <input
                type="text"
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                placeholder="e.g. pm-vikas-internship"
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#165D51]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {isHindi ? "श्रेणी संकेत:" : "Category Hint:"}
              </label>
              <select
                value={categoryHint}
                onChange={(e) => setCategoryHint(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none bg-white focus:border-[#165D51]"
              >
                <option value="agriculture">कृषि (Agriculture)</option>
                <option value="education_scholarships">शिक्षा (Education & Scholarships)</option>
                <option value="healthcare">स्वास्थ्य (Healthcare)</option>
                <option value="women_child">महिला व बाल (Women & Child)</option>
                <option value="skills_employment">कौशल व रोजगार (Skills & Employment)</option>
                <option value="business_msme_loans">व्यवसाय (MSME Loans)</option>
                <option value="housing_urban">आवास (Housing)</option>
                <option value="social_security_pensions">पेंशन (Social Security)</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToCatalog}
                  onChange={(e) => setSaveToCatalog(e.target.checked)}
                  className="rounded border-gray-300 text-[#165D51] focus:ring-[#165D51] w-4 h-4"
                />
                <span className="text-xs font-semibold text-gray-700">
                  {isHindi ? "कैटलॉग में सुरक्षित करें" : "Save to Active Catalog"}
                </span>
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              {isHindi ? "बंद करें" : "Close"}
            </button>

            <button
              type="button"
              onClick={handleIngest}
              disabled={isIngesting || !rawText.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#165D51] hover:bg-[#114E43] text-white text-xs font-bold shadow-xs flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isHindi ? "पार्सिंग और सत्यापन..." : "Parsing & Validating..."}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>{isHindi ? "पार्स व नियम बनाएं" : "Ingest & Compile Rules"}</span>
                </>
              )}
            </button>
          </div>

          {/* Extracted Preview */}
          {result && result.parsed_scheme && (
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-gray-900">
                    {isHindi ? "सफल रूपांतरण परिणाम" : "Ingestion & Schema Verification Passed"}
                  </span>
                </div>
                <span className="text-xs font-mono bg-emerald-50 text-[#165D51] px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
                  {result.rules_count} Rules Extracted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                <div>
                  <span className="text-gray-500 block">{isHindi ? "योजना का नाम:" : "Scheme Name:"}</span>
                  <span className="font-bold text-gray-900">{result.parsed_scheme.name_en}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{isHindi ? "लाभ राशि:" : "Benefit Amount:"}</span>
                  <span className="font-bold text-emerald-700">{result.parsed_scheme.benefit_amount_text}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{isHindi ? "श्रेणी:" : "Category:"}</span>
                  <span className="font-semibold text-gray-800">{result.parsed_scheme.category}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{isHindi ? "प्रसंस्करण समय:" : "Processing Time:"}</span>
                  <span className="font-semibold text-gray-800">{result.parsed_scheme.processing_time_en}</span>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700">
                  {isHindi ? "उत्पन्न किए गए नियतात्मक नियम (Executable Rules):" : "Generated Deterministic Rules:"}
                </span>
                <div className="space-y-1.5">
                  {result.parsed_scheme.rules.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="text-blue-800 font-bold">
                        {r.field} {r.operator} {JSON.stringify(r.value)}
                      </span>
                      <span className="text-[11px] text-gray-500 font-sans">{r.description_en}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
