"""Safety agent: surface the human-in-the-loop warnings for the plan."""

from app.schemas import RepairStep
from app.services.datastore import load
from app.services.diagnosis import Diagnosis
from app.services.intake import Intake


def screen_safety(
    intake: Intake, diagnosis: Diagnosis, plan: list[RepairStep]
) -> list[str]:
    knowledge_base = load("knowledge_base")
    scenario = knowledge_base.get(intake.scenario, knowledge_base["generic"])
    return list(scenario.get("safety", []))
