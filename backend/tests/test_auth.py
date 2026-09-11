"""
Unit Tests for YojanaSetu Authentication, Registration, and User Profile
"""

import uuid
import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_and_login_flow():
    email = f"citizen_{uuid.uuid4().hex[:8]}@yojanasetu.gov.in"
    password = "secret_password_123"

    # 1. Register new user
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Ramesh Kumar",
            "phone": "9876543210",
            "state": "Rajasthan",
        },
    )
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email
    assert data["user"]["full_name"] == "Ramesh Kumar"
    assert data["user"]["state"] == "Rajasthan"

    token = data["access_token"]

    # 2. Duplicate registration should fail with 400
    dup_res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Ramesh Duplicate",
        },
    )
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"].lower()

    # 3. Login with correct credentials
    login_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == email

    # 4. Login with incorrect password should fail with 401
    bad_login = client.post(
        "/api/auth/login",
        json={"email": email, "password": "wrong_password"},
    )
    assert bad_login.status_code == 401

    # 5. Access /me endpoint with token
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

    # 6. Access /me endpoint without token should fail with 401
    no_auth_res = client.get("/api/auth/me")
    assert no_auth_res.status_code == 401

    # 7. Bookmark and get saved schemes
    save_res = client.post(
        "/api/auth/saved-schemes/pm-kisan",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert save_res.status_code == 200

    saved_list_res = client.get(
        "/api/auth/saved-schemes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert saved_list_res.status_code == 200
    saved_data = saved_list_res.json()
    assert "pm-kisan" in saved_data["scheme_ids"]

    # 8. Delete bookmark
    del_res = client.delete(
        "/api/auth/saved-schemes/pm-kisan",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_res.status_code == 200

    after_del = client.get(
        "/api/auth/saved-schemes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert "pm-kisan" not in after_del.json()["scheme_ids"]

    # 9. Save and retrieve citizen questionnaire details (My Details)
    details_payload = {
        "age": 28,
        "gender": "female",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "occupation": "farmer",
        "category": "obc",
        "annual_income": 180000.0,
        "marital_status": "married",
        "is_differently_abled": False,
        "ration_card_type": "bpl",
        "land_holding_acres": 1.5,
    }
    save_details_res = client.put(
        "/api/auth/citizen-details",
        json=details_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert save_details_res.status_code == 200
    user_after_details = save_details_res.json()
    assert user_after_details["citizen_details"] is not None
    assert user_after_details["citizen_details"]["annual_income"] == 180000.0
    assert user_after_details["citizen_details"]["occupation"] == "farmer"

    # 10. Verify /me also returns citizen_details
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["citizen_details"]["district"] == "Varanasi"


def test_family_members_crud_and_eligibility():
    email = f"family_test_{uuid.uuid4().hex[:8]}@yojanasetu.gov.in"
    password = "member_password_123"

    # Register user
    reg = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": "Anita Verma", "state": "Rajasthan"},
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Initially empty members list
    res = client.get("/api/auth/members", headers=headers)
    assert res.status_code == 200
    assert res.json() == []

    # 2. Add Father (Farmer)
    father_payload = {
        "name": "Ramesh Verma",
        "relationship": "father",
        "age": 58,
        "gender": "male",
        "state": "Rajasthan",
        "occupation": "farmer",
        "category": "obc",
        "annual_income": 120000.0,
        "land_holding_acres": 2.5,
        "ration_card_type": "bpl",
        "is_differently_abled": False,
    }
    create_res = client.post("/api/auth/members", json=father_payload, headers=headers)
    assert create_res.status_code == 201
    father = create_res.json()
    assert father["name"] == "Ramesh Verma"
    assert father["relationship"] == "father"
    assert father["age"] == 58
    father_id = father["id"]

    # 3. Add Sister (Student)
    sister_payload = {
        "name": "Kavita Verma",
        "relationship": "sister",
        "age": 20,
        "gender": "female",
        "state": "Rajasthan",
        "occupation": "student",
        "category": "obc",
        "annual_income": 0.0,
        "land_holding_acres": 0.0,
        "ration_card_type": "bpl",
        "is_differently_abled": False,
    }
    sister_res = client.post("/api/auth/members", json=sister_payload, headers=headers)
    assert sister_res.status_code == 201
    sister_id = sister_res.json()["id"]

    # 4. List members (should contain both)
    list_res = client.get("/api/auth/members", headers=headers)
    assert list_res.status_code == 200
    members = list_res.json()
    assert len(members) == 2
    assert any(m["relationship"] == "father" for m in members)
    assert any(m["relationship"] == "sister" for m in members)

    # 5. Read single member
    get_single = client.get(f"/api/auth/members/{father_id}", headers=headers)
    assert get_single.status_code == 200
    assert get_single.json()["name"] == "Ramesh Verma"

    # 6. Update member
    upd_res = client.put(
        f"/api/auth/members/{father_id}",
        json={"age": 59, "annual_income": 130000.0},
        headers=headers,
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["age"] == 59
    assert upd_res.json()["annual_income"] == 130000.0

    # 7. Check eligibility for Father (should qualify for farmer schemes like PM-KISAN)
    elig_res = client.get(f"/api/auth/members/{father_id}/eligibility", headers=headers)
    assert elig_res.status_code == 200
    elig_data = elig_res.json()
    assert elig_data["member_name"] == "Ramesh Verma"
    assert elig_data["eligible_count"] > 0
    scheme_ids = [s["scheme_id"] for s in elig_data["eligible_schemes"]]
    assert "pm-kisan" in scheme_ids

    # 8. Delete member
    del_res = client.delete(f"/api/auth/members/{sister_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 9. Verify sister is removed
    after_del = client.get("/api/auth/members", headers=headers)
    assert len(after_del.json()) == 1
    assert after_del.json()[0]["id"] == father_id


def test_details_persist_after_logout_and_relogin():
    email = f"persist_{uuid.uuid4().hex[:8]}@yojanasetu.gov.in"
    password = "secure_password_999"

    # 1. Register new citizen
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Kishan Lal",
            "state": "Rajasthan",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]

    # 2. Citizen fills and saves questionnaire details (My Details)
    details_payload = {
        "age": 42,
        "gender": "male",
        "state": "Rajasthan",
        "district": "Jodhpur",
        "area_type": "rural",
        "occupation": "farmer",
        "category": "obc",
        "annual_income": 150000.0,
        "ration_card_type": "bpl",
        "is_differently_abled": False,
        "land_holding_acres": 2.0,
    }
    save_res = client.put(
        "/api/auth/citizen-details",
        json=details_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert save_res.status_code == 200
    assert save_res.json()["citizen_details"]["occupation"] == "farmer"

    # Also bookmark a scheme
    client.post("/api/auth/saved-schemes/pm-kisan", headers={"Authorization": f"Bearer {token}"})

    # 3. Citizen logs out (session discarded on client)
    # 4. Citizen logs in again
    relogin_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert relogin_res.status_code == 200
    relogin_user = relogin_res.json()["user"]

    # Assert details are NOT lost or unsaved
    assert relogin_user["citizen_details"] is not None
    assert relogin_user["citizen_details"]["age"] == 42
    assert relogin_user["citizen_details"]["occupation"] == "farmer"
    assert relogin_user["citizen_details"]["district"] == "Jodhpur"
    assert relogin_user["citizen_details"]["annual_income"] == 150000.0

    # Verify new session token can access saved schemes
    new_token = relogin_res.json()["access_token"]
    saved_res = client.get("/api/auth/saved-schemes", headers={"Authorization": f"Bearer {new_token}"})
    assert "pm-kisan" in saved_res.json()["scheme_ids"]


