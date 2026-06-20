from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_diagnose_returns_full_demo_shape():
    payload = {
        "appliance": "Washing machine",
        "issue": "The washing machine does not drain",
        "symptoms": ["Standing water remains after cycle"],
        "skill_level": "beginner",
    }

    response = client.post("/api/diagnose", json=payload)
    assert response.status_code == 200

    body = response.json()
    for key in (
        "recommendation",
        "likely_causes",
        "repair_plan",
        "sustainability_impact",
        "safety_warnings",
        "agent_timeline",
        "graph",
    ):
        assert key in body

    assert body["appliance"] == "Washing machine"
    assert body["repair_plan"]
    assert body["graph"]["nodes"]
    assert body["graph"]["edges"]
