export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

export interface DatasetMeta {
  file: string;
  available: boolean;
  version?: string;
  description?: string;
  total?: number;
  by_category?: Record<string, number>;
  by_severity?: Record<string, number>;
  meta?: {
    base_count?: number;
    v2_count?: number;
    transforms_applied?: string[];
    transform_count?: number;
  } | null;
}

export interface DatasetsResponse {
  datasets: Record<string, DatasetMeta>;
  categories: string[];
  category_descriptions: Record<string, string>;
  severities: string[];
  default_dataset: string;
}

export interface ModelsResponse {
  provider: string;
  base_url: string;
  models: string[];
}

export interface StartRequest {
  target_url: string;
  api_headers: Record<string, string>;
  model_config: Record<string, unknown>;
  dataset?: "base" | "v2" | "extended";
  categories?: string[] | null;
  severities?: string[] | null;
  max_attacks?: number | null;
  request_timeout_s?: number;
}

export interface StartResponse {
  session_id: string;
  message: string;
}

export interface AttackResult {
  attack_id: string;
  category: string;
  name: string;
  severity: string;
  model: string;
  prompt: string;
  response: string;
  verdict: "VULNERABLE" | "PARTIAL" | "SAFE" | "ERROR";
  score: number;
  matched_keywords: string[];
  refused: boolean;
  error: string | null;
  timestamp: string;
}

export interface Summary {
  total: number;
  by_verdict: Record<string, number>;
  by_category: Record<string, Record<string, number>>;
  avg_score: number;
  vulnerability_rate: number;
}

export interface StatusResponse {
  status: "running" | "completed" | "stopped" | "error";
  progress: { current: number; total: number };
  results: AttackResult[];
  summary: Summary | null;
  error: string | null;
  created_at: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  datasets: () => request<DatasetsResponse>("/api/datasets"),
  models: (target_url: string, api_headers: Record<string, string>) =>
    request<ModelsResponse>("/api/models", {
      method: "POST",
      body: JSON.stringify({ target_url, api_headers }),
    }),
  start: (req: StartRequest) =>
    request<StartResponse>("/api/start", {
      method: "POST",
      body: JSON.stringify(req),
    }),
  status: (sessionId: string) =>
    request<StatusResponse>(`/api/status/${sessionId}`),
  stop: (sessionId: string) =>
    request<{ session_id: string; status: string; message: string }>(
      `/api/stop/${sessionId}`,
      { method: "POST" },
    ),
};
