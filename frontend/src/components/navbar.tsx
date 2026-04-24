"use client";

import { ShieldAlert } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { t, LANG_LABELS, type Lang } from "@/lib/i18n";

const LANG_SHORT: Record<Lang, string> = { ru: "RUS", en: "ENG", kz: "QAZ" };

const NAV_ITEMS: { id: string; key: "navRunner" | "navDatasets" | "navCategories" | "navAbout" }[] = [
  { id: "runner",     key: "navRunner" },
  { id: "datasets",   key: "navDatasets" },
  { id: "categories", key: "navCategories" },
  { id: "about",      key: "navAbout" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Navbar() {
  const { lang, setLang } = useLang();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-3 md:px-16 max-w-7xl mx-auto">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-md bg-fd-green flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-gray-900">
            {t("brand", lang)}
          </span>
        </button>

        <div className="hidden md:flex items-center gap-6 text-[11px] font-mono tracking-wider uppercase text-gray-500">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="hover:text-fd-green transition-colors cursor-pointer"
            >
              {t(item.key, lang)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1 text-[10px] font-mono tracking-wider">
            {(Object.keys(LANG_LABELS) as Lang[]).map((l, i) => (
              <span key={l} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">/</span>}
                <button
                  onClick={() => setLang(l)}
                  className={`cursor-pointer transition-all px-1.5 py-0.5 rounded ${
                    lang === l
                      ? "text-fd-green font-bold bg-fd-green-light scale-105"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {LANG_SHORT[l]}
                </button>
              </span>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-fd-green pulse-dot" />
            <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase">
              {t("hackathon", lang)}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
