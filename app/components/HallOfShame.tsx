"use client";

import { HALL_OF_SHAME } from "@/data/hall-of-shame";

export function HallOfShame({
  onPick,
}: {
  onPick: (brand: string) => void;
}) {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-fuchsia-400 mb-3">
          Hall of Shame
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-white">
          Brands the AI keeps massacring
        </h2>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
          Click any brand to hear how the leading AI voice models pronounce it.
          You'll cringe.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {HALL_OF_SHAME.map((b) => (
          <button
            key={b.name}
            onClick={() => onPick(b.name)}
            className="group text-left rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-fuchsia-500/50 hover:bg-zinc-900"
          >
            <div className="flex items-center gap-2 text-2xl">
              <span>{b.flag}</span>
              <span className="font-bold text-white">{b.name}</span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">{b.origin}</div>
            <div className="mt-3 text-sm text-zinc-400 leading-relaxed">
              {b.reason}
            </div>
            <div className="mt-4 text-xs font-medium text-fuchsia-400 opacity-0 transition group-hover:opacity-100">
              Test it →
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
