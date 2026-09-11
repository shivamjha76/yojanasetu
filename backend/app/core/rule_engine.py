"""
YojanaSetu Deterministic Rule Engine
The Heart of the Platform - 100% Deterministic Rule Evaluation (Zero Hallucination).
Evaluates citizen profiles against scheme criteria using boolean, numerical, and set operators.
"""

from typing import Any, Tuple, List, Dict
from app.models.schemas import CitizenProfile, Rule, Scheme, RuleMatchEvidence


def _normalize_value(val: Any) -> Any:
    """Normalizes strings for case-insensitive and whitespace-trimmed comparisons."""
    if isinstance(val, str):
        return val.strip().lower()
    if isinstance(val, list):
        return [_normalize_value(x) for x in val]
    return val


def get_profile_field_value(profile: CitizenProfile, field_name: str) -> Any:
    """
    Extracts the field value from CitizenProfile with graceful fallbacks.
    Returns None if the field is not present or set to None.
    """
    field_lower = field_name.strip().lower()

    # Direct attribute lookup
    if hasattr(profile, field_lower):
        return getattr(profile, field_lower)

    # Dictionary lookup fallback
    profile_dict = profile.model_dump()
    if field_lower in profile_dict:
        return profile_dict[field_lower]

    return None


def evaluate_single_rule(profile: CitizenProfile, rule: Rule) -> Tuple[bool, Any, str]:
    """
    Evaluates a single rule against a citizen's profile.
    Returns: (is_matched, user_actual_value, condition_summary_string)
    """
    user_val = get_profile_field_value(profile, rule.field)
    operator = rule.operator.upper().strip()
    target_val = rule.value

    # If user value is None for a required rule test
    if user_val is None:
        return False, None, f"{rule.field} is missing"

    norm_user = _normalize_value(user_val)
    norm_target = _normalize_value(target_val)

    try:
        if operator == ">=":
            matched = float(norm_user) >= float(norm_target)
            cond = f">= {target_val}"
        elif operator == "<=":
            matched = float(norm_user) <= float(norm_target)
            cond = f"<= {target_val}"
        elif operator == "==":
            matched = norm_user == norm_target
            cond = f"== {target_val}"
        elif operator == "!=":
            matched = norm_user != norm_target
            cond = f"!= {target_val}"
        elif operator == "IN":
            if isinstance(norm_target, list):
                matched = norm_user in norm_target
            else:
                matched = norm_user == norm_target
            cond = f"IN {target_val}"
        elif operator == "NOT_IN":
            if isinstance(norm_target, list):
                matched = norm_user not in norm_target
            else:
                matched = norm_user != norm_target
            cond = f"NOT IN {target_val}"
        elif operator == "BETWEEN":
            if isinstance(target_val, (list, tuple)) and len(target_val) == 2:
                low, high = float(target_val[0]), float(target_val[1])
                matched = low <= float(norm_user) <= high
                cond = f"BETWEEN {low} and {high}"
            else:
                matched = False
                cond = f"INVALID_RANGE {target_val}"
        else:
            matched = False
            cond = f"UNKNOWN_OPERATOR {operator}"

        return matched, user_val, cond

    except (ValueError, TypeError):
        # Type mismatch (e.g. comparing string to number)
        return False, user_val, f"TYPE_MISMATCH ({rule.field}: {user_val} vs {target_val})"


def evaluate_scheme(profile: CitizenProfile, scheme: Scheme) -> Dict[str, Any]:
    """
    Evaluates all rules for a specific scheme against a citizen profile.
    Returns:
    {
        "scheme": scheme,
        "is_eligible": bool,
        "match_percentage": int (0 to 100),
        "total_rules": int,
        "passed_rules_count": int,
        "rule_results": List[Tuple[Rule, bool, Any, str]]
    }
    """
    if not scheme.rules:
        # If a scheme has no rules, everyone qualifies
        return {
            "scheme": scheme,
            "is_eligible": True,
            "match_percentage": 100,
            "total_rules": 0,
            "passed_rules_count": 0,
            "rule_results": [],
        }

    rule_results = []
    passed_count = 0

    # Also check applicable_state if it's a state scheme
    if scheme.level == "state" and scheme.applicable_state:
        state_rule = Rule(
            field="state",
            operator="==",
            value=scheme.applicable_state,
            description_hi=f"आवेदक {scheme.applicable_state} का मूल निवासी होना चाहिए",
            description_en=f"Applicant must be resident of {scheme.applicable_state}",
        )
        matched, u_val, cond = evaluate_single_rule(profile, state_rule)
        rule_results.append((state_rule, matched, u_val, cond))
        if matched:
            passed_count += 1
    
    for r in scheme.rules:
        # If we already added a state rule above and this rule is also for state, avoid duplicate check
        if r.field == "state" and scheme.level == "state" and scheme.applicable_state:
            continue
        matched, u_val, cond = evaluate_single_rule(profile, r)
        rule_results.append((r, matched, u_val, cond))
        if matched:
            passed_count += 1

    total_rules = len(rule_results)
    is_eligible = (passed_count == total_rules)
    match_percentage = int((passed_count / total_rules) * 100) if total_rules > 0 else 100

    return {
        "scheme": scheme,
        "is_eligible": is_eligible,
        "match_percentage": match_percentage,
        "total_rules": total_rules,
        "passed_rules_count": passed_count,
        "rule_results": rule_results,
    }
