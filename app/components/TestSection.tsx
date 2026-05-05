"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import {
  TIERS_META,
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
    title: "Voice models",
    subtitle: "Hear how 4 leading AI voices pronounce your brand",
  },
  video: {
    title: "Video models",
    subtitle: "Watch 4 AI spokespersons say your brand on camera",
  },
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
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

  const reset = () => {
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

  return (
    <div id="test" className="w-full max-w-5xl mx-auto px-6">
      <AnimatePresence mode="wait" initial={false}>
        {!activeBrand ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="max-w-3xl mx-auto"
          >
            <FormView brand={brand} setBrand={setBrand} onSubmit={runFresh} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: easeOut, delay: 0.05 }}
          >
            <ResultsView
              brand={activeBrand}
              states={states}
              triggered={triggered}
              onReset={reset}
              onUnlockVideo={unlockVideo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormView({
  brand,
  setBrand,
  onSubmit,
}: {
  brand: string;
  setBrand: (b: string) => void;
  onSubmit: (b: string) => void;
}) {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(brand);
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
          disabled={brand.trim().length === 0}
          className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test it free
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-zinc-500">
        ✓ No signup &nbsp; ✓ Voice tests free &nbsp; ✓ 4 voice + 4 video models
      </p>
    </div>
  );
}

function ResultsView({
  brand,
  states,
  triggered,
  onReset,
  onUnlockVideo,
}: {
  brand: string;
  states: Record<string, ModelState>;
  triggered: Record<TierKey, boolean>;
  onReset: () => void;
  onUnlockVideo: () => void;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm shadow-[0_30px_90px_-30px_rgba(168,85,247,0.4)] p-6 sm:p-8">
      <motion.header
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        className="flex items-start justify-between gap-4 mb-8"
      >
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-fuchsia-400">
            Testing
          </p>
          <h2 className="mt-1 text-3xl sm:text-5xl font-bold tracking-tight text-white truncate">
            <span className="text-gradient">{brand}</span>
          </h2>
        </div>
        <button
          onClick={onReset}
          className="shrink-0 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 px-3.5 py-2 text-xs text-zinc-300 transition"
        >
          <ArrowLeftIcon />
          New test
        </button>
      </motion.header>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        className="mb-12"
        transition={{ delay: 0.1 }}
      >
        <TierHeader tier="tts" />
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {TIERS_META.tts.map((m) => (
            <motion.div key={m.id} variants={cardVariants}>
              <ResultCard model={m} state={states[m.id]} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        <TierHeader tier="video" locked={!triggered.video} />

        {triggered.video ? (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {TIERS_META.video.map((m) => (
              <motion.div key={m.id} variants={cardVariants}>
                <ResultCard model={m} state={states[m.id]} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <LockedVideoTier onUnlock={onUnlockVideo} />
        )}
      </motion.section>
    </div>
  );
}

function TierHeader({
  tier,
  locked = false,
}: {
  tier: TierKey;
  locked?: boolean;
}) {
  const meta = TIER_META[tier];
  const models = TIERS_META[tier];
  const maxEta = Math.max(...models.map((m) => m.estimatedSeconds));

  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          {locked && <LockIcon className="w-4 h-4 text-zinc-500" />}
          {meta.title}
        </h3>
        <span className="text-xs text-zinc-500">~{maxEta}s</span>
      </div>
      <p className="text-sm text-zinc-500 mt-1">{meta.subtitle}</p>
    </div>
  );
}

function LockedVideoTier({ onUnlock }: { onUnlock: () => void }) {
  const models = TIERS_META.video;

  return (
    <div className="relative">
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pointer-events-none select-none"
      >
        {models.map((m) => (
          <motion.div key={m.id} variants={cardVariants}>
            <LockedVideoPlaceholder model={m} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOut, delay: 0.4 }}
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-2xl border border-violet-500/40 bg-zinc-950/95 backdrop-blur-md p-6 sm:p-7 text-center shadow-[0_20px_60px_-15px_rgba(168,85,247,0.6)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-violet-200">
            <LockIcon className="w-3 h-3" />
            Pro test · 9,90€
          </div>
          <h4 className="mt-4 text-2xl sm:text-3xl font-bold text-white leading-tight">
            Don&apos;t let AI choose for you.
          </h4>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            Your brand will live in AI ads, UGC and product videos. See how
            Veo, Seedance, Kling and Happy Horse say it on camera —{" "}
            <span className="text-zinc-200 font-medium">
              with native lip-sync
            </span>{" "}
            — before you spend on production.
          </p>
          <button
            onClick={onUnlock}
            className="mt-5 w-full rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50"
          >
            Unlock 4 video spokespersons — 9,90€
          </button>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-zinc-600">
            Free preview during launch
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function LockedVideoPlaceholder({ model }: { model: ModelMeta }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 opacity-60">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="text-base">{model.flag}</span>
        <span>{model.provider}</span>
      </div>
      <div className="mt-1 font-semibold text-zinc-300">{model.name}</div>
      <div className="mt-4 relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-800/40 via-violet-900/15 to-fuchsia-900/15">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.08),_transparent_70%)]" />
      </div>
    </div>
  );
}

function ArrowLeftIcon() {
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
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 h-full">
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
