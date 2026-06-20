"use client";

import { type ReactNode, useState } from "react";
import { diagnoseRepair } from "@/lib/api";
import type { Cause, DiagnoseRequest, DiagnoseResponse, SkillLevel } from "@/lib/types";
import { RepairFlow } from "@/components/RepairFlow";
import { ThemeToggle } from "@/components/ThemeToggle";

const AGENTS = [
  { id: "intake", label: "Intake", task: "Parse symptoms & skill level" },
  { id: "retrieval", label: "Retrieval", task: "Pull manual evidence" },
  { id: "triage", label: "Triage", task: "Rank likely causes" },
  { id: "planner", label: "Planner", task: "Build the repair plan" },
  { id: "safety", label: "Safety", task: "Screen for household risk" },
  { id: "impact", label: "Impact", task: "Estimate repair vs replace" },
] as const;

const TABS = [
  { id: "sequence", label: "Diagnostic sequence" },
  { id: "diagnosis", label: "Diagnosis" },
  { id: "plan", label: "Repair plan" },
  { id: "impact", label: "Impact" },
  { id: "evidence", label: "Evidence" },
  { id: "reasoning", label: "Reasoning" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const [started, setStarted] = useState(false);

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
  const [settling, setSettling] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("sequence");

  function stepStatus(index: number) {
    if (phase === "idle") return "standby" as const;
    if (phase === "done") return "done" as const;
    if (index < activeStep) return "done" as const;
    if (index === activeStep) return settling ? ("done" as const) : ("running" as const);
    return "pending" as const;
  }

  // Each agent runs for a beat, settles to done, then pauses before the next
  // starts — so the sequence reads like real work rather than a fast wipe.
  async function runSequence(reduced: boolean) {
    for (let i = 0; i < AGENTS.length; i += 1) {
      setActiveStep(i);
      setSettling(false);
      if (!reduced) await wait(360 + Math.random() * 520);
      setSettling(true);
      if (!reduced) await wait(140 + Math.random() * 220);
    }
    setActiveStep(AGENTS.length);
    setSettling(false);
  }

  function enterWorkspace() {
    setStarted(true);
    setActiveTab("sequence");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function runDiagnosis() {
    setError(null);
    setResult(null);
    setPhase("running");
    setActiveStep(0);
    setSettling(false);
    setActiveTab("sequence");

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
        runSequence(reducedMotion()),
      ]);
      setResult(diagnosis);
      setPhase("done");
      setActiveTab("diagnosis");
    } catch (diagnosisError) {
      setError(
        diagnosisError instanceof Error
          ? diagnosisError.message
          : "RepairMate could not complete the diagnosis.",
      );
      setPhase("idle");
      setActiveStep(-1);
      setSettling(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line/10 bg-housing/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => setStarted(false)}
            className="flex items-center gap-2.5"
          >
            <LogoMark size="sm" />
            <span className="font-display text-sm font-semibold tracking-wide text-chalk">
              RepairMate
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted sm:inline">
              Powered by RepairGraph
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted sm:inline">
              <span className="text-signal">●</span> online
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={enterWorkspace}
              className="rounded-md bg-signal px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-housing transition hover:bg-signal/90"
            >
              Try it out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        {!started ? (
          <section className="pt-7 sm:pt-10">
            <div className="relative overflow-hidden rounded-2xl border border-line/10 bg-panel/80 shadow-panel">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgb(var(--signal)/0.16),transparent_38%),linear-gradient(135deg,rgb(var(--line)/0.05),transparent_46%)]" />
              <div className="relative grid min-h-[520px] gap-10 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-12">
                <div className="max-w-2xl">
                  <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-signal">
                    RepairGraph · agentic diagnostics
                  </div>
                  <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.04] text-chalk sm:text-6xl">
                    Find the fault before you replace the machine.
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
                    RepairMate is AI that helps you repair, not replace. It runs a chain of
                    repair agents over your appliance&apos;s symptoms and turns them into a
                    safe, explainable fix.
                  </p>
                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={enterWorkspace}
                      className="rounded-md bg-signal px-5 py-3 text-sm font-semibold text-housing shadow-signal transition hover:bg-signal/90"
                    >
                      Try it out →
                    </button>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                      Prefilled demo · washing machine
                    </span>
                  </div>
                  <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
                    <Readout label="Demo case" value="No drain" />
                    <Readout label="Plan time" value="35" unit="min" />
                    <Readout label="Est. cost" value="$12" />
                    <Readout label="Agents" value="6" />
                  </div>
                </div>

                <HeroVisual />
              </div>
            </div>
          </section>
        ) : (
          <div className="grid gap-5 pt-7 sm:pt-8 lg:grid-cols-[330px_1fr] lg:items-start">
            <div className="lg:sticky lg:top-[72px]">
              <Panel title="Intake" code="01 · symptoms">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void runDiagnosis();
                  }}
                  className="space-y-4"
                >
                  <Field label="Appliance">
                    <input
                      className="input"
                      value={appliance}
                      onChange={(event) => setAppliance(event.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
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
                  <Field label="Issue">
                    <input
                      className="input"
                      value={issue}
                      onChange={(event) => setIssue(event.target.value)}
                    />
                  </Field>
                  <Field label="Symptoms">
                    <textarea
                      className="input min-h-[96px] resize-y"
                      value={symptoms}
                      onChange={(event) => setSymptoms(event.target.value)}
                    />
                  </Field>

                  {error ? (
                    <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 font-mono text-[12px] text-danger">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={phase === "running"}
                    className="w-full rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-housing shadow-signal transition hover:bg-signal/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {phase === "running" ? "Running diagnostics…" : "Run diagnosis"}
                  </button>
                </form>
              </Panel>
            </div>

            <div>
              <div className="lg:sticky lg:top-[72px] z-10 rounded-xl border border-line/10 bg-housing/90 px-4 py-3 shadow-panel backdrop-blur">
                <div className="flex gap-1 overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition ${
                        activeTab === tab.id
                          ? "bg-signal/15 text-signal"
                          : "text-muted hover:text-chalk"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {result ? (
                  <div className="mt-3 border-t border-line/10 pt-3">
                    <SummaryBar result={result} />
                  </div>
                ) : null}
              </div>

              <div className="mt-5 animate-fade-up">
                {activeTab === "sequence" ? (
                  <Panel title="Diagnostic sequence" code="RepairGraph">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
                        <span className="text-muted">Target</span>
                        <span className="text-chalk">{appliance || "—"}</span>
                      </div>

                      {phase === "running" ? (
                        <div>
                          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                            <span className="text-signal">Running diagnostics</span>
                            <span className="text-muted">
                              {Math.min(activeStep + 1, AGENTS.length)}/{AGENTS.length}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line/10">
                            <div
                              className="h-full rounded-full bg-signal transition-all duration-300"
                              style={{
                                width: `${(Math.min(activeStep + 1, AGENTS.length) / AGENTS.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="grid gap-2.5 sm:grid-cols-2">
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
                          Standby. Fill the intake on the left and run a diagnosis.
                        </p>
                      ) : null}

                      {phase === "done" && result ? (
                        <p className="font-mono text-[11px] leading-5 text-signal">
                          Diagnosis complete — open the Diagnosis tab for the recommendation.
                        </p>
                      ) : null}
                    </div>
                  </Panel>
                ) : null}

                {activeTab === "diagnosis" ? (
                  result ? (
                    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                      <Panel title="Repair recommendation" code="primary" accent>
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                          <Gauge value={result.recommendation.confidence} />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <ConfidencePill value={result.recommendation.confidence} />
                              <Chip>{result.recommendation.difficulty}</Chip>
                              <Chip>{result.recommendation.estimated_time_minutes} min</Chip>
                              <Chip>${result.recommendation.estimated_cost_usd}</Chip>
                            </div>
                            <h3 className="mt-3 font-display text-2xl font-semibold leading-snug text-chalk">
                              {result.recommendation.title}
                            </h3>
                            <p className="mt-2 leading-7 text-muted">
                              {result.recommendation.summary}
                            </p>
                          </div>
                        </div>
                      </Panel>

                      <Panel title="Likely causes" code="ranked">
                        <ul className="space-y-3">
                          {result.likely_causes.map((cause) => (
                            <li
                              key={cause.name}
                              className="rounded-lg border border-line/[0.08] bg-line/[0.02] p-3"
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
                    </div>
                  ) : (
                    <RunFirst />
                  )
                ) : null}

                {activeTab === "plan" ? (
                  result ? (
                    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                      <Panel title="Repair plan" code="procedure">
                        <ol className="space-y-3">
                          {result.repair_plan.map((step) => (
                            <li
                              key={step.step}
                              className="flex gap-4 rounded-lg border border-line/[0.08] bg-line/[0.02] p-4"
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

                      <Panel title="Safety" code="human check">
                        <p className="mb-3 font-mono text-[11px] leading-5 text-muted">
                          Human review required before you proceed.
                        </p>
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
                  ) : (
                    <RunFirst />
                  )
                ) : null}

                {activeTab === "impact" ? (
                  result ? (
                    <div className="grid gap-5 lg:grid-cols-2">
                      <Panel title="Repair vs replace" code="cost">
                        <div className="rounded-lg border border-caution/30 bg-caution/[0.08] p-5">
                          <div className="font-mono text-[10px] uppercase tracking-widest text-caution">
                            You keep
                          </div>
                          <div className="mt-1 font-mono text-4xl font-semibold text-chalk">
                            $
                            {result.sustainability_impact.replace_cost_usd -
                              result.recommendation.estimated_cost_usd}
                          </div>
                          <div className="mt-2 flex items-center gap-2 font-mono text-[12px] text-muted">
                            <span className="text-caution">
                              Repair ${result.recommendation.estimated_cost_usd}
                            </span>
                            <span className="text-muted/50">vs</span>
                            <span className="text-muted line-through decoration-caution/60">
                              Replace ${result.sustainability_impact.replace_cost_usd}
                            </span>
                          </div>
                        </div>
                      </Panel>

                      <Panel title="Environmental impact" code="repair · not replace">
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
                        <p className="mt-4 text-[13px] leading-6 text-muted">
                          {result.sustainability_impact.message}
                        </p>
                      </Panel>
                    </div>
                  ) : (
                    <RunFirst />
                  )
                ) : null}

                {activeTab === "evidence" ? (
                  result ? (
                    <Panel title="Evidence" code="retrieval">
                      {result.evidence.length > 0 ? (
                        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {result.evidence.map((item) => (
                            <li
                              key={item.id}
                              className="rounded-lg border border-line/[0.08] bg-line/[0.02] p-3"
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
                      ) : (
                        <p className="font-mono text-[12px] text-muted">
                          No manual evidence retrieved for this case.
                        </p>
                      )}
                    </Panel>
                  ) : (
                    <RunFirst />
                  )
                ) : null}

                {activeTab === "reasoning" ? (
                  result ? (
                    <div className="space-y-5">
                      <Panel title="RepairGraph" code="reasoning path">
                        <RepairFlow nodes={result.graph.nodes} edges={result.graph.edges} />
                      </Panel>

                      <Panel title="Agent log" code="trace">
                        <ol className="space-y-4">
                          {result.agent_timeline.map((event) => (
                            <li key={event.id} className="relative border-l border-line/10 pl-4">
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
                  ) : (
                    <RunFirst />
                  )
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-line/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 font-mono text-[10px] uppercase tracking-widest text-muted sm:px-8">
          <span>RepairMate · RepairGraph</span>
          <span>Repair, not replace</span>
        </div>
      </footer>
    </div>
  );
}

function RunFirst() {
  return (
    <Panel title="No diagnosis yet" code="standby">
      <p className="font-mono text-[12px] leading-5 text-muted">
        Run a diagnosis from the intake on the left to populate this tab.
      </p>
    </Panel>
  );
}

function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const dimensions = size === "sm" ? "h-7 w-7" : "h-11 w-11";
  const padding = size === "sm" ? "p-1.5" : "p-2.5";

  return (
    <span
      className={`relative inline-flex ${dimensions} shrink-0 items-center justify-center rounded-lg border border-signal/40 bg-gradient-to-br from-signal/15 to-signal/[0.04] shadow-signal`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-full w-full ${padding} text-chalk`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-housing bg-signal" />
    </span>
  );
}

function HeroVisual() {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * 0.87;

  return (
    <div className="relative min-h-[320px] lg:min-h-[380px]" aria-hidden>
      <div className="pointer-events-none absolute right-4 top-6 h-56 w-56 rounded-full bg-signal/15 blur-3xl" />

      <div className="absolute right-0 top-2 w-[300px] rounded-2xl border border-line/12 bg-raised/95 p-5 shadow-panel backdrop-blur sm:w-[330px]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-signal">
            ● Live diagnosis
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            washing machine
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="rgb(127 145 138 / 0.25)"
                strokeWidth="5"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                style={{ stroke: "rgb(var(--signal))" }}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold text-chalk">
              87
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Recommended fix
            </div>
            <div className="mt-1 font-display text-base font-semibold leading-snug text-chalk">
              Clear the drain path first
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-caution/30 bg-caution/[0.08] p-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-caution">
              You keep
            </span>
            <span className="font-mono text-2xl font-semibold text-chalk">$608</span>
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted">
            <span className="text-caution">Repair $12</span>
            <span className="text-muted/50">vs</span>
            <span className="line-through decoration-caution/60">Replace $620</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {AGENTS.map((agent) => (
              <span key={agent.id} className="h-1.5 w-1.5 rounded-full bg-signal" />
            ))}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            6 agents
          </span>
        </div>
      </div>

      <div className="absolute left-0 top-24 hidden rounded-full border border-caution/30 bg-caution/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-caution backdrop-blur sm:block">
        ▲ Replace avoided
      </div>

      <div className="absolute bottom-2 left-2 hidden rounded-lg border border-line/10 bg-housing/85 p-3 backdrop-blur sm:block">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted">
          RepairGraph
        </div>
        <svg width="128" height="40" viewBox="0 0 128 40" fill="none">
          <line x1="14" y1="20" x2="60" y2="20" stroke="rgb(var(--signal))" strokeWidth="1.5" />
          <line x1="68" y1="20" x2="114" y2="11" stroke="rgb(var(--signal))" strokeWidth="1.5" />
          <line x1="68" y1="20" x2="114" y2="29" stroke="rgb(var(--signal))" strokeWidth="1.5" />
          <circle cx="10" cy="20" r="5" fill="#2F7D5B" />
          <circle cx="64" cy="20" r="5" fill="#506A64" />
          <circle cx="118" cy="11" r="5" fill="#174C38" />
          <circle cx="118" cy="29" r="5" fill="#D98A3D" />
        </svg>
      </div>
    </div>
  );
}

function SummaryBar({ result }: { result: DiagnoseResponse }) {
  const rec = result.recommendation;
  const saved =
    result.sustainability_impact.replace_cost_usd - rec.estimated_cost_usd;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="font-mono text-2xl font-semibold text-chalk">
        {Math.round(rec.confidence * 100)}
        <span className="ml-0.5 text-xs text-muted">%</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-signal">
          Recommended fix
        </div>
        <div className="truncate font-display text-sm font-semibold text-chalk">
          {rec.title}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-caution/30 bg-caution/10 px-2 py-1 font-mono text-[11px] text-caution">
          ${saved} kept
        </span>
        <Chip>{rec.difficulty}</Chip>
        <Chip>{rec.estimated_time_minutes} min</Chip>
        <span className="rounded border border-caution/30 bg-caution/10 px-2 py-1 font-mono text-[11px] text-caution">
          ▲ {result.safety_warnings.length}
        </span>
      </div>
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
      className={`relative overflow-hidden rounded-xl border border-line/10 bg-panel/80 shadow-panel ${className}`}
    >
      {accent ? (
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/70 to-transparent" />
      ) : null}
      <header className="flex items-center justify-between border-b border-line/[0.08] px-5 py-3">
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
    standby: "bg-line/20",
    pending: "bg-line/20",
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
          : "border-line/[0.08] bg-line/[0.02]"
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

const CONFIDENCE_COLOR = { high: "#2F7D5B", medium: "#D98A3D", low: "#66736A" };

function confidenceTier(value: number): "high" | "medium" | "low" {
  if (value >= 0.8) return "high";
  if (value >= 0.6) return "medium";
  return "low";
}

function Gauge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.max(0, Math.min(1, value));
  const color = CONFIDENCE_COLOR[confidenceTier(value)];

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgb(127 145 138 / 0.25)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
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

function ConfidencePill({ value }: { value: number }) {
  const tier = confidenceTier(value);
  const color = CONFIDENCE_COLOR[tier];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] uppercase tracking-widest"
      style={{
        color,
        borderColor: `${color}55`,
        backgroundColor: `${color}14`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {tier} confidence
    </span>
  );
}

function SignalBars({ level }: { level: Cause["likelihood"] }) {
  const filled = level === "High" ? 3 : level === "Medium" ? 2 : 1;
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${i < filled ? "bg-signal" : "bg-line/15"}`}
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
    <div className="rounded-lg border border-line/[0.08] bg-line/[0.02] p-3">
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
    <div className="border-l border-line/10 pl-3">
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
    <span className="rounded border border-line/10 bg-line/[0.03] px-2 py-1 font-mono text-[11px] text-muted">
      {children}
    </span>
  );
}
