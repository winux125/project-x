"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";
import { TypingText } from "@/components/typing-text";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/i18n";
import { TYPING_MAP } from "@/config/constants";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  const { lang } = useLang();

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 min-h-[calc(100dvh-53px)] flex items-center justify-center">
      <FadeIn>
        <div className="flex flex-col items-center text-center py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-fd-green/20 bg-fd-green-light/50 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-fd-green" />
            <span className="text-[11px] text-fd-green tracking-widest uppercase font-bold font-mono">
              {t("heroTag", lang)}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter mb-6">
            <span className="text-fd-green">Kaz</span>
            <span className="text-gray-900">Punct</span>
          </h1>

          <div className="h-8 mb-3">
            <TypingText
              key={lang}
              texts={TYPING_MAP[lang]}
              className="text-sm sm:text-lg md:text-xl text-gray-500 font-light"
            />
          </div>

          <p className="text-sm text-gray-400 max-w-md mb-12 leading-relaxed">
            {t("heroDesc", lang)}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => scrollTo("demo")}
              className="bg-fd-green text-white hover:bg-fd-green/90 hover:shadow-xl hover:shadow-fd-green/20 font-semibold text-sm px-8 py-5 rounded-lg shadow-lg shadow-fd-green/20 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              {t("tryDemo", lang)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollTo("how")}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold text-sm px-8 py-5 rounded-lg cursor-pointer transition-all duration-300 w-full sm:w-auto"
            >
              {t("howItWorks", lang)}
            </Button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
