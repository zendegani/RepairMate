export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type DiagnoseRequest = {
  appliance: string;
  brand?: string;
  model?: string;
  issue: string;
  symptoms: string[];
  skill_level: SkillLevel;
};

export type Recommendation = {
  title: string;
  confidence: number;
  summary: string;
  estimated_time_minutes: number;
  estimated_cost_usd: number;
  difficulty: "Easy" | "Moderate" | "Hard";
};

export type Cause = {
  name: string;
  likelihood: "High" | "Medium" | "Low";
  evidence: string;
};

export type RepairStep = {
  step: number;
  title: string;
  detail: string;
  tools: string[];
};

export type SustainabilityImpact = {
  landfill_waste_avoided_kg: number;
  co2_saved_kg: number;
  replace_cost_usd: number;
  message: string;
};

export type Evidence = {
  id: string;
  source: string;
  snippet: string;
  supports: string;
};

export type TimelineEvent = {
  id: string;
  agent: string;
  action: string;
  status: "complete" | "warning";
  detail: string;
};

export type FlowNodeDto = {
  id: string;
  label: string;
  kind: "input" | "agent" | "decision" | "output";
};

export type FlowEdgeDto = {
  id: string;
  source: string;
  target: string;
  label?: string | null;
};

export type DiagnoseResponse = {
  appliance: string;
  issue: string;
  recommendation: Recommendation;
  likely_causes: Cause[];
  repair_plan: RepairStep[];
  sustainability_impact: SustainabilityImpact;
  safety_warnings: string[];
  evidence: Evidence[];
  agent_timeline: TimelineEvent[];
  graph: {
    nodes: FlowNodeDto[];
    edges: FlowEdgeDto[];
  };
};
