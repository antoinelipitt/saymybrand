"use client";

import { useEffect, useState } from "react";

type ModelResult = {
  id: string;
  name: string;
  provider: string;
  flag: string;
  audioUrl: string | null;
  error: string | null;
};

type TestResponse = {
  brand: string;
  prompt: string;
  results: ModelResult[];
};

export function TestSection({ initialBrand }: { initialBrand?: string }) {
  const [brand, setBrand] = useState(initialBrand ?? "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (target: string) => {
    const trimmed = target.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: trimmed }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Request failed (${res.status})`);
      }
      const json = (await res.json()) as TestResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBrand) runTest(initialBrand);
  }, [initialBrand]);

  return (
    <div id="test" className="w-full max-w-3xl mx-auto px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runTest(brand);
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
          disabled={loading || brand.trim().length === 0}
          className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Testing…" : "Test it"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-3 text-zinc-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400 [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-rose-400 [animation-delay:300ms]" />
          <span className="ml-2">
            Generating across {3} AI voice models…
          </span>
        </div>
      )}

      {data && (
        <div className="mt-10 space-y-4">
          <p className="text-sm text-zinc-500">
            Listening to{" "}
            <span className="font-mono text-zinc-300">"{data.prompt}"</span>{" "}
            — judge for yourself.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.results.map((r) => (
              <ResultCard key={r.id} result={r} />
            ))}
          </div>
        </div>
      )}
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
        {result.audioUrl ? (
          <audio
            controls
            src={result.audioUrl}
            className="w-full [&::-webkit-media-controls-panel]:bg-zinc-800"
          />
        ) : (
          <div className="text-xs text-red-400">
            {result.error ?? "No audio returned"}
          </div>
        )}
      </div>
    </div>
  );
}
