"""Planner agent: assemble the ordered repair plan for the scenario."""

from app.schemas import RepairStep
from app.services.datastore import load
from app.services.diagnosis import Diagnosis
from app.services.intake import Intake


def build_plan(intake: Intake, diagnosis: Diagnosis) -> list[RepairStep]:
    knowledge_base = load("knowledge_base")
    scenario = knowledge_base.get(intake.scenario, knowledge_base["generic"])

    return [
        RepairStep(
            step=index,
            title=step["title"],
            detail=step["detail"],
            tools=step.get("tools", []),
        )
        for index, step in enumerate(scenario["repair_plan"], start=1)
    ]
