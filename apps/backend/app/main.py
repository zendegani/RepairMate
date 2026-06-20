from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="RepairMate API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DiagnoseRequest(BaseModel):
    appliance: str = Field(..., examples=["Washing machine"])
    brand: str | None = Field(default=None, examples=["Bosch"])
    model: str | None = Field(default=None, examples=["Serie 6"])
    issue: str = Field(..., examples=["The washing machine does not drain"])
    symptoms: list[str] = Field(default_factory=list)
    skill_level: Literal["beginner", "intermediate", "advanced"] = "beginner"


class Recommendation(BaseModel):
    title: str
    confidence: float
    summary: str
    estimated_time_minutes: int
    estimated_cost_usd: int
    difficulty: Literal["Easy", "Moderate", "Hard"]


class Cause(BaseModel):
    name: str
    likelihood: Literal["High", "Medium", "Low"]
    evidence: str


class RepairStep(BaseModel):
    step: int
    title: str
    detail: str
    tools: list[str] = Field(default_factory=list)


class SustainabilityImpact(BaseModel):
    landfill_waste_avoided_kg: float
    co2_saved_kg: float
    message: str


class TimelineEvent(BaseModel):
    id: str
    agent: str
    action: str
    status: Literal["complete", "warning"]
    detail: str


class FlowNode(BaseModel):
    id: str
    label: str
    kind: Literal["input", "agent", "decision", "output"]


class FlowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str | None = None


class FlowGraph(BaseModel):
    nodes: list[FlowNode]
    edges: list[FlowEdge]


class DiagnoseResponse(BaseModel):
    appliance: str
    issue: str
    recommendation: Recommendation
    likely_causes: list[Cause]
    repair_plan: list[RepairStep]
    sustainability_impact: SustainabilityImpact
    safety_warnings: list[str]
    agent_timeline: list[TimelineEvent]
    graph: FlowGraph


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/diagnose", response_model=DiagnoseResponse)
def diagnose(request: DiagnoseRequest) -> DiagnoseResponse:
    return DiagnoseResponse(
        appliance=request.appliance or "Washing machine",
        issue=request.issue or "Does not drain",
        recommendation=Recommendation(
            title="Clear the drain path before replacing parts",
            confidence=0.87,
            summary=(
                "The safest first repair is to inspect the drain filter, drain hose, "
                "and pump inlet for a blockage. The symptom pattern fits a clog more "
                "strongly than an electrical pump failure."
            ),
            estimated_time_minutes=35,
            estimated_cost_usd=12,
            difficulty="Easy",
        ),
        likely_causes=[
            Cause(
                name="Blocked drain filter",
                likelihood="High",
                evidence="Standing water plus a completed wash cycle usually points to debris trapped before the pump.",
            ),
            Cause(
                name="Kinked or clogged drain hose",
                likelihood="Medium",
                evidence="Slow or absent drainage can happen when the hose is pinched behind the machine.",
            ),
            Cause(
                name="Drain pump obstruction or failure",
                likelihood="Medium",
                evidence="A humming sound during drain suggests the pump is powered but may be jammed.",
            ),
        ],
        repair_plan=[
            RepairStep(
                step=1,
                title="Power down and protect the floor",
                detail="Unplug the washer, turn off water supply valves, and place towels plus a shallow tray near the access panel.",
                tools=["Towels", "Shallow tray"],
            ),
            RepairStep(
                step=2,
                title="Drain residual water",
                detail="Open the lower service flap and use the emergency drain tube if available. Keep the cap low and drain slowly.",
                tools=["Tray", "Gloves"],
            ),
            RepairStep(
                step=3,
                title="Clean the drain filter",
                detail="Unscrew the filter counterclockwise, remove lint, coins, buttons, or fabric debris, then rinse the filter.",
                tools=["Gloves", "Flashlight"],
            ),
            RepairStep(
                step=4,
                title="Inspect hose and pump impeller",
                detail="Check the drain hose for kinks. With the filter removed, confirm the pump impeller turns freely.",
                tools=["Flashlight"],
            ),
            RepairStep(
                step=5,
                title="Run a rinse and drain test",
                detail="Reinstall the filter tightly, restore power, and run a short rinse/drain cycle while watching for leaks.",
                tools=[],
            ),
        ],
        sustainability_impact=SustainabilityImpact(
            landfill_waste_avoided_kg=68.0,
            co2_saved_kg=155.0,
            message="Repairing the drain path can extend the washer's life and avoid the footprint of premature replacement.",
        ),
        safety_warnings=[
            "Unplug the appliance before opening any service panel.",
            "Do not tip the washer alone; water weight can make it unstable.",
            "Stop if you smell burning, see damaged wiring, or the pump housing leaks.",
        ],
        agent_timeline=[
            TimelineEvent(
                id="intake",
                agent="Intake Agent",
                action="Parsed appliance, symptoms, and user skill level",
                status="complete",
                detail="Detected a drain failure scenario for a front-load washing machine.",
            ),
            TimelineEvent(
                id="triage",
                agent="Triage Agent",
                action="Ranked likely causes",
                status="complete",
                detail="Prioritized low-cost blockage checks before part replacement.",
            ),
            TimelineEvent(
                id="safety",
                agent="Safety Agent",
                action="Screened repair plan for household risk",
                status="warning",
                detail="Added power, water, spill, and instability warnings.",
            ),
            TimelineEvent(
                id="impact",
                agent="Impact Agent",
                action="Estimated repair-vs-replace impact",
                status="complete",
                detail="Calculated avoided appliance waste and manufacturing emissions.",
            ),
        ],
        graph=FlowGraph(
            nodes=[
                FlowNode(id="symptoms", label="Symptom intake", kind="input"),
                FlowNode(id="triage", label="Cause ranking", kind="agent"),
                FlowNode(id="safety", label="Safety check", kind="agent"),
                FlowNode(id="decision", label="Repairable at home?", kind="decision"),
                FlowNode(id="plan", label="Guided repair plan", kind="output"),
                FlowNode(id="impact", label="Sustainability impact", kind="output"),
            ],
            edges=[
                FlowEdge(id="e1", source="symptoms", target="triage", label="symptoms"),
                FlowEdge(id="e2", source="triage", target="safety", label="candidate fix"),
                FlowEdge(id="e3", source="safety", target="decision", label="risk screen"),
                FlowEdge(id="e4", source="decision", target="plan", label="yes"),
                FlowEdge(id="e5", source="decision", target="impact", label="estimate"),
            ],
        ),
    )
