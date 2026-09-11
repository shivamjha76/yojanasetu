import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
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
  Bot,
  User,
  ShieldCheck,
  HelpCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

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
}

interface SetuSahayakDrawerProps {
  onStartWizard?: () => void;
  onExploreSchemes?: () => void;
}

export const SetuSahayakDrawer: React.FC<SetuSahayakDrawerProps> = ({
  onStartWizard = () => {},
  onExploreSchemes = () => {},
}) => {
  const { language, isAssistantOpen, setIsAssistantOpen } = useApp();
  const isHindi = language === "hi";

  const initialMessages: ChatMessage[] = [
    {
      id: "welcome",
      sender: "assistant",
      text: isHindi
        ? "नमस्ते नागरिक जी! 🙏 मैं योजनासेतु सहायक AI हूँ। आप मुझसे किसी भी सरकारी योजना, आवश्यक दस्तावेज़ या पात्रता के बारे में हिंदी, English या Hinglish में पूछ सकते हैं।"
        : "Namaste! 🙏 I am Setu Sahayak AI. Ask me anything about government welfare schemes, required documents, or eligibility criteria in Hindi, English, or Hinglish.",
      time: "Just now",
      suggestedAction: {
        labelHi: "मेरी पात्रता जांचें (2 मिनट)",
        labelEn: "Check My Eligibility (2 min)",
        onClick: onStartWizard,
      },
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt suggestions
  const suggestions = isHindi
    ? [
        "पीएम किसान सम्मान निधि में ₹6,000 कैसे मिलते हैं?",
        "आयुष्मान कार्ड ₹5 लाख मुफ्त इलाज के नियम क्या हैं?",
        "लाड़ली बहना योजना के लिए कौन सी महिलाएं पात्र हैं?",
        "पोस्ट-मैट्रिक छात्रवृत्ति के लिए क्या दस्तावेज चाहिए?",
      ]
    : [
        "How do I receive ₹6,000 under PM-KISAN?",
        "What are the rules for Ayushman Bharat ₹5 Lakh cover?",
        "Who is eligible for Ladli Behna Yojana?",
        "Which documents are required for Post-Matric Scholarship?",
      ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

    try {
      // Direct call to scheme explainer endpoint or AI response
      let aiResponseText = "";
      const lowerQ = query.toLowerCase();

      if (lowerQ.includes("kisan") || lowerQ.includes("किसान")) {
        const res = await api.explainScheme("pm-kisan", query, language);
        aiResponseText = res.answer;
      } else if (lowerQ.includes("ayushman") || lowerQ.includes("आयुष्मान") || lowerQ.includes("इलाज")) {
        const res = await api.explainScheme("ayushman-bharat-pmjay", query, language);
        aiResponseText = res.answer;
      } else if (lowerQ.includes("ladli") || lowerQ.includes("लाड़ली")) {
        const res = await api.explainScheme("ladli-behna-yojana", query, language);
        aiResponseText = res.answer;
      } else {
        // General query handled by AI assistant
        const res = await api.explainScheme("pm-kisan", query, language);
        aiResponseText = res.answer;
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn("AI explanation offline fallback:", err);
      // Fallback grounded message
      const fallbackText = isHindi
        ? "सरकारी योजनाओं के नियमों के अनुसार सभी योजनाओं के विस्तृत दिशानिर्देश सत्यापित डेटाबेस में उपलब्ध हैं। आप सीधे पात्रता विज़ार्ड द्वारा अपनी सटीक पात्रता जान सकते हैं।"
        : "All scheme rules are verified by our deterministic engine. You can run the 2-minute Eligibility Wizard to check your exact status.";

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedAction: {
          labelHi: "अपनी पात्रता अभी जांचें",
          labelEn: "Check Eligibility Now",
          onClick: onStartWizard,
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
      {/* 1. Global Floating Action Button (Always Visible) */}
      <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="relative group p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2.5 border-2 border-white/20"
          title={isHindi ? "सेतु सहायक AI खोलें" : "Open Setu Sahayak AI"}
        >
          {/* Subtle Glow Ring */}
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
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l border-border shadow-2xl">
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
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold">
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

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                title="Clear Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
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
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed space-y-2 ${
                      isAssistant
                        ? "bg-card border border-border/80 text-foreground shadow-subtle"
                        : "bg-primary text-primary-foreground font-medium shadow-sm"
                    }`}
                  >
                    <div>{msg.text}</div>

                    {/* Optional Inline Action Button */}
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

                    <div
                      className={`text-[10px] ${
                        isAssistant ? "text-muted-foreground" : "text-primary-foreground/70"
                      } text-right`}
                    >
                      {msg.time}
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
              <div className="flex items-center space-x-2 text-xs text-muted-foreground p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>{isHindi ? "सेतु सहायक उत्तर सोच रहा है..." : "Setu Sahayak is replying..."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions Strip */}
          <div className="p-3 border-t border-border/60 bg-muted/10 space-y-1.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>{isHindi ? "सुझाए गए प्रश्न:" : "Suggested Questions:"}</span>
            </div>
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] text-foreground hover:border-primary/50 hover:text-primary transition-colors shrink-0 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Quick Explore Schemes Link */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>{isHindi ? "सभी 15+ योजनाएं देखना चाहते हैं?" : "Want to browse all schemes?"}</span>
              <button
                type="button"
                onClick={() => {
                  setIsAssistantOpen(false);
                  onExploreSchemes();
                }}
                className="text-primary hover:underline font-bold"
              >
                {isHindi ? "योजना निर्देशिका देखें →" : "View Schemes Catalog →"}
              </button>
            </div>
          </div>

          {/* Message Input Footer */}
          <div className="p-3.5 border-t border-border bg-card">
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
                    ? "योजना या पात्रता के बारे में पूछें..."
                    : "Ask about welfare schemes or rules..."
                }
                className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              <button
                type="button"
                onClick={() => {
                  setInputText(
                    isHindi
                      ? "मेरी आयु 28 वर्ष है और मैं मध्य प्रदेश में खेती करती हूँ। मेरे लिए कौन सी योजनाएं हैं?"
                      : "I am a 28-year-old farmer in Madhya Pradesh. Which schemes apply to me?"
                  );
                }}
                className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={isHindi ? "वॉइस इनपुट नमूना" : "Voice Input Sample"}
              >
                <Mic className="w-4 h-4 text-primary" />
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
