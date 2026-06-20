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
        "evidence",
        "agent_timeline",
        "graph",
    ):
        assert key in body

    assert body["appliance"] == "Washing machine"
    assert body["repair_plan"]
    assert body["graph"]["nodes"]
    assert body["graph"]["edges"]

    # The drain scenario should retrieve evidence and rank the filter first.
    assert body["evidence"]
    assert body["likely_causes"][0]["name"] == "Blocked drain filter"
    assert {event["id"] for event in body["agent_timeline"]} >= {
        "intake",
        "retrieval",
        "triage",
        "planner",
        "safety",
        "impact",
    }


def test_diagnose_unknown_appliance_falls_back():
    payload = {"appliance": "Toaster", "issue": "Will not heat up"}

    response = client.post("/api/diagnose", json=payload)
    assert response.status_code == 200

    body = response.json()
    assert body["appliance"] == "Toaster"
    assert body["likely_causes"]
    assert body["repair_plan"]
    assert body["safety_warnings"]
