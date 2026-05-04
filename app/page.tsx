"use client";

import { useState } from "react";
import { TestSection } from "./components/TestSection";
import { HallOfShame } from "./components/HallOfShame";

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
      <section className="relative pt-24 sm:pt-32 pb-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_60%)]"
        />
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">
            AI Brand Audit · v0
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold leading-tight tracking-tight">
            How AI <span className="text-gradient">hears</span> your brand.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
            Test your brand name across the leading AI voice models in one
            click. Hear how they say it. Pick the safe ones — or rethink the
            name.
          </p>
        </div>

        <div className="mt-12">
          <TestSection initialBrand={seedBrand} />
        </div>
      </section>

      <HallOfShame onPick={handlePick} />

      <section className="border-t border-zinc-900 py-20">
        <div className="max-w-5xl mx-auto px-6 grid gap-10 sm:grid-cols-3 text-center">
          <Feature
            title="Multilingual"
            body="Models picked specifically for auto language detection — the test isn't biased by an enforced language."
          />
          <Feature
            title="Multi-model"
            body="ElevenLabs, Gemini Flash and MiniMax for voice. Veo 3.1, Seedance and Kling for video. All on fal.ai."
          />
          <Feature
            title="Honest"
            body="No score, no hype. You hear the result and you decide. The judgment is yours."
          />
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-600">
        SayMyBrand · Built with Next.js + fal.ai · v0
      </footer>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-lg font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}
