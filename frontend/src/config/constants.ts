import type { Lang } from "@/lib/i18n";

export const DATASET_KEYS = ["base", "v2", "extended"] as const;
export type DatasetKey = (typeof DATASET_KEYS)[number];

export const DATASET_LABELS: Record<DatasetKey, string> = {
  base: "base · 20",
  v2: "v2 · 40",
  extended: "extended · 300",
};

export const CATEGORIES = [
  "PROMPT_INJECTION",
  "JAILBREAK",
  "SYSTEM_LEAK",
  "HARMFUL_CONTENT",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  PROMPT_INJECTION: "bg-rose-100 text-rose-700 border-rose-200",
  JAILBREAK: "bg-violet-100 text-violet-700 border-violet-200",
  SYSTEM_LEAK: "bg-amber-100 text-amber-700 border-amber-200",
  HARMFUL_CONTENT: "bg-orange-100 text-orange-700 border-orange-200",
  default: "bg-gray-100 text-gray-600 border-gray-200",
};

export const SEVERITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SEVERITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const VERDICT_COLORS: Record<string, string> = {
  VULNERABLE: "bg-red-100 text-red-700 border-red-200",
  PARTIAL: "bg-amber-100 text-amber-700 border-amber-200",
  SAFE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ERROR: "bg-gray-100 text-gray-500 border-gray-200",
};

export const DEFAULT_TARGET_URL = "https://untopping-heterotopic-shalon.ngrok-free.dev/api/chat";
export const DEFAULT_HEADERS_JSON = `{
  "ngrok-skip-browser-warning": "true"
}`;
export const DEFAULT_MODEL_CONFIG_JSON = `{
  "model": "llama3.1",
  "stream": false,
  "options": { "temperature": 0.7 }
}`;

export const TYPING_MAP: Record<Lang, string[]> = {
  ru: ["Prompt Injection", "Jailbreak", "System Leak", "Harmful Content"],
  en: ["Prompt Injection", "Jailbreak", "System Leak", "Harmful Content"],
  kz: ["Prompt Injection", "Jailbreak", "System Leak", "Harmful Content"],
};
