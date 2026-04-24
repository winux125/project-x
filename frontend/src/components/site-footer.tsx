"use client";

import Image from "next/image";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/i18n";

export function SiteFooter() {
  const { lang } = useLang();

  return (
    <footer className="border-t border-gray-100 px-4 sm:px-6 md:px-16 py-6 sm:py-8 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image src="/freedom_labs.png" alt="Freedom Labs" width={100} height={25} />
          <span className="text-gray-200">&times;</span>
          <span className="text-[#E91E8C] font-extrabold text-sm tracking-tight">girlygirl</span>
          <div className="flex items-center gap-1.5 ml-3">
            <div className="w-1.5 h-1.5 rounded-full bg-fd-green pulse-dot" />
            <span className="text-[9px] font-mono text-gray-300 tracking-wider uppercase">online</span>
          </div>
        </div>
        <p className="text-gray-300 text-[11px] tracking-wider font-mono">{t("footerText", lang)}</p>
      </div>
    </footer>
  );
}
