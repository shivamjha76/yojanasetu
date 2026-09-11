import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UploadCloud,
  FileText,
  ExternalLink,
  Building,
  RefreshCw,
  ArrowRight,
  Calendar,
  Wallet,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getLocalizedAuthority } from "@/utils/schemeLocalization";
import { api } from "@/services/api";

export interface DocVerificationState {
  status: "idle" | "uploading" | "verified" | "rejected" | "unclear_image" | "wrong_document";
  fileName?: string;
  fileSize?: string;
  extractedData?: {
    citizen_name?: string | null;
    document_number_masked?: string | null;
    annual_income?: number | null;
    category?: string | null;
    date_of_birth?: string | null;
    state_or_district?: string | null;
    issuing_authority?: string | null;
    valid_until?: string | null;
  };
  title?: string;
  reason?: string;
  suggestion?: string;
}

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme;
  onProceedToApply?: () => void;
  onVerificationComplete?: (allVerified: boolean) => void;
}

export const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  isOpen,
  onClose,
  scheme,
  onProceedToApply,
  onVerificationComplete,
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  // Document states map: documentId -> DocVerificationState
  const [docStates, setDocStates] = useState<Record<string, DocVerificationState>>({});
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const documents = scheme.documents || [];
  const mandatoryDocs = documents.filter((d) => d.is_mandatory);
  const totalMandatory = mandatoryDocs.length;
  const verifiedMandatoryCount = mandatoryDocs.filter(
    (d) => docStates[d.id]?.status === "verified"
  ).length;

  const isAllMandatoryVerified =
    totalMandatory > 0 && verifiedMandatoryCount === totalMandatory;

  const progressPercentage =
    totalMandatory > 0
      ? Math.round((verifiedMandatoryCount / totalMandatory) * 100)
      : 0;

  useEffect(() => {
    if (onVerificationComplete) {
      onVerificationComplete(isAllMandatoryVerified);
    }
  }, [isAllMandatoryVerified, onVerificationComplete]);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (onProceedToApply) {
      onProceedToApply();
    } else if (scheme.official_portal_url) {
      window.open(scheme.official_portal_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleTriggerUpload = (docId: string) => {
    const inputEl = fileInputRefs.current[docId];
    if (inputEl) {
      inputEl.click();
    }
  };

  const processFile = async (docId: string, docName: string, file: File) => {
    // 1. Mark as uploading / scanning
    setDocStates((prev) => ({
      ...prev,
      [docId]: {
        status: "uploading",
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        title: isHindi ? "AI जांच जारी है..." : "AI Verification in Progress...",
        reason: isHindi
          ? "दस्तावेज़ की प्रामाणिकता और पात्रता शर्तों की जांच की जा रही है।"
          : "Scanning document authenticity and cross-referencing criteria.",
      },
    }));

    try {
      // 2. Call backend verification API
      const result = await api.verifyDocument(
        file,
        scheme.id,
        docId,
        docName,
        language
      );

      // 3. Update document state with AI response
      setDocStates((prev) => ({
        ...prev,
        [docId]: {
          status: result.status,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          extractedData: result.extracted_data,
          title: isHindi ? result.title_hi : result.title_en,
          reason: isHindi ? result.reason_hi : result.reason_en,
          suggestion: isHindi ? result.suggestion_hi || undefined : result.suggestion_en || undefined,
        },
      }));
    } catch {
      // Graceful error state
      setDocStates((prev) => ({
        ...prev,
        [docId]: {
          status: "unclear_image",
          fileName: file.name,
          title: isHindi ? "सत्यापन पूरा नहीं हुआ" : "Verification Failed",
          reason: isHindi
            ? "दस्तावेज़ को ठीक से पढ़ा नहीं जा सका। कृपया स्पष्ट फोटो पुनः अपलोड करें।"
            : "Could not clearly read the document. Please re-upload a clearer image.",
          suggestion: isHindi
            ? "सुनिश्चित करें कि फोटो सीधी और स्पष्ट है।"
            : "Ensure the photo is properly focused and well-lit.",
        },
      }));
    }
  };

  const handleFileChange = (
    docId: string,
    docName: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(docId, docName, file);
    }
    e.target.value = "";
  };

  const handleDrop = (
    docId: string,
    docName: string,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setDragOverDocId(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(docId, docName, file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* 1. MODAL HEADER                                          */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0D684E] to-[#148364] text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-300/25 text-emerald-100 border border-emerald-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHindi ? "AI दस्तावेज़ सत्यापन" : "AI Document Verification"}</span>
            </span>
            <span className="text-xs text-emerald-200/90 font-medium truncate max-w-[240px]">
              {isHindi ? scheme.name_hi : scheme.name_en}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isHindi ? "पात्रता एवं दस्तावेज़ जांच" : "Eligibility & Document Check"}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
            {isHindi
              ? "योजना में आवेदन करने से पहले अपने आवश्यक कागजात AI से सत्यापित करें, ताकि फॉर्म रिजेक्ट होने का कोई जोखिम न रहे।"
              : "Verify your required documents with AI before applying to ensure a rejection-free application."}
          </p>
        </div>

        {/* ======================================================== */}
        {/* 2. PROGRESS & READINESS BANNER                           */}
        {/* ======================================================== */}
        <div className="bg-[#EAF7F0] border-b border-[#BFE8CF] px-5 py-3.5 sm:px-6 shrink-0 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0D684E]" />
              <span>
                {isHindi
                  ? `सत्यापन प्रगति: ${totalMandatory} में से ${verifiedMandatoryCount} अनिवार्य दस्तावेज़ तैयार`
                  : `Readiness: ${verifiedMandatoryCount} of ${totalMandatory} Mandatory Docs Verified`}
              </span>
            </div>
            <div className="text-[11px] text-gray-600 mt-0.5">
              {isAllMandatoryVerified
                ? isHindi
                  ? "शानदार! सभी आवश्यक दस्तावेज़ सत्यापित हो चुके हैं।"
                  : "Excellent! All mandatory documents are verified."
                : isHindi
                ? "कृपया नीचे दिए गए प्रत्येक अनिवार्य दस्तावेज़ को अपलोड करें।"
                : "Please upload each required document below for instant AI verification."}
            </div>
          </div>

          <div className="w-24 sm:w-32 shrink-0 text-right">
            <span className="text-xs font-bold text-[#0D684E]">{progressPercentage}%</span>
            <Progress value={progressPercentage} className="h-2 mt-1 bg-emerald-200/60" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. DOCUMENT LISTING (SCROLLABLE BODY)                     */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {/* ======================================================== */}
          {/* 3.1 CELEBRATION BANNER (WHEN ALL MANDATORY VERIFIED)     */}
          {/* ======================================================== */}
          {isAllMandatoryVerified && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0D684E] via-[#137351] to-[#185644] text-white shadow-lg relative overflow-hidden animate-in zoom-in-95 duration-300 border-2 border-emerald-400/40">
              <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none blur-sm" />
              <div className="absolute top-2 right-4 text-emerald-200/30 text-5xl select-none pointer-events-none">🎉</div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white text-[#0D684E] flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-6 h-6 stroke-[2.5] text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-400/25 text-emerald-200 text-xs font-bold border border-emerald-300/30 mb-2">
                    <span>🎉 100% Ready to Apply</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    {isHindi
                      ? "बधाई हो! आपके सभी आवश्यक दस्तावेज़ सत्यापित हो चुके हैं"
                      : "Congratulations! You are 100% Ready to Apply"}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
                    {isHindi
                      ? "आपके सभी प्रमाणपत्र योजना की पात्रता शर्तों के अनुरूप हैं। अब फॉर्म रिजेक्ट होने का कोई जोखिम नहीं है। सीधे आधिकारिक पोर्टल पर आवेदन करें।"
                      : "All submitted credentials meet the official scheme rules. You can now proceed to apply on the official government portal with zero anxiety."}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleProceed}
                      className="py-2.5 px-5 rounded-xl bg-white hover:bg-emerald-50 text-[#0D684E] font-extrabold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span>{isHindi ? "आधिकारिक पोर्टल पर अभी आवेदन करें" : "Apply Now on Official Portal"}</span>
                      <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium">
                {isHindi ? "इस योजना के लिए कोई विशेष दस्तावेज़ सूची उपलब्ध नहीं है।" : "No specific document requirements listed."}
              </p>
            </div>
          ) : (
            documents.map((doc, idx) => {
              const state = docStates[doc.id] || { status: "idle" };
              const isVerified = state.status === "verified";
              const isRejected = state.status === "rejected";
              const isUnclear = state.status === "unclear_image" || state.status === "wrong_document";
              const isUploading = state.status === "uploading";
              const isDragOver = dragOverDocId === doc.id;
              const docTitle = isHindi ? doc.name_hi : doc.name_en;

              return (
                <div
                  key={doc.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDocId(doc.id);
                  }}
                  onDragLeave={() => setDragOverDocId(null)}
                  onDrop={(e) => handleDrop(doc.id, docTitle, e)}
                  className={`p-4 rounded-2xl border transition-all duration-200 relative ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-50/70 scale-[1.01]"
                      : isVerified
                      ? "bg-[#EAF7F0]/70 border-emerald-300 shadow-2xs"
                      : isRejected
                      ? "bg-rose-50/80 border-rose-300 shadow-2xs"
                      : isUnclear
                      ? "bg-amber-50/80 border-amber-300 shadow-2xs"
                      : isUploading
                      ? "bg-blue-50/70 border-blue-300"
                      : "bg-white border-gray-200 hover:border-gray-300 shadow-2xs"
                  }`}
                >
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[doc.id] = el;
                    }}
                    onChange={(e) => handleFileChange(doc.id, docTitle, e)}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                  />

                  <div className="flex items-start justify-between gap-3">
                    {/* Status Icon */}
                    <div className="pt-0.5 shrink-0">
                      {isVerified ? (
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      ) : isRejected ? (
                        <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                          <XCircle className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      ) : isUnclear ? (
                        <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                          <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      ) : isUploading ? (
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs animate-spin">
                          <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border border-gray-200 font-bold text-xs">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Document Meta Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-sm sm:text-base text-gray-900">
                          {isHindi ? doc.name_hi : doc.name_en}
                        </span>
                        {isHindi && doc.name_en && (
                          <span className="text-xs text-gray-500">
                            ({doc.name_en})
                          </span>
                        )}

                        {/* Mandatory vs Optional Badge */}
                        {doc.is_mandatory ? (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            {isHindi ? "अनिवार्य" : "Mandatory"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {isHindi ? "वैकल्पिक" : "Optional"}
                          </span>
                        )}
                      </div>

                      {/* Issuing Authority / Guidance */}
                      {doc.issuing_authority && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Building className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                          <span>
                            {isHindi ? "जारीकर्ता: " : "Authority: "}
                            {getLocalizedAuthority(doc.issuing_authority, isHindi)}
                          </span>
                        </div>
                      )}

                      {/* Scanning Animation State */}
                      {isUploading && (
                        <div className="mt-3 p-3 rounded-xl bg-blue-100/70 border border-blue-200 text-xs text-blue-900 flex items-center space-x-2 animate-pulse">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-700 shrink-0" />
                          <div className="font-semibold">
                            {isHindi
                              ? `AI "${state.fileName || docTitle}" का सत्यापन कर रहा है...`
                              : `AI is verifying "${state.fileName || docTitle}"...`}
                          </div>
                        </div>
                      )}

                      {/* Verified Result Details */}
                      {isVerified && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 rounded-xl bg-emerald-100/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span>{state.title || (isHindi ? "दस्तावेज़ सत्यापित" : "Document Verified")}</span>
                            </div>
                            <p className="leading-relaxed text-emerald-800">
                              {state.reason || (isHindi ? "सभी आवश्यक विवरण योजना के नियमों के अनुकूल पाए गए हैं।" : "Details match the scheme requirements.")}
                            </p>

                            {/* Extracted Details Pill Chips */}
                            {state.extractedData && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {state.extractedData.document_number_masked && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-[11px] font-mono font-medium text-gray-700 border border-emerald-200">
                                    <UserCheck className="w-3 h-3 text-emerald-600" />
                                    <span>{state.extractedData.document_number_masked}</span>
                                  </span>
                                )}
                                {state.extractedData.annual_income != null && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-[11px] font-semibold text-gray-800 border border-emerald-200">
                                    <Wallet className="w-3 h-3 text-emerald-600" />
                                    <span>
                                      {isHindi ? "आय: " : "Income: "}
                                      ₹{state.extractedData.annual_income.toLocaleString("en-IN")}
                                    </span>
                                  </span>
                                )}
                                {state.extractedData.valid_until && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-[11px] font-medium text-gray-700 border border-emerald-200">
                                    <Calendar className="w-3 h-3 text-emerald-600" />
                                    <span>
                                      {isHindi ? "वैध: " : "Valid: "}
                                      {state.extractedData.valid_until}
                                    </span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ineligible / Rejected Result Details */}
                      {isRejected && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-100/90 border border-rose-200 text-xs text-rose-950 space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-rose-900">
                            <XCircle className="w-4 h-4 text-rose-700" />
                            <span>{state.title || (isHindi ? "पात्रता मापदंड पूरा नहीं हुआ" : "Eligibility Criteria Not Met")}</span>
                          </div>
                          <p className="leading-relaxed text-rose-800 font-medium">
                            {state.reason || (isHindi ? "इस दस्तावेज़ के अनुसार आप योजना की पात्रता पूरी नहीं करते।" : "According to this document, you do not meet scheme criteria.")}
                          </p>
                          {state.suggestion && (
                            <p className="text-[11px] text-rose-700 pt-0.5 border-t border-rose-200">
                              💡 {state.suggestion}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Unclear Photo / Wrong Doc Result Details */}
                      {isUnclear && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-100/90 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-700" />
                            <span>{state.title || (isHindi ? "छवि अस्पष्ट है" : "Image Unclear")}</span>
                          </div>
                          <p className="leading-relaxed text-amber-800 font-medium">
                            {state.reason}
                          </p>
                          {state.suggestion && (
                            <p className="text-[11px] text-amber-700 pt-0.5 border-t border-amber-200">
                              💡 {state.suggestion}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Upload / Verification Action Area */}
                      <div className="mt-3.5 flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => handleTriggerUpload(doc.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isVerified
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : isRejected || isUnclear
                              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                              : isUploading
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-[#0D684E] hover:bg-[#094D3A] text-white shadow-xs hover:scale-[1.01]"
                          }`}
                        >
                          {isVerified ? (
                            <RotateCcw className="w-3.5 h-3.5" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isVerified
                              ? isHindi ? "पुनः अपलोड करें" : "Re-upload"
                              : isRejected
                              ? isHindi ? "दूसरा दस्तावेज़ अपलोड करें" : "Upload Another"
                              : isUnclear
                              ? isHindi ? "साफ फोटो दोबारा अपलोड करें" : "Retry with Clear Photo"
                              : isHindi ? "अपलोड एवं AI जांच" : "Upload & Verify"}
                          </span>
                        </button>

                        <span className="text-[11px] text-gray-400 hidden sm:inline">
                          {isHindi ? "PDF या JPEG/PNG समर्थित" : "PDF or JPEG/PNG supported"}
                        </span>

                        {/* How to get link */}
                        {doc.how_to_get_url && (
                          <a
                            href={doc.how_to_get_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:underline font-medium ml-auto"
                          >
                            <span>{isHindi ? "कैसे बनवाएं?" : "How to get?"}</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. MODAL FOOTER                                          */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {isHindi
              ? "सभी दस्तावेज डिवाइस में स्थानीय रूप से सुरक्षित और गोपनीय रहते हैं।"
              : "Documents are processed securely with state-of-the-art privacy standards."}
          </div>

          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
            >
              {isHindi ? "बंद करें" : "Close"}
            </button>

            <button
              type="button"
              onClick={handleProceed}
              className={`py-2.5 px-5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer ${
                isAllMandatoryVerified
                  ? "bg-[#0D684E] hover:bg-[#094D3A] text-white hover:scale-[1.02] ring-2 ring-emerald-500/30"
                  : "bg-gray-900 hover:bg-black text-white hover:scale-[1.01]"
              }`}
            >
              <span>{isHindi ? "सीधे पोर्टल पर जाएं" : "Go to Official Portal"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationModal;
