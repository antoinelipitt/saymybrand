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
    subtitle: "4 leading AI voice models pronounce your brand",
  },
  video: {
    title: "AI video models",
    subtitle: "4 AI spokespersons say your brand on camera",
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

  const closeModal = () => {
    aborterRef.current?.abort();
    setActiveBrand(null);
    setStates({});
    setTriggered({ tts: false, video: false });
  };

  const unlockVideo = () => {
    if (!activeBrand || !aborterRef.current) return;
    runTier("video", activeBrand, aborterRef.current.signal);
  };

  useEffect(() => {
    if (initialBrand) {
      setBrand(initialBrand);
      runFresh(initialBrand);
    }
    return () => aborterRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBrand]);

  const ttsLoading = TIERS_META.tts.some((m) => states[m.id]?.loading);

  return (
    <>
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
            disabled={ttsLoading || brand.trim().length === 0}
            className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ttsLoading ? "Testing…" : "Test it free"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          ✓ No signup &nbsp; ✓ Voice tests free &nbsp; ✓ 4 voice + 4 video
          models
        </p>
      </div>

      {activeBrand && (
        <ResultsModal
          brand={activeBrand}
          states={states}
          triggered={triggered}
          onUnlockVideo={unlockVideo}
          onClose={closeModal}
        />
      )}
    </>
  );
}

function ResultsModal({
  brand,
  states,
  triggered,
  onUnlockVideo,
  onClose,
}: {
  brand: string;
  states: Record<string, ModelState>;
  triggered: Record<TierKey, boolean>;
  onUnlockVideo: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
        <div
          className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-950 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-900 bg-zinc-950/95 backdrop-blur px-6 py-4 rounded-t-2xl">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-fuchsia-400">
                Testing
              </p>
              <h2 className="text-2xl font-semibold text-white truncate">
                {brand}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-12">
            <TierBlock tier="tts" brand={brand} states={states} />

            {triggered.video ? (
              <TierBlock tier="video" brand={brand} states={states} />
            ) : (
              <LockedVideoTier onUnlock={onUnlockVideo} />
            )}
          </div>
        </div>
      </div>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    <div>
      <div className="mb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <LockIcon className="w-4 h-4 text-zinc-500" />
            {meta.title}
          </h3>
          <span className="text-[11px] text-zinc-500">Unlock — 9,90€</span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">
          {meta.subtitle}. Click any to unlock the full set.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {models.map((m) => (
          <LockedVideoCard key={m.id} model={m} onUnlock={onUnlock} />
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-zinc-600">
        Free preview during launch · payment activates with V1
      </p>
    </div>
  );
}

function LockedVideoCard({
  model,
  onUnlock,
}: {
  model: ModelMeta;
  onUnlock: () => void;
}) {
  return (
    <button
      onClick={onUnlock}
      className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-left transition hover:border-violet-500/40 hover:bg-zinc-900/70"
    >
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="text-base">{model.flag}</span>
        <span>{model.provider}</span>
      </div>
      <div className="mt-1 font-semibold text-zinc-200">{model.name}</div>

      <div className="mt-4 relative aspect-video rounded-lg overflow-hidden border border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/40 via-violet-900/15 to-fuchsia-900/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.12),_transparent_70%)]" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-zinc-700 bg-zinc-950/80 p-3 transition group-hover:border-violet-400 group-hover:bg-violet-500/20">
            <LockIcon className="w-4 h-4 text-zinc-400 transition group-hover:text-violet-200" />
          </div>
        </div>
      </div>

      <div className="mt-3 text-center text-[11px] text-zinc-500 transition group-hover:text-violet-300">
        Click to unlock
      </div>
    </button>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
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
      className={className}
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
              className="w-full rounded-lg bg-black aspect-video"
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
