"""Graph builder agent: render the reasoning path as a RepairGraph."""

from app.schemas import FlowEdge, FlowGraph, FlowNode
from app.services.diagnosis import Diagnosis
from app.services.intake import Intake


def build_graph(intake: Intake, diagnosis: Diagnosis) -> FlowGraph:
    nodes = [
        FlowNode(id="symptoms", label="Symptom intake", kind="input"),
        FlowNode(id="triage", label="Cause ranking", kind="agent"),
        FlowNode(id="safety", label="Safety check", kind="agent"),
        FlowNode(id="decision", label="Repairable at home?", kind="decision"),
        FlowNode(id="plan", label="Guided repair plan", kind="output"),
        FlowNode(id="impact", label="Sustainability impact", kind="output"),
    ]
    edges = [
        FlowEdge(id="e1", source="symptoms", target="triage", label="symptoms"),
        FlowEdge(id="e2", source="triage", target="safety", label="candidate fix"),
        FlowEdge(id="e3", source="safety", target="decision", label="risk screen"),
        FlowEdge(id="e4", source="decision", target="plan", label="yes"),
        FlowEdge(id="e5", source="decision", target="impact", label="estimate"),
    ]
    return FlowGraph(nodes=nodes, edges=edges)
