"use client";

import { Send, Zap, Radar, FileCheck2 } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { SectionTag } from "@/components/section-tag";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/i18n";

const STEPS = [
  { icon: Send,        titleKey: "archStep1" as const, descKey: "archStep1Desc" as const },
  { icon: Zap,         titleKey: "archStep2" as const, descKey: "archStep2Desc" as const },
  { icon: Radar,       titleKey: "archStep3" as const, descKey: "archStep3Desc" as const },
  { icon: FileCheck2,  titleKey: "archStep4" as const, descKey: "archStep4Desc" as const },
];

export function ArchitectureSection() {
  const { lang } = useLang();
  return (
    <section
      id="about"
      className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 py-12 sm:py-20"
    >
      <FadeIn>
        <SectionTag num="004" label={t("archTitle", lang)} />
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <FadeIn key={step.titleKey} delay={100 + idx * 100}>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-fd-green-light/60 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-fd-green" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-300 font-bold tabular-nums">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1.5">
                  {t(step.titleKey, lang)}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t(step.descKey, lang)}
                </p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
