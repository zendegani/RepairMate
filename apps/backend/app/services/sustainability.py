"""Sustainability agent: estimate the repair-vs-replace impact."""

from app.schemas import SustainabilityImpact
from app.services.datastore import load
from app.services.intake import Intake


def estimate_impact(intake: Intake) -> SustainabilityImpact:
    data = load("sustainability")
    entry = data.get(intake.appliance, data["default"])
    return SustainabilityImpact(**entry)
