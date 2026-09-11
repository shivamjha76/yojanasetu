import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { DocumentChecklist } from "@/components/schemes/DocumentChecklist";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Sparkles, ShieldCheck, HelpCircle } from "lucide-react";
import { Scheme } from "@/types/schema";

// Sample scheme for preview
const SAMPLE_SCHEME: Scheme = {
  id: "pm-kisan",
  name_hi: "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
  name_en: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
  short_summary_hi: "देश के सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष की सीधी आर्थिक सहायता।",
  short_summary_en: "Direct income support of ₹6,000 per year in 3 equal installments to landholding farmer families.",
  detailed_description_hi: "पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता DBT के माध्यम से सीधे बैंक खाते में।",
  detailed_description_en: "PM-KISAN is a Central Sector Scheme providing financial assistance of ₹6,000 per year.",
  ministry: "Ministry of Agriculture & Farmers Welfare",
  level: "central",
  applicable_state: null,
  category: "agriculture",
  benefit_amount_text: "₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तें)",
  benefit_type: "direct_benefit_transfer",
  official_portal_url: "https://pmkisan.gov.in/",
  rules: [],
  documents: [
    {
      id: "aadhaar",
      name_hi: "आधार कार्ड (बैंक खाते से लिंक)",
      name_en: "Aadhaar Card (Linked with Bank)",
      is_mandatory: true,
      issuing_authority: "UIDAI",
      how_to_get_url: "https://myaadhaar.uidai.gov.in/",
    },
    {
      id: "land_record",
      name_hi: "जमीन के कागजात (खसरा/खतौनी)",
      name_en: "Land Ownership Record (Khatauni)",
      is_mandatory: true,
      issuing_authority: "राज्य राजस्व विभाग (State Revenue Dept)",
      how_to_get_url: "https://bhulekh.gov.in/",
    },
    {
      id: "bank_passbook",
      name_hi: "बैंक खाता पासबुक",
      name_en: "Bank Account Passbook",
      is_mandatory: true,
      issuing_authority: "Nationalized / Commercial Bank",
    },
  ],
  application_steps_hi: ["पोर्टल पर जाएं", "ई-केवाईसी करें"],
  application_steps_en: ["Visit portal", "Complete eKYC"],
  faqs: [],
};

const MainContent: React.FC = () => {
  const { language, setIsAssistantOpen } = useApp();
  const [currentView, setCurrentView] = useState("home");
  const isHindi = language === "hi";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      {/* Hero Section (Step 33) */}
      <HeroSection
        onStartWizard={() => setCurrentView("wizard")}
        onExploreSchemes={() => setCurrentView("schemes")}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-10 max-w-6xl">
        {/* Step 31 & 32 Showcase Grid */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-xl">🌟</span>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isHindi ? "योजना पूर्वावलोकन एवं दस्तावेज चेकलिस्ट" : "Scheme Card & Document Checklist UI"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isHindi ? "पुन: प्रयोज्य UI घटक (Step 31 & Step 32)" : "Reusable UI primitives preview"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step 31: SchemeCard Component */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {isHindi ? "योजना कार्ड (SchemeCard Component)" : "SchemeCard Component"}
              </div>
              <SchemeCard
                scheme={SAMPLE_SCHEME}
                matchPercentage={100}
                isEligible={true}
                onViewDetails={(id) => alert(`View details clicked for: ${id}`)}
              />
            </div>

            {/* Step 32: DocumentChecklist Component */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {isHindi ? "दस्तावेज चेकलिस्ट (DocumentChecklist Component)" : "DocumentChecklist Component"}
              </div>
              <DocumentChecklist
                documents={SAMPLE_SCHEME.documents}
                initialCheckedState={{ aadhaar: true }}
              />
            </div>
          </div>
        </div>

        {/* Core Architecture Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="card-interactive">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>{isHindi ? "सटीक पात्रता नियम इंजन" : "Deterministic Rule Engine"}</span>
                </CardTitle>
                <Badge variant="success">100% Verified</Badge>
              </div>
              <CardDescription>
                {isHindi ? "शून्य भ्रम (Zero Hallucination) आधारित गणना" : "Mathematical evaluation with zero hallucination"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-muted-foreground">{isHindi ? "सत्यापित योजनाएं" : "Verified Schemes Loaded"}</span>
                  <span className="text-primary font-bold">15 / 15 (100%)</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                {isHindi
                  ? "कृषि, शिक्षा, स्वास्थ्य, आवास, स्वरोजगार और सामाजिक सुरक्षा की 15 फ्लैगशिप योजनाएं डेटासेट में लोड हैं।"
                  : "Flagship schemes covering Agriculture, Health, Education, MSME loans, and Pensions are verified."}
              </p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span>{isHindi ? "सेतु सहायक (AI Assistant)" : "Setu Sahayak AI"}</span>
                </CardTitle>
                <Badge variant="info">Phase 4 Active</Badge>
              </div>
              <CardDescription>
                {isHindi ? "नागरिक की भाषा समझने के लिए AI का उपयोग" : "Conversational understanding across Hindi & Hinglish"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">हिंदी (Devanagari)</Badge>
                <Badge variant="secondary">Hinglish</Badge>
                <Badge variant="secondary">Voice Mic Input</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isHindi
                  ? "नागरिक की बोलचाल की भाषा से आयु, व्यवसाय, राज्य और आय को सुरक्षित तरीके से निकालता है।"
                  : "Extracts age, state, occupation, and income from conversational statements with high fidelity."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive FAQ Section */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center space-x-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">
              {isHindi ? "अक्सर पूछे जाने वाले प्रश्न (FAQ)" : "Frequently Asked Questions"}
            </h3>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                {isHindi
                  ? "क्या योजनासेतु पर आवेदन करने के लिए कोई शुल्क है?"
                  : "Is there any fee to check eligibility or apply on YojanaSetu?"}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {isHindi
                  ? "नहीं, योजनासेतु 100% निःशुल्क और स्वतंत्र डिजिटल नागरिक सेवा है। हम किसी भी सेवा के लिए शुल्क नहीं लेते।"
                  : "No, YojanaSetu is 100% free and open for all Indian citizens. We never charge any fee."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                {isHindi
                  ? "क्या मेरी पात्रता का निर्णय AI करता है?"
                  : "Does AI make the eligibility decision?"}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {isHindi
                  ? "कदापि नहीं! योजनासेतु का स्वर्णिम नियम है: 'हम AI का उपयोग नागरिक की भाषा समझने के लिए करते हैं, पात्रता तय करने के लिए नहीं।' पात्रता का निर्णय 100% गणितीय नियमों द्वारा होता है।"
                  : "Absolutely not. Our golden rule is: 'We use AI to understand the citizen, NOT to decide eligibility.' Eligibility is calculated with 100% mathematical precision by our deterministic engine."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
