"""
Unit tests for SchemeService repository and search engine.
"""

from app.services import scheme_service


def test_scheme_service_loads_all():
    schemes = scheme_service.get_all()
    assert len(schemes) == 15


def test_get_by_id():
    kisan = scheme_service.get_by_id("pm-kisan")
    assert kisan is not None
    assert "PM-KISAN" in kisan.name_en

    # Case insensitivity test
    kisan_caps = scheme_service.get_by_id("PM-KISAN")
    assert kisan_caps is not None
    assert kisan_caps.id == "pm-kisan"

    # Nonexistent ID
    none_res = scheme_service.get_by_id("non-existent-scheme")
    assert none_res is None


def test_search_by_query():
    # English keyword
    results, total = scheme_service.search(query="scholarship")
    assert total >= 2
    assert all("scholarship" in s.name_en.lower() or "scholarship" in s.short_summary_en.lower() or "scholarship" in s.category for s in results)

    # Hindi keyword
    res_hi, total_hi = scheme_service.search(query="किसान")
    assert total_hi >= 1
    assert any("pm-kisan" == s.id for s in res_hi)


def test_filter_by_category():
    results, total = scheme_service.search(category="healthcare")
    assert total >= 1
    assert all(s.category == "healthcare" for s in results)


def test_filter_by_state():
    # Madhya Pradesh should include all Central schemes + MP state scheme (Ladli Behna)
    mp_schemes, mp_total = scheme_service.search(state="Madhya Pradesh")
    assert any(s.id == "ladli-behna-yojana-mp" for s in mp_schemes)

    # Rajasthan should include central schemes but NOT MP state scheme
    rj_schemes, rj_total = scheme_service.search(state="Rajasthan")
    assert not any(s.id == "ladli-behna-yojana-mp" for s in rj_schemes)


def test_pagination():
    page_1, total = scheme_service.search(limit=5, offset=0)
    assert len(page_1) == 5
    assert total == 15

    page_2, total = scheme_service.search(limit=5, offset=5)
    assert len(page_2) == 5
    assert page_1[0].id != page_2[0].id


def test_metadata_summaries():
    cats = scheme_service.get_categories_summary()
    assert len(cats) > 0
    assert any(c["category"] == "agriculture" for c in cats)

    states = scheme_service.get_states_summary()
    assert "Madhya Pradesh" in states
