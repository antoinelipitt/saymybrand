"use client";

import { useEffect, useState } from "react";

type ModelResult = {
  id: string;
  name: string;
  provider: string;
  flag: string;
  type: "audio" | "video";
  mediaUrl: string | null;
  error: string | null;
};

type TierKey = "top3" | "more" | "video";

type TestResponse = {
  brand: string;
  prompt: string;
  tier: TierKey;
  results: ModelResult[];
};

type TierState = {
  loading: boolean;
  data: TestResponse | null;
  error: string | null;
};

const initialTierState: TierState = { loading: false, data: null, error: null };

const TIER_META: Record<TierKey, { title: string; subtitle: string; eta: string }> = {
  top3: {
    title: "Top 3 multilingual TTS",
    subtitle: "Most-used multilingual TTS available on fal.ai",
    eta: "~10s",
  },
  more: {
    title: "More TTS models",
    subtitle: "Other multilingual TTS worth a listen",
    eta: "~10s",
  },
  video: {
    title: "AI video models",
    subtitle: "Watch a spokesperson say your brand",
    eta: "30–60s",
  },
};

export function TestSection({ initialBrand }: { initialBrand?: string }) {
  const [brand, setBrand] = useState(initialBrand ?? "");
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [tiers, setTiers] = useState<Record<TierKey, TierState>>({
    top3: initialTierState,
    more: initialTierState,
    video: initialTierState,
  });

  const runTier = async (target: string, tier: TierKey) => {
    const trimmed = target.trim();
    if (!trimmed) return;

    setTiers((prev) => ({ ...prev, [tier]: { loading: true, data: null, error: null } }));

    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: trimmed, tier }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Request failed (${res.status})`);
      }
      const json = (await res.json()) as TestResponse;
      setTiers((prev) => ({ ...prev, [tier]: { loading: false, data: json, error: null } }));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unexpected error";
      setTiers((prev) => ({ ...prev, [tier]: { loading: false, data: null, error: message } }));
    }
  };

  const runFresh = (target: string) => {
    setActiveBrand(target.trim());
    setTiers({ top3: initialTierState, more: initialTierState, video: initialTierState });
    runTier(target, "top3");
  };

  useEffect(() => {
    if (initialBrand) runFresh(initialBrand);
  }, [initialBrand]);

  return (
    <div id="test" className="w-full max-w-3xl mx-auto px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runFresh(brand);
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Type a brand name (e.g. Bvlgari)"
          maxLength={50}
          className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="submit"
          disabled={tiers.top3.loading || brand.trim().length === 0}
          className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tiers.top3.loading ? "Testing…" : "Test it"}
        </button>
      </form>

      {activeBrand && (
        <div className="mt-12 space-y-12">
          <TierBlock tier="top3" state={tiers.top3} />

          {tiers.top3.data && !tiers.more.data && !tiers.more.loading && (
            <NextTierCta
              tier="more"
              onClick={() => activeBrand && runTier(activeBrand, "more")}
            />
          )}
          {(tiers.more.loading || tiers.more.data || tiers.more.error) && (
            <TierBlock tier="more" state={tiers.more} />
          )}

          {tiers.top3.data && !tiers.video.data && !tiers.video.loading && (
            <NextTierCta
              tier="video"
              onClick={() => activeBrand && runTier(activeBrand, "video")}
            />
          )}
          {(tiers.video.loading || tiers.video.data || tiers.video.error) && (
            <TierBlock tier="video" state={tiers.video} />
          )}
        </div>
      )}
    </div>
  );
}

function TierBlock({ tier, state }: { tier: TierKey; state: TierState }) {
  const meta = TIER_META[tier];

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">{meta.title}</h3>
          <span className="text-xs text-zinc-500">{meta.eta}</span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">{meta.subtitle}</p>
      </div>

      {state.loading && <Loading tier={tier} />}

      {state.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
          {state.error}
        </div>
      )}

      {state.data && (
        <>
          <p className="text-xs text-zinc-500 mb-4">
            Listening to{" "}
            <span className="font-mono text-zinc-300">"{state.data.prompt}"</span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.data.results.map((r) => (
              <ResultCard key={r.id} result={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NextTierCta({ tier, onClick }: { tier: TierKey; onClick: () => void }) {
  const meta = TIER_META[tier];
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-left transition hover:border-fuchsia-500/50 hover:bg-zinc-900/50"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-white">{meta.title}</div>
          <div className="text-sm text-zinc-500 mt-1">{meta.subtitle}</div>
        </div>
        <div className="text-fuchsia-400 text-sm font-medium shrink-0">
          Run this test →
        </div>
      </div>
      <div className="mt-3 text-xs text-zinc-600">Estimated wait: {meta.eta}</div>
    </button>
  );
}

function Loading({ tier }: { tier: TierKey }) {
  return (
    <div className="flex items-center gap-3 text-zinc-400 py-4">
      <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
      <div className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400 [animation-delay:150ms]" />
      <div className="h-2 w-2 animate-pulse rounded-full bg-rose-400 [animation-delay:300ms]" />
      <span className="ml-2 text-sm">
        {tier === "video"
          ? "Generating videos — this takes 30–60 seconds…"
          : "Generating across multiple AI voice models…"}
      </span>
    </div>
  );
}

function ResultCard({ result }: { result: ModelResult }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="text-base">{result.flag}</span>
        <span>{result.provider}</span>
      </div>
      <div className="mt-1 font-semibold text-zinc-100">{result.name}</div>
      <div className="mt-4">
        {result.mediaUrl ? (
          result.type === "video" ? (
            <video
              controls
              src={result.mediaUrl}
              className="w-full rounded-lg bg-black"
            />
          ) : (
            <audio
              controls
              src={result.mediaUrl}
              className="w-full [&::-webkit-media-controls-panel]:bg-zinc-800"
            />
          )
        ) : (
          <div className="text-xs text-red-400">
            {result.error ?? "No media returned"}
          </div>
        )}
      </div>
    </div>
  );
}
