"use client";

import { useEffect, useRef, useState } from "react";
import {
  TIERS_META,
  ttsPhrase,
  videoPhrase,
  type ModelMeta,
  type TierKey,
} from "@/lib/models";

type ModelResult = {
  id: string;
  name: string;
  provider: string;
  flag: string;
  type: "audio" | "video";
  mediaUrl: string | null;
  error: string | null;
};

type ModelState = {
  loading: boolean;
  startedAt: number | null;
  result: ModelResult | null;
  error: string | null;
};

const TIER_META: Record<TierKey, { title: string; subtitle: string }> = {
  tts: {
    title: "Text-to-speech models",
    subtitle: "Hear how 4 leading AI voice models pronounce your brand",
  },
  video: {
    title: "AI video models",
    subtitle: "Watch 4 AI spokespersons say your brand",
  },
};

export function TestSection({ initialBrand }: { initialBrand?: string }) {
  const [brand, setBrand] = useState(initialBrand ?? "");
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, ModelState>>({});
  const [triggered, setTriggered] = useState<Record<TierKey, boolean>>({
    tts: false,
    video: false,
  });
  const aborterRef = useRef<AbortController | null>(null);

  const runModel = async (
    modelId: string,
    targetBrand: string,
    signal: AbortSignal
  ) => {
    const startedAt = Date.now();
    setStates((prev) => ({
      ...prev,
      [modelId]: { loading: true, startedAt, result: null, error: null },
    }));

    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: targetBrand, modelId }),
        signal,
      });
      if (signal.aborted) return;

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }

      const json = (await res.json()) as { result: ModelResult };
      if (signal.aborted) return;

      setStates((prev) => ({
        ...prev,
        [modelId]: {
          loading: false,
          startedAt,
          result: json.result,
          error: null,
        },
      }));
    } catch (e) {
      if (signal.aborted) return;
      const message = e instanceof Error ? e.message : "Unexpected error";
      setStates((prev) => ({
        ...prev,
        [modelId]: { loading: false, startedAt, result: null, error: message },
      }));
    }
  };

  const runTier = (tier: TierKey, targetBrand: string, signal: AbortSignal) => {
    setTriggered((prev) => ({ ...prev, [tier]: true }));
    TIERS_META[tier].forEach((model) => {
      runModel(model.id, targetBrand, signal);
    });
  };

  const runFresh = (target: string) => {
    const trimmed = target.trim();
    if (!trimmed) return;

    aborterRef.current?.abort();
    const ctrl = new AbortController();
    aborterRef.current = ctrl;

    setActiveBrand(trimmed);
    setStates({});
    setTriggered({ tts: false, video: false });
    runTier("tts", trimmed, ctrl.signal);
  };

  useEffect(() => {
    if (initialBrand) runFresh(initialBrand);
    return () => aborterRef.current?.abort();
  }, [initialBrand]);

  const ttsLoading = TIERS_META.tts.some((m) => states[m.id]?.loading);

  return (
    <div id="test" className="w-full max-w-5xl mx-auto px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runFresh(brand);
        }}
        className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto"
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
          disabled={ttsLoading || brand.trim().length === 0}
          className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ttsLoading ? "Testing…" : "Test it free"}
        </button>
      </form>

      {!activeBrand && (
        <p className="mt-4 text-center text-xs text-zinc-500">
          ✓ No signup &nbsp; ✓ 4 voice models &nbsp; ✓ Results in ~7 seconds
        </p>
      )}

      {activeBrand && (
        <div className="mt-12 space-y-12">
          <TierBlock tier="tts" brand={activeBrand} states={states} />

          {triggered.video ? (
            <TierBlock tier="video" brand={activeBrand} states={states} />
          ) : (
            <LockedVideoTier
              onUnlock={() =>
                aborterRef.current &&
                runTier("video", activeBrand, aborterRef.current.signal)
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

function TierBlock({
  tier,
  brand,
  states,
}: {
  tier: TierKey;
  brand: string;
  states: Record<string, ModelState>;
}) {
  const meta = TIER_META[tier];
  const models = TIERS_META[tier];
  const phrase = tier === "video" ? videoPhrase(brand) : ttsPhrase(brand);
  const maxEta = Math.max(...models.map((m) => m.estimatedSeconds));

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">{meta.title}</h3>
          <span className="text-xs text-zinc-500">~{maxEta}s</span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">{meta.subtitle}</p>
      </div>

      <p className="text-xs text-zinc-500 mb-4">
        Listening to{" "}
        <span className="font-mono text-zinc-300">&quot;{phrase}&quot;</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {models.map((m) => (
          <ResultCard key={m.id} model={m} state={states[m.id]} />
        ))}
      </div>
    </div>
  );
}

function LockedVideoTier({ onUnlock }: { onUnlock: () => void }) {
  const meta = TIER_META.video;
  const models = TIERS_META.video;

  return (
    <div className="relative">
      <div className="mb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <LockIcon /> {meta.title}
          </h3>
          <span className="text-xs text-zinc-500">~45s</span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">{meta.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 opacity-60">
        {models.map((m) => (
          <LockedCard key={m.id} model={m} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 text-center">
        <h4 className="text-lg font-semibold text-white">
          Unlock 4 AI video spokespersons saying your brand
        </h4>
        <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
          Veo 3.1, Seedance 2.0, Kling v3 and Happy Horse 1.0 — all generating
          synchronized audio so you can hear *and* see how AI says your brand.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onUnlock}
            className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50"
          >
            Unlock for 9,90€
          </button>
          <a
            href="#pricing"
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            or save with Pro pack →
          </a>
        </div>
        <p className="mt-4 text-[11px] text-zinc-600">
          Free preview during launch · payment activates with V1
        </p>
      </div>
    </div>
  );
}

function LockedCard({ model }: { model: ModelMeta }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="text-base">{model.flag}</span>
        <span>{model.provider}</span>
      </div>
      <div className="mt-1 font-semibold text-zinc-400">{model.name}</div>
      <div className="mt-4 min-h-[60px] flex items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 text-zinc-600">
        <LockIcon />
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function useTick(active: boolean, intervalMs = 100) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
}

function ResultCard({
  model,
  state,
}: {
  model: ModelMeta;
  state: ModelState | undefined;
}) {
  const isLoading = !!state?.loading;
  useTick(isLoading);

  const progress = (() => {
    if (!state) return 0;
    if (state.result || state.error) return 100;
    if (!state.loading || !state.startedAt) return 0;
    const elapsed = Date.now() - state.startedAt;
    const target = model.estimatedSeconds * 1000;
    return Math.min((elapsed / target) * 100, 95);
  })();

  const elapsedSec = state?.startedAt
    ? Math.max(0, Math.round((Date.now() - state.startedAt) / 1000))
    : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="text-base">{model.flag}</span>
        <span>{model.provider}</span>
      </div>
      <div className="mt-1 font-semibold text-zinc-100">{model.name}</div>

      <div className="mt-4 min-h-[60px]">
        {state?.result?.mediaUrl ? (
          state.result.type === "video" ? (
            <video
              controls
              src={state.result.mediaUrl}
              className="w-full rounded-lg bg-black"
            />
          ) : (
            <audio
              controls
              src={state.result.mediaUrl}
              className="w-full [&::-webkit-media-controls-panel]:bg-zinc-800"
            />
          )
        ) : state?.error ? (
          <div className="text-xs text-red-400 break-words">{state.error}</div>
        ) : (
          <ProgressBar
            progress={progress}
            elapsedSec={elapsedSec}
            estimatedSec={model.estimatedSeconds}
            loading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  progress,
  elapsedSec,
  estimatedSec,
  loading,
}: {
  progress: number;
  elapsedSec: number;
  estimatedSec: number;
  loading: boolean;
}) {
  const overrun = elapsedSec > estimatedSec;
  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span>
          {loading ? `${Math.round(progress)}%` : "Queued…"}
          {overrun && " (taking longer than usual)"}
        </span>
        <span>
          {elapsedSec}s / ~{estimatedSec}s
        </span>
      </div>
    </div>
  );
}
