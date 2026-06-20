"use client";

import { type ReactNode, useState } from "react";
import type * as React from "react";
import { diagnoseRepair } from "@/lib/api";
import type { Cause, DiagnoseRequest, DiagnoseResponse, SkillLevel } from "@/lib/types";
import { RepairFlow } from "@/components/RepairFlow";

const AGENTS = [
  { id: "intake", label: "Intake", task: "Parse symptoms & skill level" },
  { id: "retrieval", label: "Retrieval", task: "Pull manual evidence" },
  { id: "triage", label: "Triage", task: "Rank likely causes" },
  { id: "planner", label: "Planner", task: "Build the repair plan" },
  { id: "safety", label: "Safety", task: "Screen for household risk" },
  { id: "impact", label: "Impact", task: "Estimate repair vs replace" },
] as const;

const defaultSymptoms = [
  "Standing water remains after cycle",
  "Washer hums during drain",
  "No visible leak",
];

type Phase = "idle" | "running" | "done";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Home() {
  const [appliance, setAppliance] = useState("Washing machine");
  const [brand, setBrand] = useState("Bosch");
  const [model, setModel] = useState("Serie 6 front-load");
  const [issue, setIssue] = useState("The washing machine does not drain");
  const [symptoms, setSymptoms] = useState(defaultSymptoms.join("\n"));
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");

  const [result, setResult] = useState<DiagnoseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeStep, setActiveStep] = useState(-1);

  function stepStatus(index: number) {
    if (phase === "idle") return "standby" as const;
    if (phase === "done") return "done" as const;
    if (index < activeStep) return "done" as const;
    if (index === activeStep) return "running" as const;
    return "pending" as const;
  }

  async function runSequence(delay: number) {
    for (let i = 0; i < AGENTS.length; i += 1) {
      setActiveStep(i);
      if (delay) await wait(delay);
    }
    setActiveStep(AGENTS.length);
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setPhase("running");
    setActiveStep(0);

    const payload: DiagnoseRequest = {
      appliance,
      brand,
      model,
      issue,
      symptoms: symptoms
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      skill_level: skillLevel,
    };

    try {
      const [diagnosis] = await Promise.all([
        diagnoseRepair(payload),
        runSequence(reducedMotion() ? 0 : 460),
      ]);
      setResult(diagnosis);
      setPhase("done");
    } catch (diagnosisError) {
      setError(
        diagnosisError instanceof Error
          ? diagnosisError.message
          : "RepairMate could not complete the diagnosis.",
      );
      setPhase("idle");
      setActiveStep(-1);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-housing/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-signal/50 bg-signal/10">
              <span className="h-2 w-2 rounded-full bg-signal animate-pulse-dot" />
            </span>
            <span className="font-display text-sm font-semibold tracking-wide text-chalk">
              RepairMate
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted sm:inline">
              Service Console
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span className="hidden sm:inline">RepairGraph v0.1</span>
            <span className="text-signal">● online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <section className="pt-12 sm:pt-16">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-signal">
            Agentic diagnostics · RepairGraph
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-chalk sm:text-6xl">
            Find the fault before you replace the machine.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            RepairMate runs a chain of repair agents over your appliance&apos;s
            symptoms and turns them into a safe, explainable fix — so repair stays
            the default, not replacement.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            <Readout label="Demo case" value="No drain" />
            <Readout label="Plan time" value="35" unit="min" />
            <Readout label="Est. cost" value="$12" />
            <Readout label="Agents" value="4" />
          </div>
        </section>

        <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:items-start">
          <Panel title="Intake" code="01 · symptoms">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Appliance">
                  <input
                    className="input"
                    value={appliance}
                    onChange={(event) => setAppliance(event.target.value)}
                  />
                </Field>
                <Field label="Brand">
                  <input
                    className="input"
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                  />
                </Field>
                <Field label="Model">
                  <input
                    className="input"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                  />
                </Field>
                <Field label="Skill level">
                  <select
                    className="input"
                    value={skillLevel}
                    onChange={(event) => setSkillLevel(event.target.value as SkillLevel)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </Field>
              </div>
              <Field label="Issue">
                <input
                  className="input"
                  value={issue}
                  onChange={(event) => setIssue(event.target.value)}
                />
              </Field>
              <Field label="Symptoms">
                <textarea
                  className="input min-h-[112px] resize-y"
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                />
              </Field>

              {error ? (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[12px] text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={phase === "running"}
                className="w-full rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-housing shadow-signal transition hover:bg-signal/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {phase === "running" ? "Running diagnostics…" : "Run diagnosis"}
              </button>
            </form>
          </Panel>

          <Panel title="Diagnostic sequence" code="RepairGraph">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
                <span className="text-muted">Target</span>
                <span className="text-chalk">{appliance || "—"}</span>
              </div>

              <div className="space-y-2.5">
                {AGENTS.map((agent, index) => (
                  <AgentRow
                    key={agent.id}
                    index={index}
                    agent={agent}
                    status={stepStatus(index)}
                  />
                ))}
              </div>

              {phase === "idle" ? (
                <p className="font-mono text-[11px] leading-5 text-muted">
                  Standby. Run the intake to start the agent sequence.
                </p>
              ) : null}

              {phase === "done" && result ? (
                <div className="flex items-center gap-4 rounded-lg border border-signal/30 bg-signal/[0.06] p-4">
                  <Gauge value={result.recommendation.confidence} />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-signal">
                      Diagnosis complete
                    </div>
                    <div className="mt-1 font-display text-sm font-semibold text-chalk">
                      {result.recommendation.title}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted">
                      {AGENTS.length}/{AGENTS.length} agents · path cleared first
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>

        {result ? (
          <div className="mt-5 space-y-5 animate-fade-up">
            <Panel title="Repair recommendation" code="primary" accent>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Gauge value={result.recommendation.confidence} />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Chip>{result.recommendation.difficulty}</Chip>
                    <Chip>{result.recommendation.estimated_time_minutes} min</Chip>
                    <Chip>${result.recommendation.estimated_cost_usd}</Chip>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold text-chalk">
                    {result.recommendation.title}
                  </h3>
                  <p className="mt-2 leading-7 text-muted">
                    {result.recommendation.summary}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel title="RepairGraph" code="reasoning path">
              <RepairFlow nodes={result.graph.nodes} edges={result.graph.edges} />
            </Panel>

            {result.evidence.length > 0 ? (
              <Panel title="Evidence" code="retrieval">
                <ul className="grid gap-3 lg:grid-cols-3">
                  {result.evidence.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-widest text-signal">
                        {item.source}
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-muted">
                        &ldquo;{item.snippet}&rdquo;
                      </p>
                      <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                        supports · {item.supports}
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-3">
              <Panel title="Likely causes" code="ranked">
                <ul className="space-y-3">
                  {result.likely_causes.map((cause) => (
                    <li
                      key={cause.name}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-medium text-chalk">
                          {cause.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <SignalBars level={cause.likelihood} />
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {cause.likelihood}
                          </span>
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-muted">
                        {cause.evidence}
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Repair vs replace" code="impact">
                <div className="space-y-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-signal">
                    Repair · not replace
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Figure
                      value={result.sustainability_impact.landfill_waste_avoided_kg}
                      unit="kg"
                      label="Waste avoided"
                    />
                    <Figure
                      value={result.sustainability_impact.co2_saved_kg}
                      unit="kg CO₂"
                      label="Emissions saved"
                    />
                  </div>
                  <p className="text-[13px] leading-6 text-muted">
                    {result.sustainability_impact.message}
                  </p>
                </div>
              </Panel>

              <Panel title="Safety" code="human check">
                <ul className="space-y-2.5">
                  {result.safety_warnings.map((warning) => (
                    <li
                      key={warning}
                      className="flex gap-3 rounded-lg border border-caution/25 bg-caution/[0.06] p-3"
                    >
                      <span className="mt-0.5 font-mono text-caution">▲</span>
                      <span className="text-[13px] leading-6 text-chalk/90">
                        {warning}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            <div className="grid gap-5 lg:grid-cols-5">
              <Panel className="lg:col-span-3" title="Repair plan" code="procedure">
                <ol className="space-y-3">
                  {result.repair_plan.map((step) => (
                    <li
                      key={step.step}
                      className="flex gap-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4"
                    >
                      <span className="font-mono text-sm text-signal">
                        {String(step.step).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-sm font-semibold text-chalk">
                          {step.title}
                        </h4>
                        <p className="mt-1 text-[13px] leading-6 text-muted">
                          {step.detail}
                        </p>
                        {step.tools.length > 0 ? (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {step.tools.map((tool) => (
                              <Chip key={tool}>{tool}</Chip>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>

              <Panel className="lg:col-span-2" title="Agent log" code="trace">
                <ol className="space-y-4">
                  {result.agent_timeline.map((event) => (
                    <li key={event.id} className="relative border-l border-white/10 pl-4">
                      <span
                        className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-housing ${
                          event.status === "warning" ? "bg-caution" : "bg-signal"
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[13px] font-medium text-chalk">
                          {event.agent}
                        </span>
                        <span
                          className={`font-mono text-[9px] uppercase tracking-widest ${
                            event.status === "warning" ? "text-caution" : "text-signal"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] leading-5 text-muted">
                        {event.action}
                      </div>
                      <div className="mt-0.5 text-[12px] leading-5 text-muted/80">
                        {event.detail}
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 font-mono text-[10px] uppercase tracking-widest text-muted sm:px-8">
          <span>RepairMate · RepairGraph</span>
          <span>Repair, not replace</span>
        </div>
      </footer>
    </div>
  );
}

function Panel({
  title,
  code,
  accent,
  className = "",
  children,
}: {
  title: string;
  code?: string;
  accent?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-panel/80 shadow-panel ${className}`}
    >
      {accent ? (
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/70 to-transparent" />
      ) : null}
      <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
        <h2 className="font-display text-[15px] font-semibold tracking-wide text-chalk">
          {title}
        </h2>
        {code ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {code}
          </span>
        ) : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function AgentRow({
  index,
  agent,
  status,
}: {
  index: number;
  agent: { label: string; task: string };
  status: "standby" | "pending" | "running" | "done";
}) {
  const dot: Record<typeof status, string> = {
    standby: "bg-white/20",
    pending: "bg-white/20",
    running: "bg-signal animate-pulse-dot",
    done: "bg-signal",
  };
  const label: Record<typeof status, string> = {
    standby: "standby",
    pending: "queued",
    running: "running",
    done: "done",
  };
  const active = status === "running";

  return (
    <div
      className={`relative flex items-center gap-3 overflow-hidden rounded-lg border px-3 py-2.5 transition ${
        active
          ? "border-signal/40 bg-signal/[0.05]"
          : "border-white/[0.08] bg-white/[0.02]"
      }`}
    >
      {active ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-signal/10 to-transparent" />
      ) : null}
      <span className="font-mono text-[10px] text-muted">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className={`h-2 w-2 rounded-full ${dot[status]}`} />
      <div className="min-w-0 flex-1">
        <div className="font-display text-[13px] font-medium text-chalk">
          {agent.label} Agent
        </div>
        <div className="truncate font-mono text-[11px] text-muted">{agent.task}</div>
      </div>
      <span
        className={`font-mono text-[10px] uppercase tracking-widest ${
          status === "done" || status === "running" ? "text-signal" : "text-muted"
        }`}
      >
        {label[status]}
      </span>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.max(0, Math.min(1, value));

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#39d98a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-semibold text-chalk">{pct}</span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-muted">CONF</span>
      </div>
    </div>
  );
}

function SignalBars({ level }: { level: Cause["likelihood"] }) {
  const filled = level === "High" ? 3 : level === "Medium" ? 2 : 1;
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${i < filled ? "bg-signal" : "bg-white/15"}`}
          style={{ height: 6 + i * 4 }}
        />
      ))}
    </span>
  );
}

function Figure({
  value,
  unit,
  label,
}: {
  value: number;
  unit: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
      <div className="font-mono text-2xl font-semibold text-chalk">
        {value}
        <span className="ml-1 text-xs text-muted">{unit}</span>
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="border-l border-white/10 pl-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg text-chalk">
        {value}
        {unit ? <span className="ml-1 text-xs text-muted">{unit}</span> : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-muted">
      {children}
    </span>
  );
}
