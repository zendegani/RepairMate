"""Intake agent: normalize the request into a routed scenario."""

from dataclasses import dataclass

from app.schemas import DiagnoseRequest

DRAIN_KEYWORDS = (
    "drain",
    "draining",
    "standing water",
    "water remains",
    "does not drain",
    "won't drain",
    "not pumping",
)


@dataclass
class Intake:
    appliance: str
    issue: str
    scenario: str
    skill_level: str
    tags: list[str]


def run_intake(request: DiagnoseRequest) -> Intake:
    appliance = (request.appliance or "Washing machine").strip()
    issue = (request.issue or "Does not drain").strip()

    haystack = " ".join([issue, *request.symptoms]).lower()
    tags = [keyword for keyword in DRAIN_KEYWORDS if keyword in haystack]

    is_washer = "wash" in appliance.lower()
    scenario = "washing_machine.no_drain" if is_washer and tags else "generic"

    return Intake(
        appliance=appliance,
        issue=issue,
        scenario=scenario,
        skill_level=request.skill_level,
        tags=tags,
    )
