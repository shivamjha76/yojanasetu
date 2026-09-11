import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Sprout,
  GraduationCap,
  HeartPulse,
  Baby,
  Home,
  Briefcase,
  Wrench,
  Shield,
  ArrowRight,
} from "lucide-react";

interface CategoryGridProps {
  onSelectCategory?: (categoryId: string) => void;
}

interface CategoryCardItem {
  id: string;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn: string;
  icon: React.ReactNode;
  bgLight: string;
  bgDark: string;
  textColor: string;
  borderColor: string;
  schemeCount: number;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const categories: CategoryCardItem[] = [
    {
      id: "agriculture",
      nameHi: "कृषि एवं किसान कल्याण",
      nameEn: "Agriculture & Farming",
      descriptionHi: "पीएम-किसान, फसल बीमा, खाद-बीज सब्सिडी",
      descriptionEn: "PM-Kisan, Crop Insurance, Input subsidies",
      icon: <Sprout className="w-6 h-6" />,
      bgLight: "bg-emerald-50 text-emerald-700",
      bgDark: "dark:bg-emerald-950/40 dark:text-emerald-300",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "hover:border-emerald-500/50",
      schemeCount: 2,
    },
    {
      id: "education_scholarships",
      nameHi: "शिक्षा एवं छात्रवृत्ति",
      nameEn: "Education & Scholarships",
      descriptionHi: "पोस्ट-मैट्रिक, मेरिट स्कॉलरशिप, फ्री कोचिंग",
      descriptionEn: "Post-Matric, Merit Scholarships, Free Coaching",
      icon: <GraduationCap className="w-6 h-6" />,
      bgLight: "bg-blue-50 text-blue-700",
      bgDark: "dark:bg-blue-950/40 dark:text-blue-300",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "hover:border-blue-500/50",
      schemeCount: 3,
    },
    {
      id: "healthcare",
      nameHi: "स्वास्थ्य एवं चिकित्सा",
      nameEn: "Healthcare & Wellness",
      descriptionHi: "आयुष्मान भारत ₹5 लाख मुफ्त इलाज",
      descriptionEn: "Ayushman Bharat ₹5 Lakh cashless cover",
      icon: <HeartPulse className="w-6 h-6" />,
      bgLight: "bg-rose-50 text-rose-700",
      bgDark: "dark:bg-rose-950/40 dark:text-rose-300",
      textColor: "text-rose-600 dark:text-rose-400",
      borderColor: "hover:border-rose-500/50",
      schemeCount: 1,
    },
    {
      id: "women_child",
      nameHi: "महिला एवं बाल विकास",
      nameEn: "Women & Child Care",
      descriptionHi: "लाड़ली बहना, सुकन्या समृद्धि, मातृत्व लाभ",
      descriptionEn: "Ladli Behna, Sukanya Samriddhi, Maternity",
      icon: <Baby className="w-6 h-6" />,
      bgLight: "bg-pink-50 text-pink-700",
      bgDark: "dark:bg-pink-950/40 dark:text-pink-300",
      textColor: "text-pink-600 dark:text-pink-400",
      borderColor: "hover:border-pink-500/50",
      schemeCount: 2,
    },
    {
      id: "housing_urban",
      nameHi: "आवास एवं बुनियादी सुविधाएं",
      nameEn: "Housing & Shelter",
      descriptionHi: "पीएम आवास ग्रामीण एवं शहरी पक्का मकान",
      descriptionEn: "PM Awas Yojana Pucca House Grant",
      icon: <Home className="w-6 h-6" />,
      bgLight: "bg-amber-50 text-amber-700",
      bgDark: "dark:bg-amber-950/40 dark:text-amber-300",
      textColor: "text-amber-600 dark:text-amber-400",
      borderColor: "hover:border-amber-500/50",
      schemeCount: 1,
    },
    {
      id: "business_msme_loans",
      nameHi: "व्यापार एवं मुद्रा लोन",
      nameEn: "Business & MSME Loans",
      descriptionHi: "पीएम मुद्रा लोन, पीएम स्वनिधि स्ट्रीट वेंडर",
      descriptionEn: "PM Mudra Loans, PM SVANidhi Vendors",
      icon: <Briefcase className="w-6 h-6" />,
      bgLight: "bg-cyan-50 text-cyan-700",
      bgDark: "dark:bg-cyan-950/40 dark:text-cyan-300",
      textColor: "text-cyan-600 dark:text-cyan-400",
      borderColor: "hover:border-cyan-500/50",
      schemeCount: 2,
    },
    {
      id: "skills_employment",
      nameHi: "कौशल विकास एवं रोजगार",
      nameEn: "Skills & Employment",
      descriptionHi: "PMKVY 4.0, NAPS अप्रेंटिसशिप स्टाइपेंड",
      descriptionEn: "PMKVY 4.0, National Apprenticeship",
      icon: <Wrench className="w-6 h-6" />,
      bgLight: "bg-purple-50 text-purple-700",
      bgDark: "dark:bg-purple-950/40 dark:text-purple-300",
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "hover:border-purple-500/50",
      schemeCount: 2,
    },
    {
      id: "social_security_pensions",
      nameHi: "सामाजिक सुरक्षा एवं पेंशन",
      nameEn: "Social Security & Pensions",
      descriptionHi: "वृद्धावस्था पेंशन, दिव्यांगजन पेंशन",
      descriptionEn: "Old Age Pension, Disability Pension",
      icon: <Shield className="w-6 h-6" />,
      bgLight: "bg-slate-100 text-slate-800",
      bgDark: "dark:bg-slate-800/60 dark:text-slate-200",
      textColor: "text-slate-600 dark:text-slate-400",
      borderColor: "hover:border-slate-400/50",
      schemeCount: 2,
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isHindi ? "श्रेणी अनुसार योजनाएं खोजें" : "Explore Schemes by Sector"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isHindi
              ? "अपनी आवश्यकता के अनुसार उपयुक्त वर्ग चुनें और सभी सक्रिय सरकारी योजनाओं की सूची देखें"
              : "Select a welfare category to discover targeted government initiatives tailored for your needs"}
          </p>
        </div>

        {/* 8 Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group p-5 rounded-2xl border border-border bg-card shadow-subtle transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-card-hover ${cat.borderColor}`}
            >
              {/* Top Row: Icon + Count */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.bgLight} ${cat.bgDark}`}
                >
                  {cat.icon}
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/80">
                  {isHindi ? `${cat.schemeCount} योजनाएं` : `${cat.schemeCount} Schemes`}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {isHindi ? cat.nameHi : cat.nameEn}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {isHindi ? cat.descriptionHi : cat.descriptionEn}
                </p>
              </div>

              {/* Bottom Action Arrow */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                <span>{isHindi ? "योजनाएं देखें" : "View Schemes"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
