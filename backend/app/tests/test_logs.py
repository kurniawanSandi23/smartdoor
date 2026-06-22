import pytest
from app import create_app
import app.routes.logs as logs_module


class DummyExecuteResult:
    def __init__(self, data=None, count=None):
        self.data = data or []
        self.count = count


class DummyQuery:
    def __init__(self, data=None, count=None):
        self._data = data or []
        self._count = count

    def select(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def execute(self):
        return DummyExecuteResult(self._data, self._count)


class DummySupabase:
    def table(self, name):
        if name == "access_logs":
            return DummyQuery([{"id": "1", "status": "UNLOCKED"}], count=1)
        if name == "register_logs":
            return DummyQuery([{"id": "2", "status": "SUCCESS"}], count=1)
        if name == "spoofing_logs":
            return DummyQuery([{"id": "3", "spoof_type": "FAKE"}], count=1)
        if name == "door_events":
            return DummyQuery([{"id": "4", "event_type": "unlock"}], count=1)
        if name == "devices":
            return DummyQuery([{"id": "device-1"}], count=1)
        if name == "profiles":
            return DummyQuery([{"id": "user-1"}], count=1)
        return DummyQuery([], count=0)


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(logs_module, "supabase", DummySupabase())
    app = create_app()
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_dashboard_summary(client):
    response = client.get("/api/logs/dashboard-summary")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["data"]["total_users"] == 1