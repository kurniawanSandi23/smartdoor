import pytest
from app import create_app
import app.routes.users as users_module


class DummyExecuteResult:
    def __init__(self, data=None):
        self.data = data or []


class DummyQuery:
    def __init__(self, data=None):
        self._data = data or []

    def select(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def update(self, *args, **kwargs):
        return self

    def upsert(self, *args, **kwargs):
        return self

    def delete(self, *args, **kwargs):
        return self

    def execute(self):
        return DummyExecuteResult(self._data)


class DummySupabase:
    def table(self, name):
        if name == "profiles":
            return DummyQuery([{
                "id": "user-1",
                "full_name": "Test User",
                "email": "user@test.local"
            }])
        if name == "registered_faces":
            return DummyQuery([{
                "id": "face-1",
                "profile_id": "user-1"
            }])
        return DummyQuery([])


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(users_module, "supabase", DummySupabase())
    app = create_app()
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_list_users(client):
    response = client.get("/api/users/")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"


def test_get_user_faces(client):
    response = client.get("/api/users/user-1/faces")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"