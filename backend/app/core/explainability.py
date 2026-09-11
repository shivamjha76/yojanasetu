"""
YojanaSetu Explainability Generator
Translates raw rule evaluation results into transparent, evidence-based proofs:
- "Why You Qualify" (with green checkmarks, user values, and criteria thresholds).
- "Why Ineligible" (with constructive, clear explanations of unmet conditions).
"""

from typing import Any, List, Tuple
from app.models.schemas import (
    CitizenProfile,
    Scheme,
    Rule,
    RuleMatchEvidence,
    EligibilityResult,
)
from app.core.rule_engine import evaluate_scheme, evaluate_single_rule


def _format_value_display(val: Any) -> str:
    """Formats numeric and list values for clean citizen display."""
    if isinstance(val, (int, float)):
        if val >= 100000:
            lakhs = val / 100000
            return f"₹{lakhs:.2f} लाख" if lakhs % 1 != 0 else f"₹{int(lakhs)} लाख"
        elif val >= 1000:
            return f"₹{val:,.0f}"
        return str(val)
    if isinstance(val, list):
        return ", ".join([str(x).upper() for x in val])
    if isinstance(val, bool):
        return "हाँ (Yes)" if val else "नहीं (No)"
    return str(val).capitalize()


def build_evidence(rule: Rule, user_val: Any, is_matched: bool) -> RuleMatchEvidence:
    """
    Constructs a bilingual RuleMatchEvidence object comparing user value to required criteria.
    """
    field_display = rule.field.replace("_", " ").title()
    user_str = _format_value_display(user_val) if user_val is not None else "लागू नहीं (Not Provided)"
    target_str = _format_value_display(rule.value)

    # Use description if available, otherwise generate automatic readable text
    if is_matched:
        prefix_hi = "✓ "
        prefix_en = "✓ "
        status_hi = "शर्त पूरी होती है"
        status_en = "Requirement satisfied"
    else:
        prefix_hi = "✗ "
        prefix_en = "✗ "
        status_hi = "शर्त पूरी नहीं होती"
        status_en = "Requirement not met"

    # Bilingual natural text
    if rule.field == "age":
        if is_matched:
            evidence_hi = f"{prefix_hi}आपकी आयु {user_val} वर्ष है (नियम: {rule.description_hi or f'{rule.operator} {target_str}'})"
            evidence_en = f"{prefix_en}Your age is {user_val} (Required: {rule.description_en or f'{rule.operator} {target_str}'})"
        else:
            evidence_hi = f"{prefix_hi}आपकी आयु {user_val} वर्ष है, जबकि योजना के लिए {rule.description_hi or f'आयु {rule.operator} {target_str}'} आवश्यक है।"
            evidence_en = f"{prefix_en}Your age is {user_val}, but the scheme requires {rule.description_en or f'age {rule.operator} {target_str}'}."

    elif rule.field == "annual_income":
        if is_matched:
            evidence_hi = f"{prefix_hi}आपकी पारिवारिक वार्षिक आय {user_str} है (अधिकतम सीमा: {target_str})"
            evidence_en = f"{prefix_en}Your annual family income is {user_str} (Limit: {target_str})"
        else:
            evidence_hi = f"{prefix_hi}आपकी पारिवारिक वार्षिक आय {user_str} है, जो इस योजना की अधिकतम सीमा {target_str} से अधिक है।"
            evidence_en = f"{prefix_en}Your annual family income is {user_str}, which exceeds the scheme's limit of {target_str}."

    elif rule.field == "gender":
        if is_matched:
            evidence_hi = f"{prefix_hi}आपका लिंग {user_str} है ({rule.description_hi or f'आवश्यक: {target_str}'})"
            evidence_en = f"{prefix_en}Your gender is {user_str} ({rule.description_en or f'Required: {target_str}'})"
        else:
            evidence_hi = f"{prefix_hi}यह योजना केवल {target_str} वर्ग के लिए है (आपकी प्रोफाइल: {user_str})।"
            evidence_en = f"{prefix_en}This scheme is only for {target_str} beneficiaries (Your profile: {user_str})."

    elif rule.field == "category":
        if is_matched:
            evidence_hi = f"{prefix_hi}आपका वर्ग {user_str} है (मान्य वर्ग: {target_str})"
            evidence_en = f"{prefix_en}Your category is {user_str} (Eligible categories: {target_str})"
        else:
            evidence_hi = f"{prefix_hi}आपकी श्रेणी {user_str} है, जबकि यह योजना {target_str} वर्ग के लिए निर्दिष्ट है।"
            evidence_en = f"{prefix_en}Your category is {user_str}, while this scheme is specified for {target_str}."

    elif rule.field == "occupation":
        if is_matched:
            evidence_hi = f"{prefix_hi}आपका पेशा: {user_str} ({rule.description_hi or f'नियम: {target_str}'})"
            evidence_en = f"{prefix_en}Your occupation: {user_str} ({rule.description_en or f'Criteria: {target_str}'})"
        else:
            evidence_hi = f"{prefix_hi}आपका वर्तमान पेशा '{user_str}' है, जबकि यह योजना '{target_str}' हेतु है।"
            evidence_en = f"{prefix_en}Your current occupation is '{user_str}', but this scheme is for '{target_str}'."

    elif rule.field == "state":
        if is_matched:
            evidence_hi = f"{prefix_hi}आपका राज्य: {user_str} ({rule.description_hi or f'आवश्यक राज्य: {target_str}'})"
            evidence_en = f"{prefix_en}Your state: {user_str} ({rule.description_en or f'Applicable state: {target_str}'})"
        else:
            evidence_hi = f"{prefix_hi}यह योजना राज्य-विशिष्ट है ({target_str} के लिए), जबकि आपका राज्य '{user_str}' है।"
            evidence_en = f"{prefix_en}This is a state-specific scheme for {target_str}, whereas your state is '{user_str}'."

    elif rule.field == "ration_card_type":
        if is_matched:
            evidence_hi = f"{prefix_hi}राशन कार्ड: {user_str} (मान्य प्रकार: {target_str})"
            evidence_en = f"{prefix_en}Ration card: {user_str} (Eligible types: {target_str})"
        else:
            evidence_hi = f"{prefix_hi}आपके पास {user_str} राशन कार्ड है, जबकि योजना के लिए {target_str} कार्ड आवश्यक है।"
            evidence_en = f"{prefix_en}You have a {user_str} ration card, whereas {target_str} is required for this scheme."

    elif rule.field == "is_differently_abled":
        if is_matched:
            evidence_hi = f"{prefix_hi}दिव्यांग स्थिति: {user_str} (आवश्यक: हाँ)"
            evidence_en = f"{prefix_en}Disability status: {user_str} (Required: Yes)"
        else:
            evidence_hi = f"{prefix_hi}यह योजना विशेष रूप से दिव्यांगजन (Divyangjan) नागरिकों के लिए है।"
            evidence_en = f"{prefix_en}This scheme is specifically dedicated to persons with disabilities (Divyangjan)."

    else:
        if is_matched:
            evidence_hi = f"{prefix_hi}{field_display}: आपका विवरण '{user_str}' है ({rule.description_hi or target_str} - {status_hi})"
            evidence_en = f"{prefix_en}{field_display}: Your detail is '{user_str}' ({rule.description_en or target_str} - {status_en})"
        else:
            evidence_hi = f"{prefix_hi}{field_display}: आपका विवरण '{user_str}' है (नियम: {rule.description_hi or target_str} - {status_hi})"
            evidence_en = f"{prefix_en}{field_display}: Your detail is '{user_str}' (Criteria: {rule.description_en or target_str} - {status_en})"

    condition_str = f"{rule.field} {rule.operator} {rule.value}"

    return RuleMatchEvidence(
        field=rule.field,
        condition=condition_str,
        user_value=user_val,
        matched=is_matched,
        evidence_text_hi=evidence_hi,
        evidence_text_en=evidence_en,
    )


def generate_ineligibility_reasons(failing_rules: List[RuleMatchEvidence]) -> Tuple[List[str], List[str]]:
    """
    Extracts polite, bullet-point citizen-facing ineligibility reasons in Hindi and English.
    """
    reasons_hi = []
    reasons_en = []
    for f in failing_rules:
        # Strip leading symbol if present
        text_hi = f.evidence_text_hi.replace("✗ ", "").strip()
        text_en = f.evidence_text_en.replace("✗ ", "").strip()
        reasons_hi.append(text_hi)
        reasons_en.append(text_en)
    return reasons_hi, reasons_en


def generate_eligibility_result(profile: CitizenProfile, scheme: Scheme) -> EligibilityResult:
    """
    Evaluates a scheme against a citizen profile and generates a full explainability report,
    including Why You Qualify evidence, Why Ineligible reasons, and required documents.
    """
    eval_res = evaluate_scheme(profile, scheme)
    rule_results: List[Tuple[Rule, bool, Any, str]] = eval_res["rule_results"]

    matched_evidence_list: List[RuleMatchEvidence] = []
    failing_evidence_list: List[RuleMatchEvidence] = []

    for rule, is_matched, user_val, _ in rule_results:
        evidence = build_evidence(rule, user_val, is_matched)
        if is_matched:
            matched_evidence_list.append(evidence)
        else:
            failing_evidence_list.append(evidence)

    reasons_hi, reasons_en = generate_ineligibility_reasons(failing_evidence_list)

    return EligibilityResult(
        scheme_id=scheme.id,
        scheme_name_hi=scheme.name_hi,
        scheme_name_en=scheme.name_en,
        category=scheme.category,
        benefit_amount_text=scheme.benefit_amount_text,
        benefit_type=scheme.benefit_type,
        official_portal_url=scheme.official_portal_url,
        is_eligible=eval_res["is_eligible"],
        match_percentage=eval_res["match_percentage"],
        matched_rules=matched_evidence_list,
        failing_rules=failing_evidence_list,
        ineligibility_reasons_hi=reasons_hi,
        ineligibility_reasons_en=reasons_en,
        required_documents=scheme.documents,
    )
