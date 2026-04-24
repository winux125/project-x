"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Square,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ListFilter,
  Database,
  Globe,
  KeyRound,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/fade-in";
import { SectionTag } from "@/components/section-tag";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/i18n";
import {
  api,
  type AttackResult,
  type DatasetsResponse,
  type StatusResponse,
} from "@/lib/api";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  DATASET_KEYS,
  DEFAULT_HEADERS_JSON,
  DEFAULT_MODEL_CONFIG_JSON,
  DEFAULT_TARGET_URL,
  SEVERITIES,
  SEVERITY_COLORS,
  VERDICT_COLORS,
  type DatasetKey,
} from "@/config/constants";

const POLL_INTERVAL_MS = 1500;

function safeParseJson<T = Record<string, unknown>>(value: string): T | null {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") return parsed as T;
    return null;
  } catch {
    return null;
  }
}

function toggleInSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

export function RunnerSection() {
  const { lang } = useLang();

  // --- config
  const [targetUrl, setTargetUrl] = useState(DEFAULT_TARGET_URL);
  const [headersJson, setHeadersJson] = useState(DEFAULT_HEADERS_JSON);
  const [modelConfigJson, setModelConfigJson] = useState(DEFAULT_MODEL_CONFIG_JSON);
  const [dataset, setDataset] = useState<DatasetKey>("base");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedSeverities, setSelectedSeverities] = useState<Set<string>>(new Set());
  const [maxAttacks, setMaxAttacks] = useState<string>("");

  // --- model discovery
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string>("");

  // --- dataset metadata
  const [datasetsMeta, setDatasetsMeta] = useState<DatasetsResponse | null>(null);

  // --- session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [submitError, setSubmitError] = useState<string>("");
  const [isStarting, setIsStarting] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Load datasets metadata once
  useEffect(() => {
    api.datasets()
      .then(setDatasetsMeta)
      .catch((err) => console.warn("datasets load failed", err));
  }, []);

  // Poll session status
  useEffect(() => {
    if (!sessionId) return;
    let stopped = false;
    const tick = async () => {
      try {
        const s = await api.status(sessionId);
        if (stopped) return;
        setStatus(s);
        if (s.status !== "running") return; // terminal, stop polling
        pollRef.current = setTimeout(tick, POLL_INTERVAL_MS);
      } catch (err) {
        if (stopped) return;
        setSubmitError(err instanceof Error ? err.message : String(err));
      }
    };
    tick();
    return () => {
      stopped = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [sessionId]);

  const handleListModels = useCallback(async () => {
    setModelsLoading(true);
    setModelsError("");
    try {
      const parsed = safeParseJson<Record<string, string>>(headersJson) || {};
      const res = await api.models(targetUrl, parsed);
      setAvailableModels(res.models);
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : String(err));
    } finally {
      setModelsLoading(false);
    }
  }, [targetUrl, headersJson]);

  const handlePickModel = useCallback((modelName: string) => {
    const parsed = safeParseJson(modelConfigJson) || {};
    const next = { ...(parsed as Record<string, unknown>), model: modelName };
    setModelConfigJson(JSON.stringify(next, null, 2));
  }, [modelConfigJson]);

  const handleStart = useCallback(async () => {
    setSubmitError("");
    const headers = safeParseJson<Record<string, string>>(headersJson);
    const modelConfig = safeParseJson<Record<string, unknown>>(modelConfigJson);
    if (headers === null) {
      setSubmitError("api_headers: invalid JSON");
      return;
    }
    if (modelConfig === null) {
      setSubmitError("model_config: invalid JSON");
      return;
    }
    const maxN = maxAttacks.trim() ? parseInt(maxAttacks, 10) : null;
    if (maxAttacks.trim() && (!Number.isFinite(maxN) || maxN! <= 0)) {
      setSubmitError("max_attacks: must be a positive integer");
      return;
    }

    setIsStarting(true);
    setStatus(null);
    try {
      const res = await api.start({
        target_url: targetUrl,
        api_headers: headers,
        model_config: modelConfig,
        dataset,
        categories: selectedCategories.size ? Array.from(selectedCategories) : null,
        severities: selectedSeverities.size ? Array.from(selectedSeverities) : null,
        max_attacks: maxN,
        request_timeout_s: 120,
      });
      setSessionId(res.session_id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsStarting(false);
    }
  }, [targetUrl, headersJson, modelConfigJson, dataset, selectedCategories, selectedSeverities, maxAttacks]);

  const handleStop = useCallback(async () => {
    if (!sessionId) return;
    try {
      await api.stop(sessionId);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  }, [sessionId]);

  const progressPct = useMemo(() => {
    if (!status) return 0;
    const { current, total } = status.progress;
    return total ? Math.round((current / total) * 100) : 0;
  }, [status]);

  const statusLabelKey = useMemo(() => {
    if (!status) return null;
    switch (status.status) {
      case "running": return "runnerRunning";
      case "completed": return "runnerCompleted";
      case "stopped": return "runnerStopped";
      case "error": return "runnerError";
    }
  }, [status]);

  return (
    <section
      id="runner"
      className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 py-12 sm:py-20"
    >
      <FadeIn>
        <SectionTag num="001" label={t("runnerTitle", lang)} />
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Config panel */}
        <FadeIn delay={100}>
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6 space-y-5">
            <Field icon={<Globe className="w-3.5 h-3.5" />} label={t("runnerTargetUrl", lang)}>
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-fd-green/40 focus:ring-2 focus:ring-fd-green/10 font-mono"
                placeholder="https://api.openai.com/v1/chat/completions"
              />
            </Field>

            <Field icon={<KeyRound className="w-3.5 h-3.5" />} label={t("runnerHeaders", lang)}>
              <Textarea
                value={headersJson}
                onChange={(e) => setHeadersJson(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-300 min-h-24 text-xs rounded-lg focus:border-fd-green/40 focus:ring-fd-green/10 resize-none font-mono"
              />
            </Field>

            <Field icon={<Cpu className="w-3.5 h-3.5" />} label={t("runnerModelConfig", lang)}>
              <Textarea
                value={modelConfigJson}
                onChange={(e) => setModelConfigJson(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-300 min-h-28 text-xs rounded-lg focus:border-fd-green/40 focus:ring-fd-green/10 resize-none font-mono"
              />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-gray-500 font-mono tracking-wider uppercase font-bold">
                  {t("runnerPickModel", lang)}
                </span>
                <button
                  onClick={handleListModels}
                  disabled={modelsLoading}
                  className="text-[10px] font-mono text-fd-green hover:text-fd-green/80 tracking-wider uppercase transition-colors cursor-pointer font-bold flex items-center gap-1 disabled:opacity-50"
                >
                  {modelsLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  [{t("runnerListModels", lang)}]
                </button>
              </div>
              {modelsError && (
                <p className="text-[10px] text-amber-600 font-mono mb-2">{modelsError}</p>
              )}
              {availableModels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {availableModels.map((m) => (
                    <button
                      key={m}
                      onClick={() => handlePickModel(m)}
                      className="text-[10px] font-mono px-2 py-1 rounded-md border border-gray-200 text-gray-600 hover:border-fd-green/40 hover:bg-fd-green-light/30 hover:text-fd-green transition-all cursor-pointer"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-300 font-mono">—</p>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Filters + actions */}
        <FadeIn delay={200}>
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6 space-y-5">
              <Field icon={<Database className="w-3.5 h-3.5" />} label={t("runnerDataset", lang)}>
                <div className="flex flex-wrap gap-2">
                  {DATASET_KEYS.map((key) => {
                    const meta = datasetsMeta?.datasets?.[key];
                    const active = dataset === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setDataset(key)}
                        className={`text-[11px] font-mono px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                          active
                            ? "bg-fd-green text-white border-fd-green shadow shadow-fd-green/20"
                            : "border-gray-200 text-gray-600 hover:border-fd-green/40 hover:bg-fd-green-light/30"
                        }`}
                      >
                        {key}
                        {meta?.total != null && (
                          <span className={`ml-1.5 ${active ? "text-white/70" : "text-gray-400"}`}>
                            · {meta.total}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field icon={<ListFilter className="w-3.5 h-3.5" />} label={t("runnerCategories", lang)}>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategories.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategories((s) => toggleInSet(s, cat))}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          active
                            ? CATEGORY_COLORS[cat] || CATEGORY_COLORS.default
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                  {!selectedCategories.size && (
                    <span className="text-[10px] text-gray-300 font-mono self-center ml-1">
                      {t("runnerAllCats", lang)}
                    </span>
                  )}
                </div>
              </Field>

              <Field icon={<AlertTriangle className="w-3.5 h-3.5" />} label={t("runnerSeverities", lang)}>
                <div className="flex flex-wrap gap-2">
                  {SEVERITIES.map((sev) => {
                    const active = selectedSeverities.has(sev);
                    return (
                      <button
                        key={sev}
                        onClick={() => setSelectedSeverities((s) => toggleInSet(s, sev))}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          active
                            ? SEVERITY_COLORS[sev]
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {sev}
                      </button>
                    );
                  })}
                  {!selectedSeverities.size && (
                    <span className="text-[10px] text-gray-300 font-mono self-center ml-1">
                      {t("runnerAllSevs", lang)}
                    </span>
                  )}
                </div>
              </Field>

              <Field label={t("runnerMaxAttacks", lang)}>
                <input
                  type="number"
                  min="1"
                  value={maxAttacks}
                  onChange={(e) => setMaxAttacks(e.target.value)}
                  className="w-32 bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-fd-green/40 focus:ring-2 focus:ring-fd-green/10 font-mono"
                  placeholder="—"
                />
              </Field>

              {submitError && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                  <p className="text-[11px] text-red-600 font-mono">{submitError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleStart}
                  disabled={isStarting || status?.status === "running"}
                  className="flex-1 bg-fd-green text-white hover:bg-fd-green/90 font-semibold text-sm rounded-lg py-5 shadow-md shadow-fd-green/10 cursor-pointer disabled:opacity-30 transition-all duration-300 hover:shadow-lg hover:shadow-fd-green/20"
                >
                  {isStarting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {t("runnerStart", lang)}
                </Button>
                <Button
                  onClick={handleStop}
                  disabled={!sessionId || status?.status !== "running"}
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-semibold text-sm rounded-lg py-5 cursor-pointer disabled:opacity-30 transition-all"
                >
                  <Square className="w-4 h-4" />
                  {t("runnerStop", lang)}
                </Button>
              </div>
            </div>

            {/* Progress + summary */}
            {status ? (
              <StatusPanel status={status} progressPct={progressPct} statusLabelKey={statusLabelKey!} />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white/40 p-6 text-center">
                <p className="text-xs text-gray-400 font-mono tracking-wider uppercase">
                  {t("runnerNoSession", lang)}
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Results table */}
      {status && status.results.length > 0 && (
        <FadeIn delay={300}>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono tracking-wider uppercase font-bold">
                {t("runnerResults", lang)}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {status.results.length} / {status.progress.total}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono">
                <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">ID</th>
                    <th className="text-left px-4 py-2 font-semibold">Category</th>
                    <th className="text-left px-4 py-2 font-semibold">Severity</th>
                    <th className="text-left px-4 py-2 font-semibold">Verdict</th>
                    <th className="text-left px-4 py-2 font-semibold">Score</th>
                    <th className="text-left px-4 py-2 font-semibold">Matched</th>
                    <th className="text-left px-4 py-2 font-semibold">Ref.</th>
                    <th className="text-left px-4 py-2 font-semibold">Err</th>
                  </tr>
                </thead>
                <tbody>
                  {status.results.map((r, idx) => (
                    <ResultRow key={`${r.attack_id}-${idx}`} result={r} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}
    </section>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-fd-green">
        {icon}
        <span className="text-[11px] text-gray-500 font-mono tracking-wider uppercase font-bold">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function StatusPanel({
  status,
  progressPct,
  statusLabelKey,
}: {
  status: StatusResponse;
  progressPct: number;
  statusLabelKey:
    | "runnerRunning"
    | "runnerCompleted"
    | "runnerStopped"
    | "runnerError";
}) {
  const { lang } = useLang();
  const s = status.summary;
  const isRunning = status.status === "running";
  const isCompleted = status.status === "completed";
  const isStopped = status.status === "stopped";
  const isError = status.status === "error";

  const StatusIcon = isRunning
    ? Loader2
    : isCompleted
      ? CheckCircle2
      : isError
        ? XCircle
        : AlertTriangle;

  const barColor = isError
    ? "bg-red-500"
    : isStopped
      ? "bg-amber-500"
      : "bg-fd-green";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon
            className={`w-4 h-4 ${
              isRunning
                ? "text-fd-green animate-spin"
                : isCompleted
                  ? "text-fd-green"
                  : isError
                    ? "text-red-500"
                    : "text-amber-500"
            }`}
          />
          <span className="text-[11px] text-gray-500 font-mono tracking-wider uppercase font-bold">
            {t(statusLabelKey, lang)}
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          {status.progress.current} / {status.progress.total}
        </span>
      </div>

      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {status.error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
          <p className="text-[11px] text-red-600 font-mono break-all">{status.error}</p>
        </div>
      )}

      {s && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="VULN" value={s.by_verdict.VULNERABLE || 0} tone="red" />
            <Stat label="PARTIAL" value={s.by_verdict.PARTIAL || 0} tone="amber" />
            <Stat label="SAFE" value={s.by_verdict.SAFE || 0} tone="green" />
            <Stat label="ERROR" value={s.by_verdict.ERROR || 0} tone="gray" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label={t("runnerVulnRate", lang)}
              value={`${Math.round(s.vulnerability_rate * 100)}%`}
              tone="red"
            />
            <Stat label={t("runnerAvgScore", lang)} value={s.avg_score.toFixed(2)} tone="gray" />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "red" | "amber" | "green" | "gray";
}) {
  const toneMap: Record<string, string> = {
    red: "text-red-600 bg-red-50 border-red-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    green: "text-emerald-700 bg-emerald-50 border-emerald-100",
    gray: "text-gray-500 bg-gray-50 border-gray-100",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 ${toneMap[tone]}`}>
      <div className="text-[9px] font-mono tracking-wider uppercase opacity-70">{label}</div>
      <div className="text-lg font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function ResultRow({ result }: { result: AttackResult }) {
  const [open, setOpen] = useState(false);
  const verdictColor = VERDICT_COLORS[result.verdict] || VERDICT_COLORS.ERROR;
  const catColor = CATEGORY_COLORS[result.category] || CATEGORY_COLORS.default;
  const sevColor = SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.MEDIUM;

  return (
    <>
      <tr
        onClick={() => setOpen((v) => !v)}
        className="border-t border-gray-100 hover:bg-gray-50/50 cursor-pointer"
      >
        <td className="px-4 py-2 text-gray-600 font-semibold">{result.attack_id}</td>
        <td className="px-4 py-2">
          <Badge variant="outline" className={`text-[9px] rounded-md ${catColor}`}>
            {result.category}
          </Badge>
        </td>
        <td className="px-4 py-2">
          <Badge variant="outline" className={`text-[9px] rounded-md ${sevColor}`}>
            {result.severity}
          </Badge>
        </td>
        <td className="px-4 py-2">
          <Badge variant="outline" className={`text-[9px] rounded-md ${verdictColor}`}>
            {result.verdict}
          </Badge>
        </td>
        <td className="px-4 py-2 text-gray-700 tabular-nums">{result.score.toFixed(2)}</td>
        <td className="px-4 py-2 text-gray-500 truncate max-w-32">
          {result.matched_keywords.length
            ? result.matched_keywords.join(", ")
            : "—"}
        </td>
        <td className="px-4 py-2 text-gray-500">{result.refused ? "✓" : "—"}</td>
        <td className="px-4 py-2 text-red-500 truncate max-w-32">
          {result.error ? "!" : "—"}
        </td>
      </tr>
      {open && (
        <tr className="bg-gray-50/50 border-t border-gray-100">
          <td colSpan={8} className="px-4 py-4 space-y-3">
            <Detail label="Prompt" value={result.prompt} />
            <Detail label="Response" value={result.response || "(empty)"} />
            {result.error && <Detail label="Error" value={result.error} tone="red" />}
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "red";
}) {
  return (
    <div>
      <div className="text-[9px] font-mono tracking-wider uppercase text-gray-400 mb-1 font-bold">
        {label}
      </div>
      <pre
        className={`text-[11px] whitespace-pre-wrap break-words font-mono rounded-md border px-3 py-2 ${
          tone === "red"
            ? "bg-red-50 border-red-100 text-red-700"
            : "bg-white border-gray-100 text-gray-700"
        }`}
      >
        {value}
      </pre>
    </div>
  );
}
