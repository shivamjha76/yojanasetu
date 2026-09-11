/**
 * YojanaSetu Client-side Deterministic Rule Engine
 * 100% deterministic rule evaluation in browser with zero hallucination.
 * Directly evaluates citizen profiles against scheme criteria.
 */

import {
  CitizenProfile,
  Rule,
  Scheme,
  RuleMatchEvidence,
  EligibilityResult,
} from "@/types/schema";
import rawSchemes from "@/data/schemes.json";

export const ALL_SCHEMES: Scheme[] = rawSchemes as unknown as Scheme[];

function normalizeValue(val: any): any {
  if (typeof val === "string") {
    return val.trim().toLowerCase();
  }
  if (Array.isArray(val)) {
    return val.map(normalizeValue);
  }
  return val;
}

function getProfileFieldValue(profile: CitizenProfile, fieldName: string): any {
  const fieldLower = fieldName.trim().toLowerCase();
  const obj = profile as any;

  if (fieldLower in obj && obj[fieldLower] !== undefined) {
    return obj[fieldLower];
  }
  return null;
}

function formatValueDisplay(val: any, isHindi: boolean = true): string {
  if (typeof val === "number") {
    if (val >= 100000) {
      const lakhs = val / 100000;
      if (isHindi) {
        return lakhs % 1 !== 0 ? `₹${lakhs.toFixed(2)} लाख` : `₹${Math.round(lakhs)} लाख`;
      }
      return lakhs % 1 !== 0 ? `₹${lakhs.toFixed(2)} Lakh` : `₹${Math.round(lakhs)} Lakh`;
    }
    if (val >= 1000) {
      return `₹${val.toLocaleString("en-IN")}`;
    }
    return String(val);
  }
  if (Array.isArray(val)) {
    return val.map((x) => String(x).toUpperCase()).join(", ");
  }
  if (typeof val === "boolean") {
    return isHindi ? (val ? "हाँ" : "नहीं") : (val ? "Yes" : "No");
  }
  if (val === null || val === undefined) {
    return isHindi ? "लागू नहीं" : "Not Provided";
  }
  return String(val);
}

function buildEvidence(rule: Rule, userVal: any, isMatched: boolean): RuleMatchEvidence {
  const targetStrHi = formatValueDisplay(rule.value, true);
  const targetStrEn = formatValueDisplay(rule.value, false);
  const prefixHi = isMatched ? "✓ " : "✗ ";
  const prefixEn = isMatched ? "✓ " : "✗ ";

  let evidenceHi = "";
  let evidenceEn = "";

  if (rule.field === "age") {
    if (isMatched) {
      evidenceHi = `${prefixHi}आपकी आयु ${userVal} वर्ष है (नियम: ${rule.description_hi || `${rule.operator} ${targetStrHi}`})`;
      evidenceEn = `${prefixEn}Your age is ${userVal} (Required: ${rule.description_en || `${rule.operator} ${targetStrEn}`})`;
    } else {
      evidenceHi = `${prefixHi}आपकी आयु ${userVal} वर्ष है, जो कि आवश्यक सीमा (${rule.description_hi || `${rule.operator} ${targetStrHi}`}) में नहीं आती`;
      evidenceEn = `${prefixEn}Your age is ${userVal}, which does not satisfy the requirement (${rule.description_en || `${rule.operator} ${targetStrEn}`})`;
    }
  } else if (rule.field === "gender") {
    const gTextHi = userVal === "female" ? "महिला" : userVal === "male" ? "पुरुष" : String(userVal);
    const gTextEn = userVal === "female" ? "Female" : userVal === "male" ? "Male" : String(userVal);
    if (isMatched) {
      evidenceHi = `${prefixHi}लिंग: ${gTextHi} (नियम: ${rule.description_hi || targetStrHi})`;
      evidenceEn = `${prefixEn}Gender: ${gTextEn} matches criteria (${rule.description_en || targetStrEn})`;
    } else {
      evidenceHi = `${prefixHi}यह योजना केवल ${rule.description_hi || targetStrHi} के लिए है (आप: ${gTextHi})`;
      evidenceEn = `${prefixEn}Scheme is intended for ${rule.description_en || targetStrEn} (You: ${gTextEn})`;
    }
  } else if (rule.field === "annual_income") {
    const incDispHi = formatValueDisplay(userVal, true);
    const incDispEn = formatValueDisplay(userVal, false);
    if (isMatched) {
      evidenceHi = `${prefixHi}पारिवारिक वार्षिक आय ${incDispHi} है (सीमा: ${rule.description_hi || `${rule.operator} ${targetStrHi}`})`;
      evidenceEn = `${prefixEn}Annual income is ${incDispEn} (Limit: ${rule.description_en || `${rule.operator} ${targetStrEn}`})`;
    } else {
      evidenceHi = `${prefixHi}आपकी वार्षिक आय ${incDispHi} निर्धारित आय सीमा (${rule.description_hi || `${rule.operator} ${targetStrHi}`}) से अधिक है`;
      evidenceEn = `${prefixEn}Annual income ${incDispEn} exceeds the maximum limit (${rule.description_en || `${rule.operator} ${targetStrEn}`})`;
    }
  } else if (rule.field === "occupation") {
    if (isMatched) {
      evidenceHi = `${prefixHi}पेशा: ${userVal} (पात्र व्यवसाय: ${rule.description_hi || targetStrHi})`;
      evidenceEn = `${prefixEn}Occupation: ${userVal} matches required criteria (${rule.description_en || targetStrEn})`;
    } else {
      evidenceHi = `${prefixHi}यह योजना ${rule.description_hi || targetStrHi} के लिए है (आपका पेशा: ${userVal})`;
      evidenceEn = `${prefixEn}Scheme requires occupation to be ${rule.description_en || targetStrEn} (Your occupation: ${userVal})`;
    }
  } else if (rule.field === "state") {
    if (isMatched) {
      evidenceHi = `${prefixHi}राज्य: ${userVal} (योजना क्षेत्र: ${targetStrHi})`;
      evidenceEn = `${prefixEn}Resident of ${userVal} (Matches scheme territory)`;
    } else {
      evidenceHi = `${prefixHi}यह राज्य योजना केवल ${targetStrHi} के निवासियों के लिए है (आपका राज्य: ${userVal})`;
      evidenceEn = `${prefixEn}State scheme only applicable to residents of ${targetStrEn} (Your state: ${userVal})`;
    }
  } else {
    const uStrHi = formatValueDisplay(userVal, true);
    const uStrEn = formatValueDisplay(userVal, false);
    if (isMatched) {
      evidenceHi = `${prefixHi}${rule.description_hi || `${rule.field}: ${uStrHi} (${rule.operator} ${targetStrHi})`}`;
      evidenceEn = `${prefixEn}${rule.description_en || `${rule.field}: ${uStrEn} (${rule.operator} ${targetStrEn})`}`;
    } else {
      evidenceHi = `${prefixHi}${rule.description_hi || `${rule.field}: ${uStrHi} (${rule.operator} ${targetStrHi} आवश्यक)`}`;
      evidenceEn = `${prefixEn}${rule.description_en || `${rule.field}: ${uStrEn} (${rule.operator} ${targetStrEn} required)`}`;
    }
  }

  return {
    field: rule.field,
    condition: `${rule.operator} ${JSON.stringify(rule.value)}`,
    user_value: userVal,
    matched: isMatched,
    evidence_text_hi: evidenceHi,
    evidence_text_en: evidenceEn,
  };
}

export function evaluateSingleRule(
  profile: CitizenProfile,
  rule: Rule
): { matched: boolean; userVal: any; cond: string } {
  const userVal = getProfileFieldValue(profile, rule.field);
  const operator = (rule.operator || "==").toUpperCase().trim();
  const targetVal = rule.value;

  if (userVal === null || userVal === undefined) {
    return { matched: false, userVal: null, cond: `${rule.field} is missing` };
  }

  const normUser = normalizeValue(userVal);
  const normTarget = normalizeValue(targetVal);

  try {
    let matched = false;
    let cond = "";

    switch (operator) {
      case ">=":
        matched = Number(normUser) >= Number(normTarget);
        cond = `>= ${targetVal}`;
        break;
      case "<=":
        matched = Number(normUser) <= Number(normTarget);
        cond = `<= ${targetVal}`;
        break;
      case ">":
        matched = Number(normUser) > Number(normTarget);
        cond = `> ${targetVal}`;
        break;
      case "<":
        matched = Number(normUser) < Number(normTarget);
        cond = `< ${targetVal}`;
        break;
      case "==":
        matched = normUser === normTarget;
        cond = `== ${targetVal}`;
        break;
      case "!=":
        matched = normUser !== normTarget;
        cond = `!= ${targetVal}`;
        break;
      case "IN":
        if (Array.isArray(normTarget)) {
          matched = normTarget.includes(normUser);
        } else {
          matched = normUser === normTarget;
        }
        cond = `IN ${JSON.stringify(targetVal)}`;
        break;
      case "NOT_IN":
        if (Array.isArray(normTarget)) {
          matched = !normTarget.includes(normUser);
        } else {
          matched = normUser !== normTarget;
        }
        cond = `NOT IN ${JSON.stringify(targetVal)}`;
        break;
      case "BETWEEN":
        if (Array.isArray(targetVal) && targetVal.length === 2) {
          const low = Number(targetVal[0]);
          const high = Number(targetVal[1]);
          matched = Number(normUser) >= low && Number(normUser) <= high;
          cond = `BETWEEN ${low} and ${high}`;
        } else {
          matched = false;
          cond = `INVALID_RANGE ${JSON.stringify(targetVal)}`;
        }
        break;
      default:
        matched = false;
        cond = `UNKNOWN_OPERATOR ${operator}`;
    }

    return { matched, userVal, cond };
  } catch {
    return {
      matched: false,
      userVal,
      cond: `TYPE_MISMATCH (${rule.field}: ${userVal} vs ${targetVal})`,
    };
  }
}

export function evaluateScheme(
  profile: CitizenProfile,
  scheme: Scheme
): EligibilityResult {
  const matchedRules: RuleMatchEvidence[] = [];
  const failingRules: RuleMatchEvidence[] = [];
  const ineligibilityReasonsHi: string[] = [];
  const ineligibilityReasonsEn: string[] = [];

  let totalRulesCount = 0;
  let passedRulesCount = 0;

  // Check state restriction for state schemes
  if (scheme.level === "state" && scheme.applicable_state) {
    totalRulesCount++;
    const stateRule: Rule = {
      field: "state",
      operator: "==",
      value: scheme.applicable_state,
      description_hi: `आवेदक ${scheme.applicable_state} का मूल निवासी होना चाहिए`,
      description_en: `Applicant must be resident of ${scheme.applicable_state}`,
    };
    const { matched, userVal } = evaluateSingleRule(profile, stateRule);
    const evidence = buildEvidence(stateRule, userVal, matched);

    if (matched) {
      passedRulesCount++;
      matchedRules.push(evidence);
    } else {
      failingRules.push(evidence);
      ineligibilityReasonsHi.push(evidence.evidence_text_hi);
      ineligibilityReasonsEn.push(evidence.evidence_text_en);
    }
  }

  // Check scheme rules
  if (scheme.rules && scheme.rules.length > 0) {
    for (const rule of scheme.rules) {
      if (
        rule.field === "state" &&
        scheme.level === "state" &&
        scheme.applicable_state
      ) {
        continue;
      }

      totalRulesCount++;
      const { matched, userVal } = evaluateSingleRule(profile, rule);
      const evidence = buildEvidence(rule, userVal, matched);

      if (matched) {
        passedRulesCount++;
        matchedRules.push(evidence);
      } else {
        failingRules.push(evidence);
        ineligibilityReasonsHi.push(evidence.evidence_text_hi);
        ineligibilityReasonsEn.push(evidence.evidence_text_en);
      }
    }
  }

  const isEligible = failingRules.length === 0;
  const matchPercentage =
    totalRulesCount > 0 ? Math.round((passedRulesCount / totalRulesCount) * 100) : 100;

  return {
    scheme_id: scheme.id,
    scheme_name_hi: scheme.name_hi,
    scheme_name_en: scheme.name_en,
    category: scheme.category,
    benefit_amount_text: scheme.benefit_amount_text,
    benefit_type: scheme.benefit_type,
    official_portal_url: scheme.official_portal_url,
    processing_time_days: scheme.processing_time_days,
    processing_time_hi: scheme.processing_time_hi,
    processing_time_en: scheme.processing_time_en,
    is_eligible: isEligible,
    match_percentage: matchPercentage,
    matched_rules: matchedRules,
    failing_rules: failingRules,
    ineligibility_reasons_hi: ineligibilityReasonsHi,
    ineligibility_reasons_en: ineligibilityReasonsEn,
    required_documents: scheme.documents || [],
  };
}

export function evaluateAllSchemes(
  profile: CitizenProfile,
  includeIneligible = true
) {
  const eligibleSchemes: EligibilityResult[] = [];
  const ineligibleSchemes: EligibilityResult[] = [];

  for (const scheme of ALL_SCHEMES) {
    const result = evaluateScheme(profile, scheme);
    if (result.is_eligible) {
      eligibleSchemes.push(result);
    } else if (includeIneligible) {
      ineligibleSchemes.push(result);
    }
  }

  // Sort eligible schemes by match percentage descending
  eligibleSchemes.sort((a, b) => b.match_percentage - a.match_percentage);
  ineligibleSchemes.sort((a, b) => b.match_percentage - a.match_percentage);

  return {
    total_schemes_evaluated: ALL_SCHEMES.length,
    eligible_count: eligibleSchemes.length,
    ineligible_count: ineligibleSchemes.length,
    eligible_schemes: eligibleSchemes,
    ineligible_schemes: ineligibleSchemes,
  };
}
