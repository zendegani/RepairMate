"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { diagnoseRepair } from "@/lib/api";
import type { DiagnoseRequest, DiagnoseResponse, SkillLevel } from "@/lib/types";
import { RepairFlow } from "@/components/RepairFlow";

const defaultSymptoms = [
  "Standing water remains after cycle",
  "Washer hums during drain",
  "No visible leak",
];

export default function Home() {
  const [appliance, setAppliance] = useState("Washing machine");
  const [brand, setBrand] = useState("Bosch");
  const [model, setModel] = useState("Serie 6 front-load");
  const [issue, setIssue] = useState("The washing machine does not drain");
  const [symptoms, setSymptoms] = useState(defaultSymptoms.join("\n"));
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [result, setResult] = useState<DiagnoseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confidence = useMemo(() => {
    if (!result) {
      return "0%";
    }

    return `${Math.round(result.recommendation.confidence * 100)}%`;
  }, [result]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

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
      const diagnosis = await diagnoseRepair(payload);
      setResult(diagnosis);
    } catch (diagnosisError) {
      setError(
        diagnosisError instanceof Error
          ? diagnosisError.message
          : "RepairMate could not complete the diagnosis.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-6 text-ink sm:px-8 lg:px-12">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="pt-8 lg:sticky lg:top-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-repair/20 bg-white/75 px-3 py-1 text-sm font-semibold text-repair">
            <span className="h-2 w-2 rounded-full bg-repair" />
            Agentic repair demo
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-normal text-ink sm:text-6xl">
            RepairMate
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-graphite">
            Diagnose appliance failures, turn symptoms into a safe repair plan,
            and show the environmental upside of fixing instead of replacing.
          </p>
          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            <Metric label="Demo case" value="No drain" />
            <Metric label="Plan time" value="35 min" />
            <Metric label="Est. cost" value="$12" />
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-lg border border-black/10 bg-white/90 p-5 shadow-panel backdrop-blur md:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Diagnosis Form</h2>
              <p className="mt-1 text-sm leading-6 text-graphite">
                Prefilled for a hackathon pitch. Edit any field and run the agent.
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-repair px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Diagnosing..." : "Run"}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Appliance">
              <input value={appliance} onChange={(event) => setAppliance(event.target.value)} className="input" />
            </Field>
            <Field label="Brand">
              <input value={brand} onChange={(event) => setBrand(event.target.value)} className="input" />
            </Field>
            <Field label="Model">
              <input value={model} onChange={(event) => setModel(event.target.value)} className="input" />
            </Field>
            <Field label="Skill level">
              <select
                value={skillLevel}
                onChange={(event) => setSkillLevel(event.target.value as SkillLevel)}
                className="input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
          </div>

          <div className="mt-4 grid gap-4">
            <Field label="Issue">
              <input value={issue} onChange={(event) => setIssue(event.target.value)} className="input" />
            </Field>
            <Field label="Symptoms">
              <textarea
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                className="input min-h-28 resize-y"
              />
            </Field>
          </div>

          {error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
        </form>
      </section>

      {result ? (
        <section className="mx-auto mt-8 grid max-w-7xl gap-5 pb-12">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Card title="Repair Recommendation">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-mint px-3 py-1 text-sm font-bold text-repair">
                  {confidence} confidence
                </span>
                <span className="rounded-md bg-black/5 px-3 py-1 text-sm font-bold">
                  {result.recommendation.difficulty}
                </span>
                <span className="rounded-md bg-black/5 px-3 py-1 text-sm font-bold">
                  {result.recommendation.estimated_time_minutes} min
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-bold">{result.recommendation.title}</h3>
              <p className="mt-3 leading-7 text-graphite">{result.recommendation.summary}</p>
            </Card>

            <Card title="React Flow Agent Graph">
              <RepairFlow nodes={result.graph.nodes} edges={result.graph.edges} />
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card title="Likely Causes">
              <div className="space-y-3">
                {result.likely_causes.map((cause) => (
                  <div key={cause.name} className="rounded-md border border-black/10 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">{cause.name}</h3>
                      <span className="text-sm font-bold text-copper">{cause.likelihood}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-graphite">{cause.evidence}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Sustainability Impact">
              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="Waste avoided"
                  value={`${result.sustainability_impact.landfill_waste_avoided_kg} kg`}
                />
                <Metric
                  label="CO2 saved"
                  value={`${result.sustainability_impact.co2_saved_kg} kg`}
                />
              </div>
              <p className="mt-4 leading-7 text-graphite">{result.sustainability_impact.message}</p>
            </Card>

            <Card title="Safety Warnings">
              <ul className="space-y-3">
                {result.safety_warnings.map((warning) => (
                  <li key={warning} className="rounded-md border border-copper/20 bg-[#fff8f2] p-3 text-sm font-semibold leading-6">
                    {warning}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Card title="Repair Plan">
              <ol className="space-y-4">
                {result.repair_plan.map((step) => (
                  <li key={step.step} className="grid gap-3 rounded-md border border-black/10 bg-white p-4 sm:grid-cols-[2.5rem_1fr]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-repair text-lg font-bold text-white">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-bold">{step.title}</h3>
                      <p className="mt-1 leading-7 text-graphite">{step.detail}</p>
                      {step.tools.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.tools.map((tool) => (
                            <span key={tool} className="rounded-md bg-black/5 px-2 py-1 text-xs font-bold">
                              {tool}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            <Card title="Agent Execution Timeline">
              <div className="space-y-4">
                {result.agent_timeline.map((event) => (
                  <div key={event.id} className="border-l-4 border-repair bg-white py-2 pl-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">{event.agent}</h3>
                      <span className={event.status === "warning" ? "text-sm font-bold text-copper" : "text-sm font-bold text-repair"}>
                        {event.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold">{event.action}</p>
                    <p className="mt-1 text-sm leading-6 text-graphite">{event.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-graphite">
      {label}
      {children}
    </label>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white/90 p-5 shadow-panel backdrop-blur">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-white/80 p-3">
      <div className="text-xs font-bold uppercase tracking-normal text-graphite">{label}</div>
      <div className="mt-1 text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
