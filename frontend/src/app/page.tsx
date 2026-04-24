"use client";

import { GLSLHills } from "@/components/glsl-hills";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { RunnerSection } from "@/components/runner-section";
import { DatasetsSection } from "@/components/datasets-section";
import { CategoriesSection } from "@/components/categories-section";
import { ArchitectureSection } from "@/components/architecture-section";
import { SiteFooter } from "@/components/site-footer";
import { LangProvider } from "@/context/lang-context";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <div
      className="fixed top-0 left-0 h-0.5 bg-fd-green z-100 transition-all duration-150"
      style={{ width: `${progress}%` }}
    />
  );
}

export default function Home() {
  return (
    <LangProvider>
      <div className="relative min-h-screen bg-white text-gray-900 overflow-x-hidden">
        <ScrollProgress />

        <div className="fixed inset-0 z-0 opacity-45">
          <GLSLHills speed={0.3} />
        </div>

        <div className="relative z-10">
          <Navbar />
          <HeroSection />
          <RunnerSection />
          <DatasetsSection />
          <CategoriesSection />
          <ArchitectureSection />
          <SiteFooter />
        </div>
      </div>
    </LangProvider>
  );
}
