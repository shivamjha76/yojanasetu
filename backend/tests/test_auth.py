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
