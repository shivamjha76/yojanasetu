import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Scheme } from "@/types/schema";
import { api } from "@/services/api";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Filter, RefreshCw } from "lucide-react";

interface TrendingSchemesProps {
  onViewDetails?: (schemeId: string) => void;
  onExploreAll?: () => void;
}

// Fallback flagship schemes to display immediately even if API is loading or offline
const FALLBACK_FLAGSHIP_SCHEMES: Scheme[] = [
  {
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
    benefit_amount_text: "₹6,000 प्रति वर्ष (DBT)",
    benefit_type: "direct_benefit_transfer",
    official_portal_url: "https://pmkisan.gov.in/",
    rules: [],
    documents: [],
    application_steps_hi: ["पोर्टल पर जाएं", "ई-केवाईसी करें"],
    application_steps_en: ["Visit portal", "Complete eKYC"],
    faqs: [],
  },
  {
    id: "ayushman-bharat-pmjay",
    name_hi: "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY)",
    name_en: "Ayushman Bharat - PM-JAY",
    short_summary_hi: "गरीब और वंचित परिवारों को प्रति वर्ष ₹5 लाख तक का कैशलेस एवं मुफ्त स्वास्थ्य बीमा।",
    short_summary_en: "Cashless health insurance coverage of up to ₹5 Lakhs per family per year for secondary and tertiary care.",
    detailed_description_hi: "देश के 12 करोड़ से अधिक कमजोर परिवारों को सूचीबद्ध सरकारी व निजी अस्पतालों में कैशलेस उपचार।",
    detailed_description_en: "PM-JAY offers ₹5 Lakh annual cashless treatment in empaneled hospitals across India.",
    ministry: "Ministry of Health and Family Welfare",
    level: "central",
    applicable_state: null,
    category: "healthcare",
    benefit_amount_text: "₹5,00,000 प्रति वर्ष कैशलेस इलाज",
    benefit_type: "health_insurance",
    official_portal_url: "https://pmjay.gov.in/",
    rules: [],
    documents: [],
    application_steps_hi: ["पात्रता जांचें", "आयुष्मान कार्ड बनाएं"],
    application_steps_en: ["Check eligibility", "Generate card"],
    faqs: [],
  },
  {
    id: "pm-mudra-yojana",
    name_hi: "प्रधानमंत्री मुद्रा योजना (PMMY)",
    name_en: "Pradhan Mantri MUDRA Yojana (PMMY)",
    short_summary_hi: "गैर-कॉर्पोरेट, गैर-कृषि लघु/सूक्ष्म उद्यमों को ₹10 लाख (अब ₹20 लाख तक) का कोलेटरल-मुक्त व्यवसाय ऋण।",
    short_summary_en: "Collateral-free business loans up to ₹10 Lakhs (now ₹20 Lakhs) for micro and small enterprises.",
    detailed_description_hi: "शिशु (₹50,000 तक), किशोर (₹50,000 से ₹5 लाख) और तरुण (₹5 लाख से ₹10 लाख) श्रेणियों में व्यवसाय ऋण।",
    detailed_description_en: "Collateral-free micro loans under Shishu, Kishore, and Tarun categories.",
    ministry: "Ministry of Finance",
    level: "central",
    applicable_state: null,
    category: "business_msme_loans",
    benefit_amount_text: "₹50,000 से ₹20,00,000 तक बिना गारंटी ऋण",
    benefit_type: "loan_subsidy",
    official_portal_url: "https://www.mudra.org.in/",
    rules: [],
    documents: [],
    application_steps_hi: ["बैंक में संपर्क करें", "मुद्रा फॉर्म भरें"],
    application_steps_en: ["Visit bank", "Submit MUDRA form"],
    faqs: [],
  },
  {
    id: "sukanya-samriddhi-yojana",
    name_hi: "सुकन्या समृद्धि योजना (SSY)",
    name_en: "Sukanya Samriddhi Yojana (SSY)",
    short_summary_hi: "बेटियों के उज्ज्वल भविष्य और उच्च शिक्षा के लिए 8.2% उच्च ब्याज दर वाली सुरक्षित सरकारी बचत योजना।",
    short_summary_en: "High-interest (8.2%) government-backed savings scheme for girl children up to age 10 with tax exemptions.",
    detailed_description_hi: "बालिकाओं के नाम से बैंक या डाकघर में खाता खोलकर आयकर छूट 80C के साथ सुरक्षित बचत।",
    detailed_description_en: "Small savings scheme offering guaranteed sovereign returns and Section 80C tax benefits.",
    ministry: "Ministry of Finance",
    level: "central",
    applicable_state: null,
    category: "women_child",
    benefit_amount_text: "8.2% वार्षिक चक्रवृद्धि ब्याज + 80C कर छूट",
    benefit_type: "direct_benefit_transfer",
    official_portal_url: "https://www.indiapost.gov.in/",
    rules: [],
    documents: [],
    application_steps_hi: ["डाकघर/बैंक जाएं", "जन्म प्रमाण पत्र प्रस्तुत करें"],
    application_steps_en: ["Visit Post Office", "Submit Birth Certificate"],
    faqs: [],
  },
  {
    id: "nsp-post-matric-sc-st",
    name_hi: "पोस्ट-मैट्रिक छात्रवृत्ति योजना (SC/ST/OBC)",
    name_en: "Post-Matric Scholarship Scheme",
    short_summary_hi: "10वीं के बाद उच्च शिक्षा प्राप्त कर रहे वंचित वर्ग के छात्रों को पूर्ण शिक्षण शुल्क व मासिक निर्वाह भत्ता।",
    short_summary_en: "Financial assistance covering 100% course fees plus monthly maintenance allowance for post-secondary education.",
    detailed_description_hi: "ग्रेजुएशन, डिप्लोमा, मेडिकल, इंजीनियरिंग की पढ़ाई के लिए राष्ट्रीय छात्रवृत्ति पोर्टल द्वारा वित्तीय मदद।",
    detailed_description_en: "Full course fee reimbursement plus stipend for backward class students pursuing higher education.",
    ministry: "Ministry of Social Justice and Empowerment",
    level: "central",
    applicable_state: null,
    category: "education_scholarships",
    benefit_amount_text: "₹2,500 से ₹13,500/वर्ष + 100% ट्यूशन फीस",
    benefit_type: "direct_benefit_transfer",
    official_portal_url: "https://scholarships.gov.in/",
    rules: [],
    documents: [],
    application_steps_hi: ["NSP पोर्टल पर रजिस्टर करें", "दस्तावेज अपलोड करें"],
    application_steps_en: ["Register on NSP", "Upload documents"],
    faqs: [],
  },
  {
    id: "ladli-behna-yojana",
    name_hi: "मुख्यमंत्री लाड़ली बहना योजना (MP)",
    name_en: "Mukhyamantri Ladli Behna Yojana (MP)",
    short_summary_hi: "मध्य प्रदेश की 21-60 वर्ष की विवाहित/विधवा महिलाओं को प्रति माह ₹1,250 की सीधी वित्तीय सहायता।",
    short_summary_en: "Monthly direct financial transfer of ₹1,250 to married/widowed women aged 21-60 in Madhya Pradesh.",
    detailed_description_hi: "महिला सशक्तिकरण व पोषण स्तर में सुधार हेतु राज्य सरकार द्वारा प्रति वर्ष ₹15,000 DBT सहायता।",
    detailed_description_en: "Direct unconditional cash transfer into Aadhaar-linked bank accounts of beneficiary women.",
    ministry: "Women & Child Development, Govt of MP",
    level: "state",
    applicable_state: "Madhya Pradesh",
    category: "women_child",
    benefit_amount_text: "₹1,250 प्रति माह (₹15,000 प्रति वर्ष)",
    benefit_type: "direct_benefit_transfer",
    official_portal_url: "https://cmladlibehna.mp.gov.in/",
    rules: [],
    documents: [],
    application_steps_hi: ["ग्राम पंचायत कैंप जाएं", "ई-केवाईसी व बायोमेट्रिक कराएं"],
    application_steps_en: ["Visit GP camp", "Biometric eKYC"],
    faqs: [],
  },
];

export const TrendingSchemes: React.FC<TrendingSchemesProps> = ({
  onViewDetails = () => {},
  onExploreAll = () => {},
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  const [schemes, setSchemes] = useState<Scheme[]>(FALLBACK_FLAGSHIP_SCHEMES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter tabs definition
  const filterTabs = [
    { id: "all", labelHi: "सभी योजनाएं", labelEn: "All Schemes" },
    { id: "agriculture", labelHi: "कृषि", labelEn: "Agriculture" },
    { id: "healthcare", labelHi: "स्वास्थ्य", labelEn: "Healthcare" },
    { id: "women_child", labelHi: "महिला एवं बाल", labelEn: "Women & Child" },
    { id: "education_scholarships", labelHi: "शिक्षा", labelEn: "Education" },
    { id: "business_msme_loans", labelHi: "ऋण एवं मुद्रा", labelEn: "Loans & MSME" },
    { id: "social_security_pensions", labelHi: "पेंशन", labelEn: "Pensions" },
  ];

  // Fetch schemes from API on mount
  useEffect(() => {
    let isMounted = true;

    async function loadSchemes() {
      try {
        setIsLoading(true);
        const res = await api.getSchemes({ limit: 15 });
        if (isMounted && res.schemes && res.schemes.length > 0) {
          setSchemes(res.schemes);
        }
      } catch (err) {
        // Silently keep fallback schemes if backend is not reachable in local dev
        console.warn("Using fallback flagship schemes dataset:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSchemes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered schemes based on active category tab
  const filteredSchemes =
    selectedCategory === "all"
      ? schemes
      : schemes.filter((s) => s.category === selectedCategory);

  return (
    <section className="py-12 sm:py-16 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{isHindi ? "सर्वाधिक लोकप्रिय" : "Flagship Initiatives"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {isHindi ? "ट्रेंडिंग एवं प्रमुख सरकारी योजनाएं" : "Trending & Flagship Schemes"}
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {isHindi
                ? "देश के लाखों नागरिकों द्वारा खोजी गई प्रमुख योजनाएं। बिना किसी बिचौलिये के सीधे अपने बैंक खाते में लाभ प्राप्त करें।"
                : "High-impact welfare schemes with guaranteed financial assistance transferred directly via DBT."}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onExploreAll}
            className="self-start md:self-auto rounded-xl hover:border-primary/50 text-sm font-semibold group"
          >
            <span>{isHindi ? "सभी योजनाएं देखें (15+)" : "View All Schemes (15+)"}</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          <div className="flex items-center mr-1 text-xs font-semibold text-muted-foreground shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1 text-primary" />
            <span>{isHindi ? "फ़िल्टर:" : "Filter:"}</span>
          </div>

          {filterTabs.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {isHindi ? tab.labelHi : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Schemes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-muted/60 border border-border/60 p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded-full" />
                  <div className="h-6 w-3/4 bg-muted rounded-md" />
                  <div className="h-12 w-full bg-muted rounded-md" />
                </div>
                <div className="h-9 w-full bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.slice(0, 6).map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onViewDetails={onViewDetails}
                matchPercentage={scheme.id === "pm-kisan" || scheme.id === "ayushman-bharat-pmjay" ? 95 : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl p-8 max-w-md mx-auto">
            <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="font-bold text-foreground text-base">
              {isHindi ? "इस श्रेणी में कोई योजना नहीं मिली" : "No schemes found in this category"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {isHindi
                ? "कृपया अन्य श्रेणी चुनें अथवा सभी योजनाएं देखें।"
                : "Please select a different category filter or browse all schemes."}
            </p>
            <Button size="sm" variant="outline" onClick={() => setSelectedCategory("all")}>
              {isHindi ? "सभी योजनाएं दिखाएं" : "Show All Schemes"}
            </Button>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-10 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
              ✓
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">
                {isHindi
                  ? "क्या आप अपनी व्यक्तिगत पात्रता की जांच करना चाहते हैं?"
                  : "Want to check your exact eligibility for these schemes?"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isHindi
                  ? "2 मिनट में आयु, व्यवसाय, और आय दर्ज करके जानें कि आप किस योजना के पात्र हैं।"
                  : "Take our 2-minute eligibility check to get a mathematically verified list of benefits."}
              </div>
            </div>
          </div>

          <Button
            onClick={onExploreAll}
            className="w-full sm:w-auto shrink-0 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md font-semibold text-xs h-10 px-5"
          >
            <span>{isHindi ? "पात्रता जांचें" : "Check Eligibility"}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
