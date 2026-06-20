from typing import Literal

from pydantic import BaseModel, Field


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
