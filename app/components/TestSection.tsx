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
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

const layoutTransition = { duration: 0.55, ease: easeOut };

function smoothScrollToId(id: string, offset: number, duration: number) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  const startTime = performance.now();
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

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

  useEffect(() => {
    if (!activeBrand || typeof window === "undefined") return;
    const id = requestAnimationFrame(() => {
      smoothScrollToId("test", 96, 900);
    });
    return () => cancelAnimationFrame(id);
  }, [activeBrand]);

  return (
    <div id="test" className="w-full max-w-5xl mx-auto px-6 scroll-mt-24">
      <div className="relative min-h-[150px]">
        <AnimatePresence initial={false}>
          {!activeBrand && (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-x-0 top-0"
            >
              <div className="max-w-3xl mx-auto">
                <FormView
                  brand={brand}
                  setBrand={setBrand}
                  onSubmit={runFresh}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {activeBrand && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
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
  const trimmed = brand.trim();

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed) onSubmit(trimmed);
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Type a brand name (e.g. Bvlgari)"
            maxLength={50}
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-lg text-transparent placeholder:text-zinc-500 caret-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {brand.length > 0 && (
            <motion.span
              layoutId="brand-text"
              transition={layoutTransition}
              className="absolute inset-0 px-5 py-4 text-lg font-medium text-gradient pointer-events-none flex items-center truncate"
            >
              {brand}
            </motion.span>
          )}
        </div>
        <motion.button
          layoutId="primary-cta"
          transition={layoutTransition}
          type="submit"
          className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/30 transition-shadow hover:shadow-violet-500/50"
        >
          <motion.span layout="position">Test it free</motion.span>
        </motion.button>
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
  const showUnlock = !triggered.video;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm shadow-[0_30px_90px_-30px_rgba(168,85,247,0.4)] p-6 sm:p-8">
      <header className="flex items-start justify-between gap-4 mb-10">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-fuchsia-400">
            Testing
          </p>
          <motion.h2
            layoutId="brand-text"
            transition={layoutTransition}
            className="mt-1 text-4xl sm:text-6xl font-bold tracking-tight text-gradient truncate"
          >
            {brand}
          </motion.h2>
        </div>

        <motion.button
          layoutId="primary-cta"
          transition={layoutTransition}
          onClick={showUnlock ? onUnlockVideo : onReset}
          className={
            showUnlock
              ? "rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-shadow hover:shadow-violet-500/50"
              : "rounded-full border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 px-3.5 py-2 text-xs text-zinc-300 transition-colors"
          }
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={showUnlock ? "unlock" : "new"}
              layout="position"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="inline-block whitespace-nowrap"
            >
              {showUnlock ? "Unlock Full test" : "← New test"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </header>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.05 }}
        className="mb-12"
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
        transition={{ delay: 0.15 }}
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
          <LockedVideoTier />
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
      <p className="text-sm text-zinc-500 mt-1">
        {locked ? (
          <>
            Don&apos;t let AI choose for you. See how 4 AI spokespersons say
            your brand on camera —{" "}
            <span className="text-zinc-300">use the unlock button above</span>.
          </>
        ) : (
          meta.subtitle
        )}
      </p>
    </div>
  );
}

function LockedVideoTier() {
  const models = TIERS_META.video;

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {models.map((m) => (
        <motion.div key={m.id} variants={cardVariants}>
          <LockedVideoPlaceholder model={m} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function LockedVideoPlaceholder({ model }: { model: ModelMeta }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
        <span className="text-sm">{model.flag}</span>
        <span>{model.provider}</span>
      </div>
      <div className="mt-0.5 text-sm font-semibold text-zinc-100 truncate">
        {model.name}
      </div>
      <div className="mt-3 relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-800/40 via-violet-900/15 to-fuchsia-900/15">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.10),_transparent_70%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-zinc-700/80 bg-zinc-950/70 backdrop-blur-sm p-2.5">
            <LockIcon className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
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

  const isVideo = model.type === "video";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 h-full">
      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
        <span className="text-sm">{model.flag}</span>
        <span>{model.provider}</span>
      </div>
      <div className="mt-0.5 text-sm font-semibold text-zinc-100 truncate">
        {model.name}
      </div>

      {isVideo ? (
        <div className="mt-3 relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
          {state?.result?.mediaUrl ? (
            <video
              controls
              src={state.result.mediaUrl}
              className="absolute inset-0 w-full h-full"
            />
          ) : state?.error ? (
            <div className="absolute inset-0 flex items-center justify-center p-3 text-xs text-red-400 text-center break-words">
              {state.error}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="w-full max-w-[220px]">
                <ProgressBar
                  progress={progress}
                  elapsedSec={elapsedSec}
                  estimatedSec={model.estimatedSeconds}
                  loading={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      ) : state?.error ? (
        <div className="mt-3 text-xs text-red-400 break-words">
          {state.error}
        </div>
      ) : (
        <AudioBar
          src={state?.result?.mediaUrl ?? null}
          progress={progress}
        />
      )}
    </div>
  );
}

function AudioBar({
  src,
  progress,
}: {
  src: string | null;
  progress: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ready = !!src;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      // ignore autoplay rejections
    }
  };

  const audioProgress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const displayProgress = ready ? audioProgress : progress;

  return (
    <div className="mt-3">
      {ready && src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={() =>
            setCurrentTime(audioRef.current?.currentTime ?? 0)
          }
          onLoadedMetadata={() =>
            setDuration(audioRef.current?.duration ?? 0)
          }
        />
      )}

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={ready ? toggle : undefined}
          disabled={!ready}
          aria-label={ready ? (playing ? "Pause" : "Play") : "Generating audio"}
          className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            !ready
              ? "bg-zinc-800 text-zinc-400 ring-1 ring-inset ring-zinc-700/60 cursor-default"
              : playing
                ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 ring-1 ring-inset ring-zinc-700 cursor-pointer"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={!ready ? "loader" : playing ? "pause" : "play"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18, ease: easeOut }}
              className="flex"
            >
              {!ready ? (
                <SpinnerIcon />
              ) : playing ? (
                <PauseIcon />
              ) : (
                <PlayIcon />
              )}
            </motion.span>
          </AnimatePresence>
        </button>

        <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            animate={{ width: `${displayProgress}%` }}
            transition={{ duration: ready ? 0.1 : 0.15, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 1-9 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
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
