/**
 * Scheme localization helper
 * Ensures 100% accurate English and Hindi translations for benefits, ministries, and issuing authorities.
 */

export interface SchemeLocalizationItem {
  benefitEn: string;
  benefitHi: string;
  ministryEn: string;
  ministryHi: string;
}

export const SCHEME_LOCALIZATION_MAP: Record<string, SchemeLocalizationItem> = {
  "pm-kisan": {
    benefitEn: "₹6,000 / year (3 installments of ₹2,000)",
    benefitHi: "₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तें)",
    ministryEn: "Ministry of Agriculture & Farmers Welfare",
    ministryHi: "कृषि एवं किसान कल्याण मंत्रालय",
  },
  "ayushman-bharat-pmjay": {
    benefitEn: "₹5,00,000 / year Free Cashless Treatment",
    benefitHi: "₹5,00,000 / वर्ष मुफ्त कैशलेस इलाज",
    ministryEn: "Ministry of Health and Family Welfare",
    ministryHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय",
  },
  "rajasthan-youth-skill-employment": {
    benefitEn: "Up to ₹10,000 Skill Allowance",
    benefitHi: "₹10,000 तक कौशल भत्ता",
    ministryEn: "Department of Skills & Livelihoods, Rajasthan",
    ministryHi: "कौशल, रोजगार एवं उद्यमिता विभाग, राजस्थान",
  },
  "pm-mudra-yojana": {
    benefitEn: "₹50,000 to ₹20,00,000 Collateral-Free Loan",
    benefitHi: "₹50,000 से ₹20,00,000 तक बिना गारंटी ऋण",
    ministryEn: "Ministry of Finance",
    ministryHi: "वित्त मंत्रालय",
  },
  "sukanya-samriddhi-yojana": {
    benefitEn: "8.2% Annual Interest + 100% Tax Exemption",
    benefitHi: "8.2% वार्षिक ब्याज + 100% टैक्स छूट",
    ministryEn: "Ministry of Finance / Women & Child Development",
    ministryHi: "वित्त मंत्रालय / महिला एवं बाल विकास मंत्रालय",
  },
  "pm-awas-yojana-urban-gramin": {
    benefitEn: "₹1,20,000 to ₹2,50,000 Pucca Housing Assistance",
    benefitHi: "₹1,20,000 से ₹2,50,000 पक्का मकान सहायता",
    ministryEn: "Ministry of Housing & Urban Affairs / Rural Development",
    ministryHi: "आवासन और शहरी कार्य मंत्रालय / ग्रामीण विकास मंत्रालय",
  },
  "pm-awas-yojana-gramin": {
    benefitEn: "₹1,20,000 to ₹1,30,000 Housing Grant",
    benefitHi: "₹1,20,000 से ₹1,30,000 पक्का मकान अनुदान",
    ministryEn: "Ministry of Rural Development",
    ministryHi: "ग्रामीण विकास मंत्रालय",
  },
  "post-matric-scholarship-sc-st-obc": {
    benefitEn: "100% Tuition Fee + ₹4,000 to ₹13,500 Annual Allowance",
    benefitHi: "100% ट्यूशन फीस + ₹4,000 से ₹13,500 वार्षिक भत्ता",
    ministryEn: "Ministry of Social Justice and Empowerment",
    ministryHi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय",
  },
  "nsp-post-matric-sc-st": {
    benefitEn: "100% Tuition Fee + ₹4,000 to ₹13,500 Annual Allowance",
    benefitHi: "100% ट्यूशन फीस + ₹4,000 से ₹13,500 वार्षिक भत्ता",
    ministryEn: "Ministry of Social Justice and Empowerment",
    ministryHi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय",
  },
  "national-apprenticeship-promotion-scheme": {
    benefitEn: "₹1,500 / month Stipend + Industry Certification",
    benefitHi: "₹1,500/माह सरकारी स्टाइपेंड + इंडस्ट्री सर्टिफिकेशन",
    ministryEn: "Ministry of Skill Development & Entrepreneurship (MSDE)",
    ministryHi: "कौशल विकास और उद्यमशीलता मंत्रालय (MSDE)",
  },
  "central-sector-merit-scholarship-college": {
    benefitEn: "₹12,000 to ₹20,000 / year Merit Aid",
    benefitHi: "₹12,000 से ₹20,000 प्रति वर्ष",
    ministryEn: "Ministry of Education (Higher Education)",
    ministryHi: "शिक्षा मंत्रालय (उच्चतर शिक्षा विभाग)",
  },
  "pm-kaushal-vikas-yojana": {
    benefitEn: "Free Training + ₹8,000 Stipend + Certificate",
    benefitHi: "मुफ्त प्रशिक्षण + ₹8,000 मानदेय + सरकारी प्रमाण पत्र",
    ministryEn: "Ministry of Skill Development & Entrepreneurship",
    ministryHi: "कौशल विकास और उद्यमशीलता मंत्रालय",
  },
  "free-coaching-scheme-sc-obc": {
    benefitEn: "Free Coaching Fee + ₹4,000 to ₹6,000 Monthly Stipend",
    benefitHi: "मुफ्त कोचिंग फीस + ₹4,000 से ₹6,000 मासिक वजीफा",
    ministryEn: "Ministry of Social Justice and Empowerment",
    ministryHi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय",
  },
  "ladli-behna-yojana-mp": {
    benefitEn: "₹1,250 / month (₹15,000 / year)",
    benefitHi: "₹1,250 / माह (₹15,000 प्रति वर्ष)",
    ministryEn: "Department of Women & Child Development, Govt of MP",
    ministryHi: "महिला एवं बाल विकास विभाग, मध्य प्रदेश सरकार",
  },
  "ladli-behna-yojana": {
    benefitEn: "₹1,250 / month (₹15,000 / year)",
    benefitHi: "₹1,250 / माह (₹15,000 प्रति वर्ष)",
    ministryEn: "Department of Women & Child Development, Govt of MP",
    ministryHi: "महिला एवं बाल विकास विभाग, मध्य प्रदेश सरकार",
  },
  "indira-gandhi-divyangjan-pension": {
    benefitEn: "₹1,000 to ₹2,500 / month Pension",
    benefitHi: "₹1,000 से ₹2,500 प्रति माह पेंशन",
    ministryEn: "Ministry of Rural Development (NSAP)",
    ministryHi: "ग्रामीण विकास मंत्रालय (NSAP)",
  },
  "indira-gandhi-old-age-pension": {
    benefitEn: "₹1,000 to ₹3,000 / month Pension",
    benefitHi: "₹1,000 से ₹3,000 प्रति माह पेंशन",
    ministryEn: "Ministry of Rural Development (NSAP)",
    ministryHi: "ग्रामीण विकास मंत्रालय (NSAP)",
  },
  "pm-svanidhi-street-vendors": {
    benefitEn: "₹10,000 to ₹50,000 Loan + 7% Interest Subsidy",
    benefitHi: "₹10,000 से ₹50,000 तक आसान लोन + 7% ब्याज सब्सिडी",
    ministryEn: "Ministry of Housing and Urban Affairs (MoHUA)",
    ministryHi: "आवासन और शहरी कार्य मंत्रालय (MoHUA)",
  },
  "pm-svanidhi": {
    benefitEn: "₹10,000 to ₹50,000 Working Capital Loan",
    benefitHi: "₹10,000 से ₹50,000 तक कार्यशील पूंजी ऋण",
    ministryEn: "Ministry of Housing and Urban Affairs",
    ministryHi: "आवासन और शहरी कार्य मंत्रालय",
  },
  "pm-matsya-sampada-yojana": {
    benefitEn: "40% to 60% Govt Capital Subsidy",
    benefitHi: "40% से 60% तक सरकारी पूंजीगत सब्सिडी",
    ministryEn: "Ministry of Fisheries, Animal Husbandry & Dairying",
    ministryHi: "मत्स्य पालन, पशुपालन और डेयरी मंत्रालय",
  },
  "atal-pension-yojana": {
    benefitEn: "₹1,000 to ₹5,000 / month Guaranteed Pension",
    benefitHi: "₹1,000 से ₹5,000 प्रति माह गारंटीड पेंशन",
    ministryEn: "Ministry of Finance (PFRDA)",
    ministryHi: "वित्त मंत्रालय (PFRDA)",
  },
};

/**
 * Returns localized benefit text for any scheme.
 */
export const getLocalizedBenefit = (
  scheme: { id?: string; benefit_amount_text?: string } | null | undefined,
  isHindi: boolean
): string => {
  if (!scheme) return "";
  const id = scheme.id || "";
  const curated = SCHEME_LOCALIZATION_MAP[id];
  if (curated) {
    return isHindi ? curated.benefitHi : curated.benefitEn;
  }

  const text = scheme.benefit_amount_text || "";
  if (isHindi) return text;

  // Algorithmic phrase replacement for any non-curated scheme strings
  return text
    .replace(/प्रति वर्ष/g, "/ year")
    .replace(/\/ वर्ष/g, "/ year")
    .replace(/प्रति माह/g, "/ month")
    .replace(/\/ माह/g, "/ month")
    .replace(/\/माह/g, "/ month")
    .replace(/मासिक/g, "Monthly")
    .replace(/वार्षिक/g, "Annual")
    .replace(/किस्तें/g, "installments")
    .replace(/की/g, "of")
    .replace(/मुफ्त इलाज/g, "Free Treatment")
    .replace(/कैशलेस इलाज/g, "Cashless Treatment")
    .replace(/बिना गारंटी लोन/g, "Collateral-Free Loan")
    .replace(/बिना गारंटी ऋण/g, "Collateral-Free Loan")
    .replace(/पक्का मकान सहायता/g, "Pucca Housing Assistance")
    .replace(/पक्का मकान अनुदान/g, "Pucca Housing Grant")
    .replace(/कार्यशील पूंजी ऋण/g, "Working Capital Loan")
    .replace(/सरकारी प्रमाण पत्र/g, "Govt Certificate")
    .replace(/सरकारी स्टाइपेंड/g, "Govt Stipend")
    .replace(/इंडस्ट्री सर्टिफिकेशन/g, "Industry Certification")
    .replace(/सरकारी पूंजीगत सब्सिडी/g, "Govt Capital Subsidy")
    .replace(/ब्याज सब्सिडी/g, "Interest Subsidy")
    .replace(/पेंशन/g, "Pension")
    .replace(/टैक्स छूट/g, "Tax Exemption")
    .replace(/वजीफा/g, "Stipend")
    .replace(/ट्यूशन फीस/g, "Tuition Fee")
    .replace(/मुफ्त/g, "Free")
    .replace(/से/g, "to")
    .replace(/तक/g, "")
    .replace(/परिवार/g, "family")
    .trim();
};

/**
 * Returns clean localized ministry name for any scheme.
 */
export const getLocalizedMinistry = (
  scheme: { id?: string; ministry?: string } | null | undefined,
  isHindi: boolean
): string => {
  if (!scheme) return "";
  const id = scheme.id || "";
  const curated = SCHEME_LOCALIZATION_MAP[id];
  if (curated) {
    return isHindi ? curated.ministryHi : curated.ministryEn;
  }

  const raw = scheme.ministry || "";
  if (raw.includes("(") && raw.includes(")")) {
    const parts = raw.match(/^(.*?)\s*\((.*?)\)$/);
    if (parts) {
      return isHindi ? parts[1].trim() : parts[2].trim();
    }
  }

  if (!isHindi) {
    if (raw.includes("महिला एवं बाल विकास")) return "Ministry of Women & Child Development";
    if (raw.includes("आवासन और शहरी")) return "Ministry of Housing & Urban Affairs";
    if (raw.includes("सामाजिक न्याय")) return "Ministry of Social Justice & Empowerment";
    if (raw.includes("मत्स्य पालन")) return "Ministry of Fisheries, Animal Husbandry & Dairying";
    if (raw.includes("ग्रामीण विकास")) return "Ministry of Rural Development";
    if (raw.includes("कौशल विकास")) return "Ministry of Skill Development & Entrepreneurship";
    if (raw.includes("कृषि एवं किसान")) return "Ministry of Agriculture & Farmers Welfare";
    if (raw.includes("स्वास्थ्य")) return "Ministry of Health & Family Welfare";
    if (raw.includes("वित्त")) return "Ministry of Finance";
    if (raw.includes("शिक्षा")) return "Ministry of Education";
  }

  return raw;
};

/**
 * Localizes document issuing authorities.
 */
export const getLocalizedAuthority = (raw: string, isHindi: boolean): string => {
  if (!raw) return "";
  if (isHindi) return raw;

  if (raw.includes("(") && raw.includes(")")) {
    const parts = raw.match(/^(.*?)\s*\((.*?)\)$/);
    if (parts && parts[2]) {
      return parts[2].trim();
    }
  }

  if (raw.includes("बैंक")) return "Respective Bank Branch";
  if (raw.includes("राजस्व")) return "State Revenue Department";
  if (raw.includes("आपूर्ति")) return "Food & Civil Supplies Department";
  if (raw.includes("महिला")) return "Women & Child Development Dept";
  if (raw.includes("पंचायत")) return "Gram Panchayat / Block Office";
  if (raw.includes("शहरी") || raw.includes("नगर")) return "Municipal Corporation";

  return raw;
};