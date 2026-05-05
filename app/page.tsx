"use client";

import { useState } from "react";
import { TestSection } from "./components/TestSection";
import { HallOfShame } from "./components/HallOfShame";
import { Pricing } from "./components/Pricing";

export default function Home() {
  const [seedBrand, setSeedBrand] = useState<string | undefined>();

  const handlePick = (brand: string) => {
    setSeedBrand(brand);
    if (typeof window !== "undefined") {
      const el = document.getElementById("test");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="flex flex-col">
      <Nav />

      <Hero>
        <TestSection initialBrand={seedBrand} />
      </Hero>

      <HowItWorks />

      <HallOfShame onPick={handlePick} />

      <Pricing />

      <FinalCta />

      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/60 border-b border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" className="font-semibold text-white tracking-tight">
          SayMyBrand<span className="text-fuchsia-400">.</span>
        </a>
        <div className="flex items-center gap-6 text-sm">
          <a
            href="#hall-of-shame"
            className="hidden sm:inline text-zinc-400 hover:text-white transition"
          >
            Examples
          </a>
          <a
            href="#pricing"
            className="hidden sm:inline text-zinc-400 hover:text-white transition"
          >
            Pricing
          </a>
          <a
            href="#test"
            className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-white transition"
          >
            Try free
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative pt-20 sm:pt-28 pb-20 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.18),_transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_50%_0%,_rgba(217,70,239,0.12),_transparent_70%)]"
      />

      <div className="max-w-3xl mx-auto px-6 text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">
          AI Brand Pronunciation Audit
        </p>
        <h1 className="text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight">
          How AI <span className="text-gradient">hears</span> your brand.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
          Test your brand name across leading AI voice and video models. Hear
          how they say it. Pick the safe ones — or rethink the name before
          your first AI ad campaign.
        </p>
      </div>

      {children}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Type your brand",
      body: "Any brand name, in any language. Auto-detected by the models.",
    },
    {
      num: "02",
      title: "Hear & watch",
      body: "Listen how voice and video AI models pronounce your brand name.",
    },
    {
      num: "03",
      title: "Decide",
      body: "Use the ones that get it right. Avoid the ones that don't. Or rename before going live.",
    },
  ];

  return (
    <section className="border-t border-zinc-900 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-fuchsia-400 mb-3">
            How it works
          </p>
          <h2 className="text-4xl font-bold text-white">
            Three steps to a brand-safe name.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6"
            >
              <div className="text-4xl font-bold text-gradient">{s.num}</div>
              <div className="mt-4 text-lg font-semibold text-white">
                {s.title}
              </div>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-zinc-900 py-24 sm:py-32 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.18),_transparent_65%)]"
      />
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-fuchsia-400 mb-4">
          Ready?
        </p>
        <h2 className="text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight text-white">
          Hear how AI says
          <br />
          <span className="text-gradient">your</span> brand.
        </h2>
        <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto">
          Voice tests are free. Type your brand and listen — judge for
          yourself in a few seconds.
        </p>
        <a
          href="#test"
          className="inline-block mt-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50"
        >
          Test your brand free →
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
        <div>
          SayMyBrand · Built with Next.js + fal.ai · v0
        </div>
        <div className="flex items-center gap-5">
          <a href="#pricing" className="hover:text-white transition">
            Pricing
          </a>
          <a href="#hall-of-shame" className="hover:text-white transition">
            Hall of Shame
          </a>
          <a
            href="https://github.com/antoinelipitt/saymybrand"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
