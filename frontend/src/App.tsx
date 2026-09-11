import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

const MainContent: React.FC = () => {
  const { language } = useApp();
  const [currentView, setCurrentView] = useState("home");
  const isHindi = language === "hi";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-10 max-w-5xl">
        {/* Welcome Showcase Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 sm:p-12 mb-10 text-center sm:text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHindi ? "डिजिटल भारत • 100% प्रत्यक्ष लाभ" : "Digital Bharat • 100% Direct Benefits"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {isHindi
                ? "सरकारी योजनाओं की सही जानकारी और सीधी पात्रता"
                : "Know what you qualify for. Know why. Know what to do next."}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-3 leading-relaxed">
              {isHindi
                ? "बिना किसी बिचौलिए या दलाल के, 15+ प्रमुख सरकारी योजनाओं में अपनी सटीक पात्रता 2 मिनट में जांचें।"
                : "Discover central and state government welfare schemes tailored to your profile with 100% deterministic precision."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-md font-medium"
                onClick={() => setCurrentView("wizard")}
              >
                <span>{isHindi ? "अपनी पात्रता जांचें (2 मिनट)" : "Check Your Eligibility (2 min)"}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentView("schemes")}
              >
                {isHindi ? "सभी योजनाएं देखें" : "Explore All Schemes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Core Design Primitives Demonstration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Card 1: Eligibility Engine Status */}
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

          {/* Card 2: AI Understanding Layer */}
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

        {/* Interactive FAQ Section using Accordion */}
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
            <AccordionItem value="item-3">
              <AccordionTrigger>
                {isHindi
                  ? "पात्र होने के बाद मुझे क्या करना होगा?"
                  : "What do I do after finding out I qualify?"}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {isHindi
                  ? "प्रत्येक योजना के साथ आवश्यक दस्तावेजों की चेकलिस्ट और संबंधित सरकारी मंत्रालय के आधिकारिक पोर्टल का सीधा लिंक उपलब्ध है।"
                  : "Each scheme detail page provides a step-by-step checklist of required documents and direct links to verified official government portals."}
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
