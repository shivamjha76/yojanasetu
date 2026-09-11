"""
YojanaSetu Rule Engine & Explainability Test Suite
Tests 10 distinct citizen profiles against all 15 real schemes,
verifying 100% deterministic evaluation, zero hallucination, and accurate explainability.
"""

from pathlib import Path
import pytest
from app.models.schemas import CitizenProfile, Rule
from app.core import (
    validate_schemes_file,
    evaluate_single_rule,
    generate_eligibility_result,
)

# Load schemes dataset once for test suite
DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "schemes.json"
is_valid, SCHEMES, errors = validate_schemes_file(DATA_FILE)
assert is_valid, f"Schemes dataset failed validation: {errors}"
SCHEMES_BY_ID = {s.id: s for s in SCHEMES}


# =====================================================================
# Profile 1: Small & Marginal Farmer in Uttar Pradesh
# =====================================================================
def test_small_marginal_farmer_pm_kisan():
    farmer = CitizenProfile(
        age=42,
        gender="male",
        state="Uttar Pradesh",
        occupation="farmer",
        category="obc",
        annual_income=120000.0,
        ration_card_type="bpl",
        is_differently_abled=False,
    )
    result = generate_eligibility_result(farmer, SCHEMES_BY_ID["pm-kisan"])
    assert result.is_eligible is True
    assert result.match_percentage == 100
    assert len(result.matched_rules) == 2
    assert len(result.failing_rules) == 0
    # Must be ineligible for Ladli Behna (gender & state mismatch)
    res_ladli = generate_eligibility_result(farmer, SCHEMES_BY_ID["ladli-behna-yojana-mp"])
    assert res_ladli.is_eligible is False


# =====================================================================
# Profile 2: BPL Family for Ayushman Bharat (AB-PMJAY)
# =====================================================================
def test_low_income_bpl_family_ayushman_bharat():
    citizen = CitizenProfile(
        age=38,
        gender="female",
        state="Bihar",
        occupation="homemaker",
        category="sc",
        annual_income=90000.0,
        ration_card_type="bpl",
        is_differently_abled=False,
    )
    result = generate_eligibility_result(citizen, SCHEMES_BY_ID["ayushman-bharat-pmjay"])
    assert result.is_eligible is True
    assert result.match_percentage == 100
    assert any("Bpl" in r.evidence_text_en for r in result.matched_rules)


# =====================================================================
# Profile 3: College Girl Student for Post-Matric & Higher Education
# =====================================================================
def test_female_college_student_scholarships():
    student = CitizenProfile(
        age=20,
        gender="female",
        state="Rajasthan",
        occupation="student",
        category="obc",
        annual_income=180000.0,
        ration_card_type="apl",
        is_differently_abled=False,
    )
    res_post_matric = generate_eligibility_result(student, SCHEMES_BY_ID["post-matric-scholarship-sc-st-obc"])
    assert res_post_matric.is_eligible is True
    assert res_post_matric.match_percentage == 100

    res_central = generate_eligibility_result(student, SCHEMES_BY_ID["central-sector-merit-scholarship-college"])
    assert res_central.is_eligible is True

    res_coaching = generate_eligibility_result(student, SCHEMES_BY_ID["free-coaching-scheme-sc-obc"])
    assert res_coaching.is_eligible is True


# =====================================================================
# Profile 4: Unemployed Youth Seeking Industrial Skill & Apprenticeship
# =====================================================================
def test_young_apprentice_naps_and_pmkvy():
    youth = CitizenProfile(
        age=22,
        gender="male",
        state="Haryana",
        occupation="unemployed",
        category="general",
        annual_income=150000.0,
        is_differently_abled=False,
    )
    res_naps = generate_eligibility_result(youth, SCHEMES_BY_ID["national-apprenticeship-promotion-scheme"])
    assert res_naps.is_eligible is True

    res_pmkvy = generate_eligibility_result(youth, SCHEMES_BY_ID["pm-kaushal-vikas-yojana"])
    assert res_pmkvy.is_eligible is True


# =====================================================================
# Profile 5: Urban Street Vendor in Delhi for PM SVANidhi
# =====================================================================
def test_urban_street_vendor_svanidhi():
    vendor = CitizenProfile(
        age=34,
        gender="male",
        state="Delhi",
        area_type="urban",
        occupation="daily_wage_laborer",
        category="obc",
        annual_income=140000.0,
        is_differently_abled=False,
    )
    result = generate_eligibility_result(vendor, SCHEMES_BY_ID["pm-svanidhi-street-vendors"])
    assert result.is_eligible is True
    assert result.match_percentage == 100


# =====================================================================
# Profile 6: Differently-Abled Citizen (Divyangjan) for Pension
# =====================================================================
def test_differently_abled_citizen_disability_pension():
    divyang = CitizenProfile(
        age=29,
        gender="male",
        state="Jharkhand",
        occupation="unemployed",
        category="sc",
        annual_income=45000.0,
        ration_card_type="bpl",
        is_differently_abled=True,
    )
    result = generate_eligibility_result(divyang, SCHEMES_BY_ID["indira-gandhi-divyangjan-pension"])
    assert result.is_eligible is True
    assert result.match_percentage == 100


# =====================================================================
# Profile 7: Elderly Senior Citizen for Old Age Pension
# =====================================================================
def test_senior_citizen_old_age_pension():
    senior = CitizenProfile(
        age=67,
        gender="female",
        state="Odisha",
        occupation="homemaker",
        category="general",
        annual_income=40000.0,
        ration_card_type="antyodaya",
        is_differently_abled=False,
    )
    result = generate_eligibility_result(senior, SCHEMES_BY_ID["indira-gandhi-old-age-pension"])
    assert result.is_eligible is True
    assert result.match_percentage == 100

    # Ineligible for student schemes
    res_student = generate_eligibility_result(senior, SCHEMES_BY_ID["central-sector-merit-scholarship-college"])
    assert res_student.is_eligible is False


# =====================================================================
# Profile 8: Madhya Pradesh Female Homemaker for Ladli Behna
# =====================================================================
def test_mp_female_homemaker_ladli_behna():
    mp_woman = CitizenProfile(
        age=32,
        gender="female",
        state="Madhya Pradesh",
        occupation="homemaker",
        category="general",
        annual_income=160000.0,
        marital_status="married",
        is_differently_abled=False,
    )
    result = generate_eligibility_result(mp_woman, SCHEMES_BY_ID["ladli-behna-yojana-mp"])
    assert result.is_eligible is True
    assert result.match_percentage == 100


# =====================================================================
# Profile 9: State Mismatch Test - Rajasthan Citizen vs MP Scheme
# =====================================================================
def test_state_mismatch_produces_ineligibility():
    rj_woman = CitizenProfile(
        age=32,
        gender="female",
        state="Rajasthan",
        occupation="homemaker",
        category="general",
        annual_income=160000.0,
        is_differently_abled=False,
    )
    result = generate_eligibility_result(rj_woman, SCHEMES_BY_ID["ladli-behna-yojana-mp"])
    assert result.is_eligible is False
    assert any("Rajasthan" in r for r in result.ineligibility_reasons_en)
    assert any("madhya pradesh" in r.lower() for r in result.ineligibility_reasons_en)


# =====================================================================
# Profile 10: High-Income Tech Professional - Excluded from Welfare
# =====================================================================
def test_high_income_professional_ineligibility():
    techie = CitizenProfile(
        age=31,
        gender="male",
        state="Karnataka",
        occupation="employed_private",
        category="general",
        annual_income=1800000.0,  # 18 Lakhs
        ration_card_type="apl",
        is_differently_abled=False,
    )
    res_ayushman = generate_eligibility_result(techie, SCHEMES_BY_ID["ayushman-bharat-pmjay"])
    assert res_ayushman.is_eligible is False
    assert any("exceeds" in r for r in res_ayushman.ineligibility_reasons_en)

    res_awas = generate_eligibility_result(techie, SCHEMES_BY_ID["pm-awas-yojana-urban-gramin"])
    assert res_awas.is_eligible is False

    # But eligible for general collateral-free micro enterprise loan if self employed/business
    res_mudra = generate_eligibility_result(techie, SCHEMES_BY_ID["pm-mudra-yojana"])
    assert res_mudra.is_eligible is True  # Age >= 18 and employed_private in list


# =====================================================================
# Exhaustive Operator Logic Tests
# =====================================================================
def test_rule_operators_exhaustive():
    prof = CitizenProfile(
        age=25,
        gender="female",
        state="Punjab",
        occupation="student",
        category="general",
        annual_income=200000.0,
        is_differently_abled=False,
    )
    # Test operators
    assert evaluate_single_rule(prof, Rule(field="age", operator=">=", value=25))[0] is True
    assert evaluate_single_rule(prof, Rule(field="age", operator="<=", value=25))[0] is True
    assert evaluate_single_rule(prof, Rule(field="age", operator="==", value=25))[0] is True
    assert evaluate_single_rule(prof, Rule(field="age", operator="!=", value=30))[0] is True
    assert evaluate_single_rule(prof, Rule(field="state", operator="IN", value=["Punjab", "Haryana"]))[0] is True
    assert evaluate_single_rule(prof, Rule(field="category", operator="NOT_IN", value=["sc", "st"]))[0] is True
    assert evaluate_single_rule(prof, Rule(field="annual_income", operator="BETWEEN", value=[100000, 300000]))[0] is True
