"""Diagnosis orchestrator.

Runs the deterministic agent pipeline in sequence — intake -> retrieval ->
diagnosis -> planner -> sustainability -> safety -> graph_builder — recording an
event per agent, then assembles the response. The router calls only this seam.
"""

from app.schemas import DiagnoseRequest, DiagnoseResponse, TimelineEvent
from app.services import (
    graph_builder,
    planner,
    retrieval,
    safety,
    sustainability,
)
from app.services.diagnosis import diagnose
from app.services.intake import run_intake


def run_pipeline(request: DiagnoseRequest) -> DiagnoseResponse:
    events: list[TimelineEvent] = []

    intake = run_intake(request)
    events.append(
        TimelineEvent(
            id="intake",
            agent="Intake Agent",
            action="Parsed appliance, symptoms, and skill level",
            status="complete",
            detail=f"Routed the request to scenario '{intake.scenario}'.",
        )
    )

    evidence = retrieval.retrieve_evidence(intake)
    events.append(
        TimelineEvent(
            id="retrieval",
            agent="Retrieval Agent",
            action="Retrieved manual evidence",
            status="complete",
            detail=f"Pulled {len(evidence)} manual snippet(s) from the service knowledge base.",
        )
    )

    diagnosis = diagnose(intake, evidence)
    top_cause = diagnosis.causes[0].name if diagnosis.causes else "no clear cause"
    events.append(
        TimelineEvent(
            id="triage",
            agent="Triage Agent",
            action="Ranked likely causes",
            status="complete",
            detail=f"Ranked {len(diagnosis.causes)} cause(s); most likely: {top_cause}.",
        )
    )

    repair_plan = planner.build_plan(intake, diagnosis)
    events.append(
        TimelineEvent(
            id="planner",
            agent="Planner Agent",
            action="Built the guided repair plan",
            status="complete",
            detail=f"Sequenced {len(repair_plan)} repair step(s) for a {intake.skill_level} user.",
        )
    )

    warnings = safety.screen_safety(intake, diagnosis, repair_plan)
    events.append(
        TimelineEvent(
            id="safety",
            agent="Safety Agent",
            action="Screened the plan for household risk",
            status="warning" if warnings else "complete",
            detail=f"Flagged {len(warnings)} safety warning(s) for human review.",
        )
    )

    impact = sustainability.estimate_impact(intake)
    events.append(
        TimelineEvent(
            id="impact",
            agent="Impact Agent",
            action="Estimated repair vs replace",
            status="complete",
            detail=(
                f"Avoided about {impact.landfill_waste_avoided_kg} kg of waste and "
                f"{impact.co2_saved_kg} kg CO2 versus replacement."
            ),
        )
    )

    graph = graph_builder.build_graph(intake, diagnosis)

    return DiagnoseResponse(
        appliance=intake.appliance,
        issue=intake.issue,
        recommendation=diagnosis.recommendation,
        likely_causes=diagnosis.causes,
        repair_plan=repair_plan,
        sustainability_impact=impact,
        safety_warnings=warnings,
        evidence=evidence,
        agent_timeline=events,
        graph=graph,
    )
