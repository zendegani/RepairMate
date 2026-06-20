"""Diagnosis agent: rank likely causes and pick the recommendation."""

from dataclasses import dataclass

from app.schemas import Cause, Evidence, Recommendation
from app.services.datastore import load
from app.services.intake import Intake

LIKELIHOOD_RANK = {"High": 0, "Medium": 1, "Low": 2}


@dataclass
class Diagnosis:
    recommendation: Recommendation
    causes: list[Cause]


def diagnose(intake: Intake, evidence: list[Evidence]) -> Diagnosis:
    knowledge_base = load("knowledge_base")
    scenario = knowledge_base.get(intake.scenario, knowledge_base["generic"])

    recommendation = Recommendation(**scenario["recommendation"])

    causes = [
        Cause(name=c["name"], likelihood=c["likelihood"], evidence=c["evidence"])
        for c in scenario["causes"]
    ]
    causes.sort(key=lambda cause: LIKELIHOOD_RANK.get(cause.likelihood, 9))

    # Corroborated causes raise confidence; an unsupported diagnosis lowers it.
    supported = {item.supports for item in evidence}
    if causes and not supported:
        recommendation.confidence = round(recommendation.confidence * 0.85, 2)

    return Diagnosis(recommendation=recommendation, causes=causes)
