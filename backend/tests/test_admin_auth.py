import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.admin import AdminUser
from app.utils.security import hash_password

@pytest.fixture
def created_admin(db: Session):
    """Create and return an admin user in the database."""
    admin_uuid = str(uuid.uuid4())
    admin = AdminUser(
        uuid=admin_uuid,
        email="admin@plantcare.com",
        password_hash=hash_password("Admin123!"),
        first_name="Admin",
        last_name="User",
        role="super_admin",
        is_active=True,
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)
    return {"email": "admin@plantcare.com", "password": "Admin123!", "uuid": admin.uuid}


def test_admin_login_success(client: TestClient, created_admin):
    resp = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": created_admin["password"],
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "super_admin"
    assert data["first_name"] == "Admin"
    assert data["last_name"] == "User"


def test_admin_login_invalid_password(client: TestClient, created_admin):
    resp = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": "wrongpassword",
    })
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid email or password."


def test_admin_get_me(client: TestClient, created_admin):
    # 1. Login
    login_resp = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": created_admin["password"],
    })
    token = login_resp.json()["access_token"]

    # 2. Get profile
    resp = client.get("/api/v1/admin/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "admin@plantcare.com"
    assert data["role"] == "super_admin"
    assert data["first_name"] == "Admin"
    assert data["last_name"] == "User"


def test_admin_logout(client: TestClient, created_admin):
    login_resp = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": created_admin["password"],
    })
    assert login_resp.status_code == 200

    resp = client.post("/api/v1/admin/auth/logout", cookies=login_resp.cookies)
    assert resp.status_code == 200
    assert resp.json()["message"] == "Logged out."


def test_admin_change_password_success(client: TestClient, created_admin):
    # 1. Login
    login_resp = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": created_admin["password"],
    })
    token = login_resp.json()["access_token"]

    # 2. Change password
    resp = client.post(
        "/api/v1/admin/auth/change-password",
        json={
            "old_password": created_admin["password"],
            "new_password": "NewSecretPassword123!",
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["message"] == "Password changed successfully."

    # 3. Test logging in with old password (should fail)
    login_old = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": created_admin["password"],
    })
    assert login_old.status_code == 401

    # 4. Test logging in with new password (should succeed)
    login_new = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": "NewSecretPassword123!",
    })
    assert login_new.status_code == 200


def test_admin_change_password_invalid_old(client: TestClient, created_admin):
    # 1. Login
    login_resp = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": created_admin["password"],
    })
    token = login_resp.json()["access_token"]

    # 2. Change password with wrong old password
    resp = client.post(
        "/api/v1/admin/auth/change-password",
        json={
            "old_password": "incorrect_old_password",
            "new_password": "NewSecretPassword123!",
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Invalid old password."


def test_admin_change_password_too_short(client: TestClient, created_admin):
    # 1. Login
    login_resp = client.post("/api/v1/admin/auth/login", json={
        "email": created_admin["email"],
        "password": created_admin["password"],
    })
    token = login_resp.json()["access_token"]

    # 2. Change password with too short new password
    resp = client.post(
        "/api/v1/admin/auth/change-password",
        json={
            "old_password": created_admin["password"],
            "new_password": "short",
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 422

