import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "hi" | "en";
type Theme = "light" | "dark";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isOnline: boolean;
  triggerOfflineToast: (featureName?: string) => void;
  offlineToast: string | null;
  clearOfflineToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("yojanasetu_lang") as Language) || "hi";
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("yojanasetu_theme") as Theme;
      if (saved) return saved;
      return "light";
    }
    return "light";
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineToast(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const triggerOfflineToast = (featureName?: string) => {
    const isHi = language === "hi";
    const msg = featureName
      ? isHi
        ? `⚠️ "${featureName}" के लिए इंटरनेट कनेक्शन आवश्यक है। कृपया नेटवर्क कनेक्ट होने पर प्रयास करें।`
        : `⚠️ Internet connection is required to use "${featureName}". Please reconnect to try again.`
      : isHi
      ? "⚠️ इस सुविधा के लिए इंटरनेट कनेक्शन आवश्यक है। कृपया नेटवर्क कनेक्ट होने पर प्रयास करें।"
      : "⚠️ Internet connection is required for this feature. Please reconnect to try again.";
    setOfflineToast(msg);
  };

  const clearOfflineToast = () => setOfflineToast(null);

  useEffect(() => {
    if (offlineToast) {
      const timer = setTimeout(() => {
        setOfflineToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [offlineToast]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("yojanasetu_theme", theme);
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("yojanasetu_lang", lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        toggleTheme,
        isAssistantOpen,
        setIsAssistantOpen,
        isOnline,
        triggerOfflineToast,
        offlineToast,
        clearOfflineToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
