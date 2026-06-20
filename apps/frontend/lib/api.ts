import type { DiagnoseRequest, DiagnoseResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function diagnoseRepair(
  payload: DiagnoseRequest,
): Promise<DiagnoseResponse> {
  const response = await fetch(`${API_URL}/api/diagnose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("RepairMate could not complete the diagnosis.");
  }

  return response.json();
}
