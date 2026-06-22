import pytest
from app import create_app
import app.routes.devices as devices_module


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

    def execute(self):
        return DummyExecuteResult(self._data)


class DummySupabase:
    def table(self, name):
        if name == "devices":
            return DummyQuery([{
                "id": "device-1",
                "device_name": "Pi Door",
                "status": "online"
            }])
        return DummyQuery([])


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(devices_module, "supabase", DummySupabase())
    app = create_app()
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_list_devices(client):
    response = client.get("/api/devices/")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)