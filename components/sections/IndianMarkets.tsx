import Container from "@/components/ui/Container";

const FACTS = [
  {
    label: "Where you'll learn",
    value: "NSE · BSE",
    note: "India's national exchanges — the only charts we teach on.",
  },
  {
    label: "Instruments covered",
    value: "Equity Cash · Futures & Options · Indices",
    note: "From your first equity setup to understanding index behaviour.",
  },
  {
    label: "Indices you'll read daily",
    value: "NIFTY 50 · SENSEX · BANK NIFTY",
    note: "The pulse of Indian price action, and how the pieces move together.",
  },
  {
    label: "Market hours (IST)",
    value: "Pre-open 09:00 · Session 09:15 – 15:30",
    note: "Timings for learning context — always confirm with exchange calendars.",
  },
];

/**
 * Indian market learning section. Entirely static/server-rendered —
 * factual orientation content, no animation required.
 */
export default function IndianMarkets() {
  return (
    <section id="indian-markets" className="relative border-t border-white/5 py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(15,174,125,0.05),transparent_55%)]"
      />
      <Container className="relative grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold-500">
            Home ground
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-cream-100 sm:text-4xl xl:text-5xl">
            Rooted in the
            <br />
            Indian markets.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-cream-300">
            Global concepts mean nothing without local context. Every example,
            every chart and every session at MECHWEALTH is grounded in the
            structure and rhythm of India’s exchanges — the market you’ll
            actually trade.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["NIFTY 50", "SENSEX", "BANK NIFTY", "F&O", "EQUITY CASH"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-300"
                >
                  {chip}
                </span>
              )
            )}
          </div>
        </div>

        <dl className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {FACTS.map((fact) => (
            <div key={fact.label} className="py-6 first:pt-0 last:pb-0">
              <dt className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-500/80">
                {fact.label}
              </dt>
              <dd className="mt-2 font-display text-lg font-medium text-cream-100 sm:text-xl">
                {fact.value}
              </dd>
              <dd className="mt-1.5 text-sm leading-relaxed text-cream-500">
                {fact.note}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
