"""
Metadata API Routes
Provides categories, states, and demographic lookup values for frontend dropdowns and filters.
"""

from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.scheme_service import scheme_service

router = APIRouter()

# Rich category dictionary with bilingual display and icon mappings
CATEGORY_METADATA = {
    "agriculture": {
        "name_en": "Agriculture & Farming",
        "name_hi": "कृषि एवं किसान कल्याण",
        "icon": "Sprout",
        "color": "#16a34a",
    },
    "education_scholarships": {
        "name_en": "Education & Scholarships",
        "name_hi": "शिक्षा एवं छात्रवृत्ति",
        "icon": "GraduationCap",
        "color": "#2563eb",
    },
    "healthcare": {
        "name_en": "Healthcare & Wellness",
        "name_hi": "स्वास्थ्य एवं चिकित्सा",
        "icon": "HeartPulse",
        "color": "#e11d48",
    },
    "women_child": {
        "name_en": "Women & Child Development",
        "name_hi": "महिला एवं बाल विकास",
        "icon": "Baby",
        "color": "#db2777",
    },
    "housing_urban": {
        "name_en": "Housing & Shelter",
        "name_hi": "आवास एवं बुनियादी सुविधाएं",
        "icon": "Home",
        "color": "#d97706",
    },
    "business_msme_loans": {
        "name_en": "Business & MSME Loans",
        "name_hi": "व्यवसाय एवं स्वरोजगार लोन",
        "icon": "Briefcase",
        "color": "#0284c7",
    },
    "skills_employment": {
        "name_en": "Skills & Employment",
        "name_hi": "कौशल विकास एवं रोजगार",
        "icon": "Wrench",
        "color": "#7c3aed",
    },
    "social_security_pensions": {
        "name_en": "Social Security & Pensions",
        "name_hi": "सामाजिक सुरक्षा एवं पेंशन",
        "icon": "Shield",
        "color": "#4b5563",
    },
}

ALL_INDIAN_STATES = [
    "All India",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
]

OCCUPATIONS_METADATA = [
    {"id": "student", "name_en": "Student", "name_hi": "विद्यार्थी / छात्र", "icon": "BookOpen"},
    {"id": "farmer", "name_en": "Farmer / Agriculturist", "name_hi": "किसान / कृषक", "icon": "Tractor"},
    {"id": "unemployed", "name_en": "Unemployed / Job Seeker", "name_hi": "बेरोजगार / रोजगार की तलाश", "icon": "Search"},
    {"id": "employed_private", "name_en": "Employed (Private Sector)", "name_hi": "निजी क्षेत्र में कार्यरत", "icon": "Building"},
    {"id": "employed_government", "name_en": "Employed (Government)", "name_hi": "सरकारी कर्मचारी", "icon": "Landmark"},
    {"id": "business_self_employed", "name_en": "Small Business / Self-Employed", "name_hi": "छोटा व्यापारी / स्वरोजगारी", "icon": "Store"},
    {"id": "homemaker", "name_en": "Homemaker", "name_hi": "गृहणी", "icon": "Smile"},
    {"id": "daily_wage_laborer", "name_en": "Daily Wage Laborer / Artisan", "name_hi": "दैनिक वेतनभोगी / कारीगर / मजदूर", "icon": "Hammer"},
    {"id": "other", "name_en": "Other", "name_hi": "अन्य", "icon": "User"},
]


class CategoryItem(BaseModel):
    id: str
    name_en: str
    name_hi: str
    icon: str
    color: str
    scheme_count: int


class MetadataCategoriesResponse(BaseModel):
    total_categories: int
    categories: List[CategoryItem]


class StateItem(BaseModel):
    name: str
    has_state_schemes: bool


class MetadataStatesResponse(BaseModel):
    total_states: int
    states: List[StateItem]


@router.get(
    "/metadata/categories",
    response_model=MetadataCategoriesResponse,
    summary="Get all welfare categories with counts and icons",
)
def get_categories():
    counts_summary = scheme_service.get_categories_summary()
    counts_map = {item["category"]: item["count"] for item in counts_summary}

    categories = []
    for cat_id, meta in CATEGORY_METADATA.items():
        categories.append(
            CategoryItem(
                id=cat_id,
                name_en=meta["name_en"],
                name_hi=meta["name_hi"],
                icon=meta["icon"],
                color=meta["color"],
                scheme_count=counts_map.get(cat_id, 0),
            )
        )

    return MetadataCategoriesResponse(
        total_categories=len(categories),
        categories=categories,
    )


@router.get(
    "/metadata/states",
    response_model=MetadataStatesResponse,
    summary="Get list of all Indian States & UTs with scheme indicator",
)
def get_states():
    states_with_schemes = set(scheme_service.get_states_summary())

    state_items = [
        StateItem(
            name=st,
            has_state_schemes=(st in states_with_schemes),
        )
        for st in ALL_INDIAN_STATES
    ]

    return MetadataStatesResponse(
        total_states=len(state_items),
        states=state_items,
    )


@router.get(
    "/metadata/occupations",
    summary="Get list of standard occupations for eligibility wizard",
)
def get_occupations():
    return {
        "total_occupations": len(OCCUPATIONS_METADATA),
        "occupations": OCCUPATIONS_METADATA,
    }
