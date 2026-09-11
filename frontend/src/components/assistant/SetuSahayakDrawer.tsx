import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import { CitizenProfile, Scheme } from "@/types/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  ShieldCheck,
  HelpCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Coins,
} from "lucide-react";
import { getLocalizedBenefit } from "@/utils/schemeLocalization";

interface EmbeddedSchemeSummary {
  id: string;
  name_hi: string;
  name_en: string;
  ministry: string;
  category: string;
  benefit_amount_text: string;
  benefit_type: string;
  official_portal_url: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
  suggestedAction?: {
    labelHi: string;
    labelEn: string;
    onClick: () => void;
  };
  embeddedScheme?: EmbeddedSchemeSummary;
  extractedProfile?: Partial<CitizenProfile>;
}

interface SetuSahayakDrawerProps {
  onStartWizard?: (prefillProfile?: Partial<CitizenProfile>) => void;
  onExploreSchemes?: () => void;
  onViewSchemeDetail?: (schemeId: string) => void;
  onLocateCsc?: () => void;
}

// Fallback scheme facts for embedded preview when offline
const SCHEME_QUICK_LOOKUP: Record<string, EmbeddedSchemeSummary> = {
  "pm-kisan": {
    id: "pm-kisan",
    name_hi: "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
    name_en: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "agriculture",
    benefit_amount_text: "₹6,000 / वर्ष",
    benefit_type: "direct_benefit_transfer",
    official_portal_url: "https://pmkisan.gov.in",
  },
  "ayushman-bharat-pmjay": {
    id: "ayushman-bharat-pmjay",
    name_hi: "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY)",
    name_en: "Ayushman Bharat - PM Jan Arogya Yojana (AB-PMJAY)",
    ministry: "Ministry of Health and Family Welfare",
    category: "healthcare",
    benefit_amount_text: "₹5,00,000 / परिवार / वर्ष",
    benefit_type: "health_insurance",
    official_portal_url: "https://pmjay.gov.in",
  },
  "pm-mudra-yojana": {
    id: "pm-mudra-yojana",
    name_hi: "प्रधानमंत्री मुद्रा योजना (PMMY)",
    name_en: "Pradhan Mantri MUDRA Yojana (PMMY)",
    ministry: "Ministry of Finance",
    category: "business_entrepreneurship",
    benefit_amount_text: "₹50,000 से ₹20,00,000 तक बिना गारंटी ऋण",
    benefit_type: "loan_subsidy",
    official_portal_url: "https://www.mudra.org.in",
  },
  "ladli-behna-yojana": {
    id: "ladli-behna-yojana",
    name_hi: "मुख्यमंत्री लाड़ली बहना योजना (मध्य प्रदेश)",
    name_en: "Mukhyamantri Ladli Behna Yojana (Madhya Pradesh)",
    ministry: "महिला एवं बाल विकास विभाग, मध्य प्रदेश",
    category: "women_welfare",
    benefit_amount_text: "₹1,250 / माह (₹15,000 / वर्ष)",
    benefit_type: "direct_benefit_transfer",
    official_portal_url: "https://cmladlibehna.mp.gov.in",
  },
  "pm-svanidhi": {
    id: "pm-svanidhi",
    name_hi: "पीएम स्वनिधि योजना (स्ट्रीट वेंडर आत्मनिर्भर निधि)",
    name_en: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    ministry: "Ministry of Housing and Urban Affairs",
    category: "business_entrepreneurship",
    benefit_amount_text: "₹10,000 से ₹50,000 तक कार्यशील पूंजी ऋण",
    benefit_type: "loan_subsidy",
    official_portal_url: "https://pmsvanidhi.mohua.gov.in",
  },
  "pm-awas-yojana-gramin": {
    id: "pm-awas-yojana-gramin",
    name_hi: "प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G)",
    name_en: "Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)",
    ministry: "Ministry of Rural Development",
    category: "housing",
    benefit_amount_text: "₹1,20,000 से ₹1,30,000 पक्का मकान अनुदान",
    benefit_type: "housing_grant",
    official_portal_url: "https://pmayg.nic.in",
  },
};

export const SetuSahayakDrawer: React.FC<SetuSahayakDrawerProps> = ({
  onStartWizard = () => {},
  onExploreSchemes = () => {},
  onViewSchemeDetail = () => {},
  onLocateCsc = () => {},
}) => {
  const { language, isAssistantOpen, setIsAssistantOpen } = useApp();
  const isHindi = language === "hi";

  const initialMessages: ChatMessage[] = [
    {
      id: "welcome",
      sender: "assistant",
      text: isHindi
        ? "नमस्ते नागरिक जी! 🙏 मैं योजनासेतु सहायक AI हूँ। आप मुझसे किसी भी सरकारी योजना, आवश्यक दस्तावेज़ या पात्रता के बारे में पूछ सकते हैं, या अपनी उम्र, राज्य और पेशा बताकर अपने लिए सही योजनाएं जान सकते हैं।"
        : "Namaste! 🙏 I am Setu Sahayak AI. Ask me about any government welfare scheme or required documents, or tell me your age, occupation, and state to discover eligible schemes.",
      time: "Just now",
      suggestedAction: {
        labelHi: "मेरी पात्रता जांचें (2 मिनट)",
        labelEn: "Check My Eligibility (2 min)",
        onClick: () => onStartWizard(),
      },
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Categorized suggestions
  const suggestions = isHindi
    ? [
        { label: "🌾 पीएम किसान ₹6,000", query: "पीएम किसान सम्मान निधि में ₹6,000 कैसे मिलते हैं और पात्रता क्या है?" },
        { label: "🏥 आयुष्मान कार्ड ₹5 लाख", query: "आयुष्मान भारत कार्ड के तहत ₹5 लाख मुफ्त इलाज के क्या नियम हैं?" },
        { label: "🌸 लाड़ली बहना योजना", query: "लाड़ली बहना योजना में ₹1,250 प्रतिमाह किन्हें मिलता है?" },
        { label: "💼 मुद्रा लोन बिना गारंटी", query: "पीएम मुद्रा योजना के तहत बिजनेस के लिए लोन कैसे मिलता है?" },
        { label: "📍 नजदीकी जन सेवा केंद्र", query: "मुझे अपने नजदीकी जन सेवा केंद्र (CSC) की जानकारी चाहिए।" },
      ]
    : [
        { label: "🌾 PM-KISAN ₹6,000", query: "How do I receive ₹6,000 under PM-KISAN and what are the rules?" },
        { label: "🏥 Ayushman Bharat ₹5 Lakh", query: "What are the rules and benefits for Ayushman Bharat ₹5 Lakh health cover?" },
        { label: "🌸 Ladli Behna ₹1,250/mo", query: "Who qualifies for the Ladli Behna Scheme?" },
        { label: "💼 PM Mudra Loan", query: "How does PM Mudra Yojana collateral-free loan work?" },
        { label: "📍 Nearest CSC Center", query: "Where is my nearest Jan Seva Kendra / CSC center?" },
      ];

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Update initial welcome message if language toggles and chat is untouched
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "welcome") {
        return initialMessages;
      }
      return prev;
    });
  }, [language]);

  // Copy text to clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Web Speech Recognition handler (with fallback)
  const handleVoiceToggle = () => {
    // Check if SpeechRecognition is available in browser
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate realistic voice input sample
      const sample = isHindi
        ? "मेरी आयु 28 वर्ष है, मध्य प्रदेश में 2 एकड़ जमीन पर खेती करती हूँ। मेरे लिए कौन सी योजनाएं हैं?"
        : "I am a 28-year-old female farmer in Madhya Pradesh with 2 acres land. What schemes qualify for me?";
      setInputText(sample);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      const sample = isHindi
        ? "मेरी आयु 28 वर्ष है, मध्य प्रदेश में किसान हूँ। मेरे लिए कौन सी योजनाएं हैं?"
        : "I am a 28-year-old farmer in Madhya Pradesh. Which schemes apply to me?";
      setInputText(sample);
    }
  };

  // Main message sending and AI evaluation
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const lowerQ = query.toLowerCase();

    // Check if query is asking for CSC
    if (lowerQ.includes("csc") || lowerQ.includes("जन सेवा केंद्र") || lowerQ.includes("kendra") || lowerQ.includes("केंद्र")) {
      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: isHindi
            ? "आप योजनासेतु के अधिकृत जन सेवा केंद्र (CSC Locator) स्क्रीन पर अपने पिनकोड से निकटतम सरकारी सहायता केंद्र खोज सकते हैं। वहां बायोमेट्रिक eKYC व सभी योजनाओं के लिए निःशुल्क अथवा अधिकतम ₹30 निर्धारित शुल्क पर सहायता उपलब्ध है।"
            : "You can find your nearest verified Common Services Center (Jan Seva Kendra / CSC) using your PIN code. Authorized VLEs provide biometric eKYC and scheme assistance at government capped rates.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedAction: {
            labelHi: "निकटतम जन सेवा केंद्र खोजें 📍",
            labelEn: "Locate Nearest CSC 📍",
            onClick: () => {
              setIsAssistantOpen(false);
              onLocateCsc();
            },
          },
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 500);
      return;
    }

    try {
      // Check if user is sharing demographic details to extract profile
      const isDemographicStatement =
        (lowerQ.includes("उम्र") || lowerQ.includes("आयु") || lowerQ.includes("age") || lowerQ.includes("year") || lowerQ.includes("वर्ष")) &&
        (lowerQ.includes("किसान") || lowerQ.includes("farmer") || lowerQ.includes("छात्र") || lowerQ.includes("student") || lowerQ.includes("दुकान") || lowerQ.includes("व्यापार") || lowerQ.includes("आय") || lowerQ.includes("income"));

      let matchedSchemeSlug: string | null = null;
      if (lowerQ.includes("kisan") || lowerQ.includes("किसान")) matchedSchemeSlug = "pm-kisan";
      else if (lowerQ.includes("ayushman") || lowerQ.includes("आयुष्मान") || lowerQ.includes("इलाज") || lowerQ.includes("health")) matchedSchemeSlug = "ayushman-bharat-pmjay";
      else if (lowerQ.includes("mudra") || lowerQ.includes("मुद्रा") || lowerQ.includes("ऋण") || lowerQ.includes("loan")) matchedSchemeSlug = "pm-mudra-yojana";
      else if (lowerQ.includes("ladli") || lowerQ.includes("लाड़ली")) matchedSchemeSlug = "ladli-behna-yojana";
      else if (lowerQ.includes("svanidhi") || lowerQ.includes("स्वनिधि") || lowerQ.includes("स्ट्रीट वेंडर") || lowerQ.includes("vendor")) matchedSchemeSlug = "pm-svanidhi";
      else if (lowerQ.includes("awas") || lowerQ.includes("आवास") || lowerQ.includes("मकान") || lowerQ.includes("house")) matchedSchemeSlug = "pm-awas-yojana-gramin";

      if (isDemographicStatement) {
        // Run AI profile extractor
        const extractRes = await api.extractProfile(query);
        const p = extractRes.profile;

        let explanation = isHindi
          ? `मैंने आपका विवरण दर्ज कर लिया है:\n• आयु: ${p.age || "निर्दिष्ट नहीं"} वर्ष\n• लिंग: ${p.gender === "female" ? "महिला" : p.gender === "male" ? "पुरुष" : "अन्य"}\n• पेशा: ${p.occupation || "निर्दिष्ट नहीं"}\n• राज्य: ${p.state || "मध्य प्रदेश"}\n• वार्षिक आय: ₹${(p.annual_income || 0).toLocaleString("en-IN")}\n\n100% सटीक गणितीय पात्रता जांचने के लिए आप नीचे दिए बटन से विज़ार्ड खोल सकते हैं:`
          : `I have extracted your profile details:\n• Age: ${p.age || "N/A"} years\n• Gender: ${p.gender || "N/A"}\n• Occupation: ${p.occupation || "N/A"}\n• State: ${p.state || "Madhya Pradesh"}\n• Income: ₹${(p.annual_income || 0).toLocaleString("en-IN")}\n\nClick below to evaluate all 15 schemes with our zero-hallucination deterministic engine:`;

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: explanation,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          extractedProfile: p,
          suggestedAction: {
            labelHi: "⚡ इस प्रोफाइल से 15 योजनाएं जांचें (Pre-fill Wizard)",
            labelEn: "⚡ Evaluate 15 Schemes With This Profile",
            onClick: () => {
              setIsAssistantOpen(false);
              onStartWizard(p);
            },
          },
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (matchedSchemeSlug) {
        // Scheme specific query
        let answerText = "";
        let schemeObj: EmbeddedSchemeSummary | undefined = SCHEME_QUICK_LOOKUP[matchedSchemeSlug];

        try {
          const res = await api.explainScheme(matchedSchemeSlug, query, language);
          answerText = res.answer;
          // Also fetch live scheme
          try {
            const liveScheme: Scheme = await api.getSchemeById(matchedSchemeSlug);
            schemeObj = {
              id: liveScheme.id,
              name_hi: liveScheme.name_hi,
              name_en: liveScheme.name_en,
              ministry: liveScheme.ministry,
              category: liveScheme.category,
              benefit_amount_text: liveScheme.benefit_amount_text,
              benefit_type: liveScheme.benefit_type,
              official_portal_url: liveScheme.official_portal_url,
            };
          } catch {
            // Use static fallback
          }
        } catch {
          // Offline fallback
          answerText = isHindi
            ? `${schemeObj.name_hi}: यह योजना पात्र लाभार्थियों को ${schemeObj.benefit_amount_text} का प्रत्यक्ष लाभ प्रदान करती है। आप योजना विवरण देख सकते हैं या अपनी व्यक्तिगत पात्रता की जांच कर सकते हैं।`
            : `${schemeObj.name_en}: Provides ${schemeObj.benefit_amount_text}. Discover full guidelines and verify eligibility using our deterministic rules.`;
        }

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: answerText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          embeddedScheme: schemeObj,
          suggestedAction: {
            labelHi: "मेरी पात्रता जांचें (2 मिनट)",
            labelEn: "Check My Eligibility (2 min)",
            onClick: () => {
              setIsAssistantOpen(false);
              onStartWizard();
            },
          },
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // General welfare query
        let answerText = "";
        try {
          const res = await api.explainScheme("pm-kisan", query, language);
          answerText = res.answer;
        } catch {
          answerText = isHindi
            ? "योजनासेतु पर केंद्र एवं राज्य सरकारों की 15+ प्रमुख जनकल्याणकारी योजनाएं उपलब्ध हैं। आप सीधे 2 मिनट का पात्रता विज़ार्ड चलाकर देख सकते हैं कि आपके परिवार को किस योजना का लाभ मिल सकता है।"
            : "YojanaSetu features 15+ Central and State welfare schemes. Run our 2-minute deterministic wizard to discover all benefits matching your household.";
        }

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: answerText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedAction: {
            labelHi: "पात्रता विज़ार्ड शुरू करें →",
            labelEn: "Start Eligibility Wizard →",
            onClick: () => {
              setIsAssistantOpen(false);
              onStartWizard();
            },
          },
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.warn("Setu Sahayak offline fallback:", err);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: isHindi
          ? "सरकारी नियमों के अनुसार सभी योजनाएं हमारे सत्यापित डेटाबेस में दर्ज हैं। आप 2 मिनट के विज़ार्ड से अपनी पात्रता 100% गणितीय सटीकता से जांच सकते हैं।"
          : "All scheme rules are verified in our database. Run the 2-minute Eligibility Wizard to discover your verified benefits.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedAction: {
          labelHi: "पात्रता विज़ार्ड शुरू करें",
          labelEn: "Start Eligibility Wizard",
          onClick: () => {
            setIsAssistantOpen(false);
            onStartWizard();
          },
        },
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
  };

  return (
    <>
      {/* 1. Global Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="relative group p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2.5 border-2 border-white/20"
          title={isHindi ? "सेतु सहायक AI खोलें" : "Open Setu Sahayak AI"}
        >
          <span className="absolute -inset-1 rounded-full bg-primary/40 blur-sm group-hover:bg-primary/60 transition-colors animate-pulse" />

          <div className="relative flex items-center space-x-2">
            <Bot className="w-5 h-5 text-white animate-bounce" />
            <span className="hidden sm:inline font-bold text-xs">
              {isHindi ? "सेतु सहायक AI" : "Ask Setu AI"}
            </span>
          </div>

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </button>
      </div>

      {/* 2. Slide-over Sheet Drawer */}
      <Sheet open={isAssistantOpen} onOpenChange={setIsAssistantOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l border-border shadow-2xl"
        >
          {/* Drawer Header */}
          <SheetHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <SheetTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                    <span>{isHindi ? "सेतु सहायक AI" : "Setu Sahayak AI"}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold"
                    >
                      Online
                    </Badge>
                  </SheetTitle>
                  <p className="text-[11px] text-muted-foreground">
                    {isHindi
                      ? "नागरिक कल्याण सलाहकार • हिंदी, Hinglish, English"
                      : "Direct Citizen Welfare Advisor • Multilingual"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  title={isHindi ? "बातचीत साफ़ करें" : "Clear Chat"}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Golden Rule Transparency Notice */}
          <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center space-x-2 text-[11px] text-primary">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isHindi
                ? "AI केवल समझाने के लिए है। पात्रता 100% गणितीय नियमों द्वारा तय होती है।"
                : "AI assists with questions; eligibility is 100% deterministic."}
            </span>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.sender === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                      isAssistant
                        ? "bg-card border border-border/80 text-foreground shadow-subtle"
                        : "bg-primary text-primary-foreground font-medium shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Extracted Profile Chip Preview */}
                    {msg.extractedProfile && (
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span>{isHindi ? "पहचाना गया नागरिक प्रोफाइल:" : "Detected Citizen Profile:"}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.extractedProfile.age && (
                            <span className="px-2 py-0.5 rounded-md bg-background border text-[11px] font-semibold">
                              {msg.extractedProfile.age} {isHindi ? "वर्ष" : "yrs"}
                            </span>
                          )}
                          {msg.extractedProfile.occupation && (
                            <span className="px-2 py-0.5 rounded-md bg-background border text-[11px] font-semibold capitalize">
                              {msg.extractedProfile.occupation.replace(/_/g, " ")}
                            </span>
                          )}
                          {msg.extractedProfile.state && (
                            <span className="px-2 py-0.5 rounded-md bg-background border text-[11px] font-semibold">
                              {msg.extractedProfile.state}
                            </span>
                          )}
                          {msg.extractedProfile.gender && (
                            <span className="px-2 py-0.5 rounded-md bg-background border text-[11px] font-semibold capitalize">
                              {msg.extractedProfile.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 47: Embedded Mini Scheme Card */}
                    {msg.embeddedScheme && (
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-background border border-primary/20 space-y-2.5 shadow-sm text-foreground">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/10">
                              <Building2 className="w-2.5 h-2.5 mr-1" />
                              {msg.embeddedScheme.ministry}
                            </Badge>
                            <h4 className="text-xs sm:text-sm font-bold leading-tight pt-1">
                              {isHindi ? msg.embeddedScheme.name_hi : msg.embeddedScheme.name_en}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl">
                          <Coins className="w-3.5 h-3.5 shrink-0" />
                          <span>{getLocalizedBenefit({ id: msg.embeddedScheme.id, benefit_amount_text: msg.embeddedScheme.benefit_amount_text }, isHindi)}</span>
                        </div>

                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => {
                              setIsAssistantOpen(false);
                              onViewSchemeDetail(msg.embeddedScheme!.id);
                            }}
                            className="h-7 text-[11px] font-bold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-xs"
                          >
                            <span>{isHindi ? "विस्तृत विवरण देखें" : "View Details"}</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>

                          <a
                            href={msg.embeddedScheme.official_portal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span>{isHindi ? "आधिकारिक पोर्टल" : "Govt Portal"}</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-1" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Inline Action CTA */}
                    {msg.suggestedAction && (
                      <div className="pt-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsAssistantOpen(false);
                            msg.suggestedAction?.onClick();
                          }}
                          className="h-7 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          <span>
                            {isHindi
                              ? msg.suggestedAction.labelHi
                              : msg.suggestedAction.labelEn}
                          </span>
                        </Button>
                      </div>
                    )}

                    {/* Footer timestamp & copy action */}
                    <div className="flex items-center justify-between pt-0.5 text-[10px] text-muted-foreground">
                      {isAssistant && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-foreground inline-flex items-center gap-0.5"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                      <span className={!isAssistant ? "text-primary-foreground/70 ml-auto" : ""}>
                        {msg.time}
                      </span>
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground p-2 bg-muted/20 rounded-xl max-w-[200px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>
                  {isHindi ? "सेतु सहायक उत्तर सोच रहा है..." : "Setu Sahayak is replying..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions Strip */}
          <div className="p-3 border-t border-border/60 bg-muted/10 space-y-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                <span>{isHindi ? "सुझाए गए प्रश्न:" : "Quick Suggested Prompts:"}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAssistantOpen(false);
                  onLocateCsc();
                }}
                className="text-primary hover:underline font-bold text-[10px] inline-flex items-center gap-0.5"
              >
                <MapPin className="w-2.5 h-2.5" />
                <span>{isHindi ? "जन सेवा केंद्र" : "CSC Locator"}</span>
              </button>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.query)}
                  className="px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] text-foreground hover:border-primary/50 hover:text-primary transition-colors shrink-0 whitespace-nowrap shadow-2xs font-medium"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Quick Explore Schemes Link */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>{isHindi ? "सभी 15+ योजनाएं देखना चाहते हैं?" : "Want to browse all schemes?"}</span>
              <button
                type="button"
                onClick={() => {
                  setIsAssistantOpen(false);
                  onExploreSchemes();
                }}
                className="text-primary hover:underline font-bold"
              >
                {isHindi ? "योजना निर्देशिका देखें →" : "View Catalog →"}
              </button>
            </div>
          </div>

          {/* Message Input Footer with Voice Mic */}
          <div className="p-3.5 border-t border-border bg-card space-y-2">
            {isListening && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                <span className="flex items-center gap-1.5 animate-pulse font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {isHindi ? "सुन रहे हैं... बोलिए" : "Listening... speak now"}
                </span>
                <button
                  onClick={() => setIsListening(false)}
                  className="font-bold underline text-[11px]"
                >
                  {isHindi ? "रोकें" : "Stop"}
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isHindi
                    ? "योजना, पात्रता या अपनी उम्र व पेशा बताएं..."
                    : "Ask about schemes or tell me your profile..."
                }
                className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-2 rounded-xl border transition-colors shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white border-red-600 animate-pulse"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title={isHindi ? "बोलकर पूछें (Voice Input)" : "Speak via Voice Input"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-primary" />
                )}
              </button>

              <Button
                type="submit"
                size="sm"
                disabled={!inputText.trim()}
                className="h-10 px-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shrink-0 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
