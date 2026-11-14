"use client";

import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";

const PRINCIPLES = [
  {
    num: "01",
    title: "Process over prediction",
    body: "Nobody knows what the next candle does — not analysts, not fund managers, not you. What you can control is how you prepare, enter, manage and exit. Process compounds; predictions don't.",
  },
  {
    num: "02",
    title: "Risk first. Reward second.",
    body: "Amateurs ask how much they can make. Professionals ask how much they can lose. Every idea in the academy starts with the downside, because surviving the market is the prerequisite for profiting from it.",
  },
  {
    num: "03",
    title: "The journal is the edge",
    body: "Your trades are data. Written down and reviewed, they become a mirror — showing you exactly where discipline holds and where it breaks. We treat journaling as a core skill, not homework.",
  },
  {
    num: "04",
    title: "Patience is a position",
    body: "Most of trading is doing nothing well. Waiting for price to reach your level is not inactivity — it's the trade happening before the trade. Boredom, managed well, is a strategy.",
  },
];

/**
 * Trading Mindset — editorial principles. Motion is entrance-only
 * (fade/rise on scroll) and disabled under prefers-reduced-motion.
 */
export default function TradingMindset() {
  const reduce = useReducedMotion();

  return (
    <section id="mindset" className="relative border-t border-white/5 py-28">
      <Container>
        <div className="max-w-2xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold-500"
          >
            The MECHWEALTH mindset
          </motion.p>
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="mt-4 font-display text-3xl font-semibold leading-tight text-cream-100 sm:text-4xl xl:text-5xl"
          >
            Charts can be taught.
            <br />
            Temperament has to be built.
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-5 max-w-xl text-cream-300"
          >
            Most people don’t fail at analysis — they fail between entries.
            Before any strategy, we build the four habits that hold everything
            else up.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.05] md:grid-cols-2">
          {PRINCIPLES.map((pr, i) => (
            <motion.div
              key={pr.num}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-ink-950 p-8 transition-colors duration-500 hover:bg-ink-900 sm:p-10"
            >
              <span className="font-mono text-xs tracking-[0.3em] text-gold-500/80">
                {pr.num}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-cream-100">
                {pr.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-500 transition-colors duration-500 group-hover:text-cream-300">
                {pr.body}
              </p>
              <div className="mt-6 h-px w-10 bg-gold-500/40 transition-all duration-700 ease-out group-hover:w-full group-hover:bg-gold-500/60" />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
