"use client";

type Plan = {
  id: "free" | "starter" | "pro" | "enterprise";
  name: string;
  price: string;
  priceSuffix?: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "0€",
    tagline: "Try it. No signup.",
    features: [
      "1 Voice test",
      "4 AI voice models",
      "Multilingual auto-detect",
      "Listen and judge yourself",
    ],
    cta: "Test now",
  },
  {
    id: "starter",
    name: "Starter",
    price: "9,90€",
    priceSuffix: "one-off",
    tagline: "Make sure your name works in AI ads.",
    features: [
      "1 Full test",
      "4 voice models + 4 video models",
      "Veo 3.1, Seedance 2.0, Kling v3, Happy Horse",
      "Generated audio + lip-synced spokespersons",
    ],
    cta: "Get started",
  },
  {
    id: "pro",
    name: "Pro",
    price: "49€",
    priceSuffix: "one-off",
    tagline: "For naming agencies and brand teams.",
    features: [
      "6 Full tests",
      "All voice + video models",
      "Save 17% vs single tests",
      "Priority queue, faster runs",
    ],
    cta: "Choose Pro",
    highlight: true,
    badge: "Most popular",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="w-full max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-fuchsia-400 mb-3">
          Pricing
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-white">
          Pay only when you ship.
        </h2>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
          Voice tests are free forever. Pay once when you need a full audit
          with video spokespersons saying your brand.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href="mailto:hello@saymybrand.ai?subject=Enterprise%20pricing"
          className="text-sm text-zinc-400 hover:text-white transition"
        >
          Need a custom plan or white-label? <span className="text-fuchsia-400">Contact us for Enterprise →</span>
        </a>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const base =
    "relative rounded-2xl p-6 flex flex-col transition";
  const style = plan.highlight
    ? "border-2 border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 shadow-[0_0_60px_-15px_rgba(168,85,247,0.4)]"
    : "border border-zinc-800 bg-zinc-900/40";

  return (
    <div className={`${base} ${style}`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          {plan.badge}
        </div>
      )}

      <div className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        {plan.name}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white">{plan.price}</span>
        {plan.priceSuffix && (
          <span className="text-sm text-zinc-500">{plan.priceSuffix}</span>
        )}
      </div>

      <p className="mt-2 text-sm text-zinc-400">{plan.tagline}</p>

      <ul className="mt-6 space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        className={`mt-6 rounded-xl py-3 text-sm font-semibold transition ${
          plan.highlight
            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
            : "border border-zinc-700 text-white hover:bg-zinc-800"
        }`}
        onClick={() => {
          if (plan.id === "free") {
            const el = document.getElementById("test");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-fuchsia-400 mt-0.5 shrink-0"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
