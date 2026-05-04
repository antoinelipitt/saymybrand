"use client";

import { HALL_OF_SHAME } from "@/data/hall-of-shame";

export function HallOfShame({
  onPick,
}: {
  onPick: (brand: string) => void;
}) {
  return (
    <section id="hall-of-shame" className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-zinc-900">
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-fuchsia-400 mb-3">
          Hall of Shame
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-white">
          Brands the AI keeps massacring
        </h2>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
          Click any brand to hear how the leading AI voice models pronounce it.
          You&apos;ll cringe.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HALL_OF_SHAME.map((b) => (
          <button
            key={b.name}
            onClick={() => onPick(b.name)}
            className="group text-left rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-fuchsia-500/50 hover:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-2xl">
                  <span>{b.flag}</span>
                  <span className="font-bold text-white">{b.name}</span>
                </div>
                <div className="mt-1 text-xs text-zinc-500">{b.origin}</div>
              </div>
              <ScoreBadge score={b.mockScore} />
            </div>

            <div className="mt-4 text-sm text-zinc-400 leading-relaxed">
              {b.reason}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-zinc-500">Correct:</span>
              <span className="font-mono text-zinc-300">
                {b.correctPronunciation}
              </span>
            </div>

            <div className="mt-4 text-xs font-medium text-fuchsia-400 opacity-0 transition group-hover:opacity-100">
              Test it →
            </div>
          </button>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-zinc-600">
        Scores are estimates from sample runs. Live scoring rolls out soon —
        each brand will get its own dedicated page.
      </p>
    </section>
  );
}

function ScoreBadge({ score }: { score: { correct: number; total: number } }) {
  const pct = score.correct / score.total;
  const color =
    pct === 0
      ? "text-red-400 border-red-500/30 bg-red-500/10"
      : pct < 0.5
      ? "text-orange-400 border-orange-500/30 bg-orange-500/10"
      : pct < 1
      ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
      : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

  return (
    <div
      className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-mono ${color}`}
    >
      {score.correct}/{score.total} correct
    </div>
  );
}
