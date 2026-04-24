"use client";

import { useEffect, useState } from "react";
import { Database, FileText, Layers } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { SectionTag } from "@/components/section-tag";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/i18n";
import { api, type DatasetsResponse } from "@/lib/api";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  SEVERITIES,
  SEVERITY_COLORS,
} from "@/config/constants";

const DATASET_DESCRIPTIONS: Record<string, { ru: string; en: string; kz: string }> = {
  base: {
    ru: "Курированный базовый набор. Быстрый smoke-тест.",
    en: "Curated baseline corpus. Quick smoke test.",
    kz: "Негізгі жинақ. Жылдам smoke-тест.",
  },
  v2: {
    ru: "Расширенный набор: атаки из research papers и red-team plugins.",
    en: "Extended set: attacks from research papers and red-team plugins.",
    kz: "Кеңейтілген жинақ: research papers және red-team плагиндерінен.",
  },
  extended: {
    ru: "Полный корпус с трансформациями (base64, rot13, leet, persona). Глубокий аудит.",
    en: "Full corpus with encoding transforms (base64, rot13, leet, persona). Deep audit.",
    kz: "Толық корпус түрлендірулермен. Терең аудит.",
  },
};

export function DatasetsSection() {
  const { lang } = useLang();
  const [data, setData] = useState<DatasetsResponse | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    api.datasets().then(setData).catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <section
      id="datasets"
      className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 py-12 sm:py-20"
    >
      <FadeIn>
        <SectionTag num="002" label={t("datasetsTitle", lang)} />
      </FadeIn>
      <FadeIn delay={50}>
        <p className="text-sm text-gray-500 max-w-2xl mb-8">{t("datasetsDesc", lang)}</p>
      </FadeIn>

      {err && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mb-4">
          <p className="text-[11px] text-amber-700 font-mono">
            /api/datasets: {err}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["base", "v2", "extended"].map((key, idx) => {
          const meta = data?.datasets?.[key];
          const available = meta?.available ?? false;
          return (
            <FadeIn key={key} delay={100 + idx * 100}>
              <div
                className={`rounded-2xl border bg-white shadow-sm p-6 h-full flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 ${
                  available ? "border-gray-200" : "border-dashed border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {key === "base" && <FileText className="w-4 h-4 text-fd-green" />}
                    {key === "v2" && <Layers className="w-4 h-4 text-fd-green" />}
                    {key === "extended" && <Database className="w-4 h-4 text-fd-green" />}
                    <span className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                      {key}
                    </span>
                  </div>
                  {meta?.version && (
                    <span className="text-[10px] font-mono text-gray-400">
                      v{meta.version}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-4 min-h-10">
                  {DATASET_DESCRIPTIONS[key][lang]}
                </p>

                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-3xl font-extrabold text-fd-green tabular-nums">
                    {meta?.total ?? "—"}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    attacks
                  </span>
                </div>

                <div className="space-y-3 mt-auto">
                  {meta?.by_category && (
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 font-bold">
                        by category
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((c) => {
                          const n = meta.by_category?.[c];
                          if (!n) return null;
                          return (
                            <Badge
                              key={c}
                              variant="outline"
                              className={`text-[9px] rounded-md ${CATEGORY_COLORS[c] || CATEGORY_COLORS.default}`}
                            >
                              {c.replace("_", " ")} · {n}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {meta?.by_severity && (
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 font-bold">
                        by severity
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {SEVERITIES.map((s) => {
                          const n = meta.by_severity?.[s];
                          if (!n) return null;
                          return (
                            <Badge
                              key={s}
                              variant="outline"
                              className={`text-[9px] rounded-md ${SEVERITY_COLORS[s]}`}
                            >
                              {s} · {n}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {meta?.meta?.transforms_applied && (
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 font-bold">
                        transforms
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meta.meta.transforms_applied.map((x) => (
                          <span
                            key={x}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
                          >
                            {x}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
