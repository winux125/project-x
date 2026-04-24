"use client";

import Image from "next/image";
import { useLang } from "@/context/lang-context";
import { t, LANG_LABELS, type Lang } from "@/lib/i18n";

const LANG_SHORT: Record<Lang, string> = { ru: "RUS", en: "ENG", kz: "QAZ" };

export function Navbar() {
  const { lang, setLang } = useLang();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-3 md:px-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Image src="/freedom_labs.png" alt="Freedom Labs" width={120} height={30} />
          <div className="w-px h-5 bg-gray-200 hidden sm:block" />
          <span className="text-[#E91E8C] font-extrabold text-sm tracking-tight hidden sm:inline">
            girlygirl
          </span>
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

          <div className="flex items-center gap-1.5">
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
