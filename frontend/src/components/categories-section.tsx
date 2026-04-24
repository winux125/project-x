"use client";

import { Syringe, KeyRound, FileSearch, Skull } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { SectionTag } from "@/components/section-tag";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/i18n";

const ITEMS = [
  { icon: Syringe,    titleKey: "categoryPI" as const, descKey: "categoryPIDesc" as const, accent: "bg-rose-100 text-rose-600" },
  { icon: KeyRound,   titleKey: "categoryJB" as const, descKey: "categoryJBDesc" as const, accent: "bg-violet-100 text-violet-600" },
  { icon: FileSearch, titleKey: "categorySL" as const, descKey: "categorySLDesc" as const, accent: "bg-amber-100 text-amber-600" },
  { icon: Skull,      titleKey: "categoryHC" as const, descKey: "categoryHCDesc" as const, accent: "bg-orange-100 text-orange-600" },
];

export function CategoriesSection() {
  const { lang } = useLang();
  return (
    <section
      id="categories"
      className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 py-12 sm:py-20"
    >
      <FadeIn>
        <SectionTag num="003" label={t("categoriesTitle", lang)} />
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <FadeIn key={item.titleKey} delay={100 + idx * 80}>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-1.5">
                    {t(item.titleKey, lang)}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(item.descKey, lang)}
                  </p>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
