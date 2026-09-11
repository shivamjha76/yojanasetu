import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DocumentRequirement } from "@/types/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  CheckCircle2,
  Circle,
  ExternalLink,
  ShieldAlert,
  Building,
} from "lucide-react";

interface DocumentChecklistProps {
  documents: DocumentRequirement[];
  initialCheckedState?: Record<string, boolean>;
  onStatusChange?: (documentId: string, isReady: boolean) => void;
  showInteractiveCheckboxes?: boolean;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  documents,
  initialCheckedState = {},
  onStatusChange,
  showInteractiveCheckboxes = true,
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(initialCheckedState);

  const toggleDocument = (id: string) => {
    if (!showInteractiveCheckboxes) return;
    const newState = !checkedMap[id];
    const updated = { ...checkedMap, [id]: newState };
    setCheckedMap(updated);
    if (onStatusChange) {
      onStatusChange(id, newState);
    }
  };

  const totalCount = documents.length;
  const readyCount = documents.filter((d) => checkedMap[d.id]).length;
  const progressPercentage = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5">
      {/* Header & Readiness Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>
              {isHindi ? "आवश्यक दस्तावेज चेकलिस्ट" : "Required Documents Checklist"}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isHindi
              ? "आवेदन करने से पहले जांचें कि आपके पास कौन से कागजात उपलब्ध हैं।"
              : "Verify which documents you have ready before applying."}
          </p>
        </div>

        {/* Readiness Badge */}
        {showInteractiveCheckboxes && (
          <div className="text-left sm:text-right">
            <div className="text-xs font-semibold text-foreground">
              {isHindi
                ? `${totalCount} में से ${readyCount} दस्तावेज तैयार`
                : `${readyCount} of ${totalCount} Ready`}
            </div>
            <div className="w-32 sm:w-40 mt-1.5">
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        )}
      </div>

      {/* Document Items List */}
      <div className="space-y-3">
        {documents.map((doc) => {
          const isReady = checkedMap[doc.id] || false;
          return (
            <div
              key={doc.id}
              onClick={() => toggleDocument(doc.id)}
              className={`p-3.5 rounded-lg border transition-all duration-150 flex items-start justify-between gap-3 ${
                showInteractiveCheckboxes ? "cursor-pointer hover:border-primary/50" : ""
              } ${
                isReady
                  ? "bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800"
                  : "bg-background border-border/80"
              }`}
            >
              {/* Checkbox Icon + Document Names */}
              <div className="flex items-start space-x-3">
                {showInteractiveCheckboxes && (
                  <div className="pt-0.5 shrink-0">
                    {isReady ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-muted-foreground" />
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span
                      className={`text-sm font-semibold ${
                        isReady
                          ? "text-emerald-950 dark:text-emerald-200 line-through opacity-85"
                          : "text-foreground"
                      }`}
                    >
                      {isHindi ? doc.name_hi : doc.name_en}
                    </span>

                    {/* Secondary name in parenthesis */}
                    <span className="text-xs text-muted-foreground">
                      ({isHindi ? doc.name_en : doc.name_hi})
                    </span>

                    {/* Mandatory vs Optional Pill */}
                    {doc.is_mandatory ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                        {isHindi ? "अनिवार्य" : "Mandatory"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {isHindi ? "वैकल्पिक" : "Optional"}
                      </Badge>
                    )}
                  </div>

                  {/* Issuing Authority */}
                  {doc.issuing_authority && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Building className="w-3 h-3 mr-1 text-primary/70 shrink-0" />
                      <span>
                        {isHindi ? "जारीकर्ता प्राधिकरण: " : "Issuing Authority: "}
                        {doc.issuing_authority}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* How to Get Link */}
              {doc.how_to_get_url && (
                <a
                  href={doc.how_to_get_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center text-xs text-primary hover:underline shrink-0 pt-0.5"
                  title={isHindi ? "कागजात कैसे बनवाएं देखें" : "How to get this document"}
                >
                  <span className="hidden md:inline mr-1">
                    {isHindi ? "कैसे बनवाएं" : "How to get"}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* CSC Printing Advice Note */}
      <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
        <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isHindi
            ? "सुझाव: यदि आपके पास कोई दस्तावेज नहीं है, तो अपने नजदीकी कॉमन सर्विस सेंटर (CSC) पर जाएं या ऊपर दिए गए आधिकारिक पोर्टल लिंक से सीधे ऑनलाइन आवेदन करें।"
            : "Tip: If you do not have an income or caste certificate, visit your nearest Common Service Center (CSC) or apply on the official state revenue portal linked above."}
        </p>
      </div>
    </div>
  );
};
