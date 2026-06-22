import pytest
from app import create_app


@pytest.fixture
def client(monkeypatch):
    app = create_app()
    app.config["TESTING"] = True
    app.config["JWT_SECRET_KEY"] = "test-secret"
    app.config["ADMIN_EMAIL"] = "admin@smartdoor.local"
    app.config["ADMIN_PASSWORD"] = "smartdoor123!"

    with app.test_client() as client:
        yield client


def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@smartdoor.local",
        "password": "smartdoor123!"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert "access_token" in data["data"]


def test_login_fail(client):
    response = client.post("/api/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrong"
    })
    assert response.status_code == 401