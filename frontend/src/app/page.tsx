"use client";

import { GLSLHills } from "@/components/glsl-hills";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { DemoSection } from "@/components/demo-section";
import { StepsSection } from "@/components/steps-section";
import { LabelsSection } from "@/components/labels-section";
import { MetricsSection } from "@/components/metrics-section";
import { EvalSection } from "@/components/eval-section";
import { ArchitectureSection } from "@/components/architecture-section";
import { ImprovementsSection } from "@/components/improvements-section";
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
          <DemoSection />
          <StepsSection />
          <LabelsSection />
          <MetricsSection />
          <EvalSection />
          <ArchitectureSection />
          <ImprovementsSection />
          <SiteFooter />
        </div>
      </div>
    </LangProvider>
  );
}
