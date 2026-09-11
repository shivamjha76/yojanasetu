"""
AI Benchmark Test Suite (Phase 4 Capstone)
Validates demographic entity extraction on 10 realistic citizen voice/text statements
across Hindi, Hinglish, and English dialects, verifying 100% schema adherence.

Rule: "We use AI to understand the citizen, NOT to make eligibility decisions."
"""

import pytest
from app.services.profile_extractor import profile_extractor
from app.models.schemas import CitizenProfile

BENCHMARK_CITIZEN_CASES = [
    {
        "id": "case_01_up_small_farmer",
        "description": "Small OBC farmer in Uttar Pradesh with modest income",
        "input": "Mera naam Ramesh Patel hai, UP ke Gorakhpur me kheti karta hu, 45 saal umar hai aur salana aamdani 80 hazar hai. OBC hu.",
        "expected": {
            "age": 45,
            "gender": "male",
            "state": "Uttar Pradesh",
            "occupation": "farmer",
            "category": "obc",
            "annual_income": 80000.0,
        },
    },
    {
        "id": "case_02_mp_married_homemaker",
        "description": "Married homemaker mother in Bhopal, Madhya Pradesh with BPL card",
        "input": "मैं मध्य प्रदेश के भोपाल से 32 वर्ष की महिला हूँ, घर संभालती हूँ और परिवार की आय 1.5 लाख है, बीपीएल कार्ड बना है।",
        "expected": {
            "age": 32,
            "gender": "female",
            "state": "Madhya Pradesh",
            "occupation": "homemaker",
            "annual_income": 150000.0,
            "ration_card_type": "bpl",
        },
    },
    {
        "id": "case_03_rajasthan_sc_student",
        "description": "Female SC college student from Rajasthan seeking scholarships",
        "input": "I am 20 years old girl from Jaipur Rajasthan studying in college, family income 2.5 lakh, SC category.",
        "expected": {
            "age": 20,
            "gender": "female",
            "state": "Rajasthan",
            "occupation": "student",
            "category": "sc",
            "annual_income": 250000.0,
        },
    },
    {
        "id": "case_04_jharkhand_divyang_youth",
        "description": "Differently-abled unemployed youth in Jharkhand with Antyodaya ration card",
        "input": "झारखंड से 28 साल का युवक हूँ, 40% दिव्यांग हूँ, बेरोजगार हूँ और अंत्योदय राशन कार्ड है, आय 40 हजार है।",
        "expected": {
            "age": 28,
            "gender": "male",
            "state": "Jharkhand",
            "is_differently_abled": True,
            "occupation": "unemployed",
            "annual_income": 40000.0,
        },
    },
    {
        "id": "case_05_delhi_street_vendor",
        "description": "Urban street vendor in Delhi earning daily wages",
        "input": "Main Delhi me sabzi ka thela lagata hu, umar 36 saal, mahine ka 12 hazar kamata hu.",
        "expected": {
            "age": 36,
            "state": "Delhi",
            "occupation": "daily_wage_laborer",
            "annual_income": 144000.0,
        },
    },
    {
        "id": "case_06_maharashtra_private_employee",
        "description": "Private sector salaried employee in Maharashtra",
        "input": "I am a 34 year old male living in Maharashtra working in a company earning 4.5 lakh annually.",
        "expected": {
            "age": 34,
            "gender": "male",
            "state": "Maharashtra",
            "occupation": "employed_private",
            "annual_income": 450000.0,
        },
    },
    {
        "id": "case_07_bihar_senior_citizen",
        "description": "Elderly senior citizen in Bihar seeking old age support",
        "input": "मेरी उम्र 68 वर्ष है, बिहार राज्य से हूँ, कोई काम नहीं कर पाता, बीपीएल राशन कार्ड है और आय 35 हजार है।",
        "expected": {
            "age": 68,
            "state": "Bihar",
            "annual_income": 35000.0,
        },
    },
    {
        "id": "case_08_gujarat_shopkeeper",
        "description": "Small shopkeeper/merchant in Gujarat",
        "input": "Main Gujarat se hu, 29 saal ka, meri kapde ki choti dukan hai, vyapar se salana kamai 2 lakh rupaye hai.",
        "expected": {
            "age": 29,
            "state": "Gujarat",
            "occupation": "business_self_employed",
            "annual_income": 200000.0,
        },
    },
    {
        "id": "case_09_chhattisgarh_unemployed_graduate",
        "description": "Young unemployed ST graduate in Chhattisgarh",
        "input": "Chhattisgarh se hu, 24 saal umar hai, berojgar hu aur job search kar raha hu, ST category se hu.",
        "expected": {
            "age": 24,
            "state": "Chhattisgarh",
            "occupation": "unemployed",
            "category": "st",
        },
    },
    {
        "id": "case_10_uttarakhand_mountain_farmer",
        "description": "Mountain farmer in Uttarakhand with low annual yield",
        "input": "मैं उत्तराखंड से 38 वर्ष का किसान हूँ, खेती करता हूँ और सालाना आय 60 हजार है।",
        "expected": {
            "age": 38,
            "state": "Uttarakhand",
            "occupation": "farmer",
            "annual_income": 60000.0,
        },
    },
]


@pytest.mark.parametrize("case", BENCHMARK_CITIZEN_CASES, ids=[c["id"] for c in BENCHMARK_CITIZEN_CASES])
def test_ai_benchmark_statement_extraction(case):
    """
    Tests extraction accuracy and guarantees 100% schema validity for all 10 realistic citizen voice statements.
    """
    result = profile_extractor.extract_profile(case["input"])

    # 1. Structural Guarantee
    assert isinstance(result.profile, CitizenProfile)
    assert 0 <= result.profile.age <= 120
    assert result.confidence_score >= 0.3

    # 2. Field Match Assertions
    expected = case["expected"]
    if "age" in expected:
        assert result.profile.age == expected["age"]
    if "gender" in expected:
        assert result.profile.gender == expected["gender"]
    if "state" in expected:
        assert result.profile.state == expected["state"]
    if "occupation" in expected:
        assert result.profile.occupation == expected["occupation"]
    if "category" in expected:
        assert result.profile.category == expected["category"]
    if "annual_income" in expected:
        assert result.profile.annual_income == expected["annual_income"]
    if "is_differently_abled" in expected:
        assert result.profile.is_differently_abled == expected["is_differently_abled"]
