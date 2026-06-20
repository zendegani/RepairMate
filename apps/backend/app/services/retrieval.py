"""Retrieval agent: pull supporting manual snippets for the scenario's causes."""

from app.schemas import Evidence
from app.services.datastore import load
from app.services.intake import Intake


def retrieve_evidence(intake: Intake) -> list[Evidence]:
    knowledge_base = load("knowledge_base")
    manuals = load("manuals")
    scenario = knowledge_base.get(intake.scenario, knowledge_base["generic"])

    evidence: list[Evidence] = []
    for cause in scenario["causes"]:
        ref = cause.get("manual")
        if ref and ref in manuals:
            manual = manuals[ref]
            evidence.append(
                Evidence(
                    id=ref,
                    source=manual["source"],
                    snippet=manual["snippet"],
                    supports=cause["name"],
                )
            )
    return evidence
