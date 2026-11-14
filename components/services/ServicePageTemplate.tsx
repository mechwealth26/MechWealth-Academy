"use client";

import CtaPattern from "@/components/ui/CtaPattern";

import { useState } from "react";
import Link from "next/link";
import {
  Reveal,
  RevealListItem,
} from "@/components/about/StorySections";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import ServiceAnimation from "@/components/services/ServiceAnimation";
import Container from "@/components/ui/Container";
import {
  ClickableCardAccent,
  ClickableCardArrow,
  clickableCardInteraction,
} from "@/components/ui/ClickableCard";
import { buttonClasses } from "@/lib/buttonStyles";
import type { Service } from "@/data/services";

export default function ServicePageTemplate({
  service,
  others,
}: {
  service: Service;
  others: Service[];
}) {
  const [visualActive, setVisualActive] = useState(false);

  return (
    <main id="main" className="relative min-h-screen">
      <header className="relative isolate overflow-hidden border-b border-white/[0.07]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(var(--theme-grid) 1px, transparent 1px), linear-gradient(90deg, var(--theme-grid) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <Container className="relative z-10 grid min-h-[48rem] gap-12 pb-20 pt-24 sm:pt-28 lg:grid-cols-[minmax(0,7fr)_minmax(24rem,5fr)] lg:items-start lg:gap-20">
          <div className="min-w-0">
            <Reveal>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Services", href: "/services" },
                  { label: service.title },
                ]}
              />
              <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">
                {service.index} · {service.category}
              </p>
              <h1 className="mt-6 max-w-4xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.04em] text-cream-100 sm:text-6xl lg:text-7xl">
                <span className="block">{service.heroTitle[0]}</span>
                <span className="block text-cream-300">{service.heroTitle[1]}</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-copy-secondary">
                {service.tagline}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/contact" className={buttonClasses("primary", "lg")}>
                  Discuss this service <span aria-hidden>→</span>
                </Link>
                <a href="#service-overview" className={buttonClasses("secondary", "lg")}>
                  Understand the process <span aria-hidden>↓</span>
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div
              onMouseEnter={() => setVisualActive(true)}
              onMouseLeave={() => setVisualActive(false)}
              className="relative min-h-[24rem] overflow-hidden border border-white/[0.1] bg-black/20 transition-[border-color,box-shadow] duration-300 ease-out hover:border-gold-400/30 hover:shadow-[0_24px_60px_-32px_rgba(232,201,106,0.24)] [border-radius:var(--radius-lg)] sm:min-h-[28rem]"
            >
              <div className="absolute inset-0">
                <ServiceAnimation motif={service.motif} active={visualActive} />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent px-6 pb-6 pt-20">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-gold-400/75">
                    Service {service.index} / 05
                  </p>
                  <p className="mt-2 font-display text-xl text-cream-100">{service.title}</p>
                </div>
                <p className="max-w-28 text-right font-mono text-[8px] uppercase leading-4 tracking-[0.18em] text-cream-500">
                  Explain · organise · follow through
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </header>

      <section id="service-overview" className="scroll-mt-20 py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <article>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-400">What it is</p>
                <h2 className="mt-5 font-display text-3xl leading-[1.12] text-cream-100 sm:text-4xl">
                  The service, without the shorthand.
                </h2>
                <p className="mt-6 text-base leading-8 text-copy-secondary">{service.summary}</p>
              </article>
            </Reveal>
            <Reveal delay={0.08}>
              <article className="border-l border-gold-400/35 pl-7 sm:pl-9">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-400">Why it matters</p>
                <p className="mt-5 font-display text-2xl leading-relaxed text-cream-100 sm:text-3xl">
                  {service.whyItMatters}
                </p>
              </article>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.07] bg-black/15 py-24 sm:py-32">
        <Container>
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">Scope of work</p>
            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(20rem,5fr)] lg:items-end">
              <h2 className="font-display text-4xl leading-[1.06] text-cream-100 sm:text-5xl">
                Four areas. One connected record.
              </h2>
              <p className="text-sm leading-7 text-copy-secondary">
                The work is organised around these service-specific components, then adapted to the facts and requirements of your case.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] md:grid-cols-2 [border-radius:var(--radius-lg)]">
            {service.areas.map((area, index) => (
              <Reveal key={area.title} delay={index * 0.06}>
                <article className="h-full bg-ink-950 p-7 sm:p-9">
                  <p className="font-mono text-[9px] tracking-[0.22em] text-gold-400/70">0{index + 1}</p>
                  <h3 className="mt-8 font-display text-2xl text-cream-100">{area.title}</h3>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-copy-secondary">{area.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(18rem,4fr)_minmax(0,8fr)] lg:gap-20">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">The process</p>
                <h2 className="mt-5 font-display text-4xl leading-[1.08] text-cream-100 sm:text-5xl">
                  A visible route from question to next step.
                </h2>
                <p className="mt-6 max-w-sm text-sm leading-7 text-copy-secondary">
                  Requirements can change by provider, authority and case. The process stays readable throughout.
                </p>
              </div>
            </Reveal>
            <ol className="grid gap-5">
              {service.steps.map((step, index) => (
                <RevealListItem
                  key={step.title}
                  delay={index * 0.06}
                  className="grid gap-5 border border-white/[0.08] bg-white/[0.018] p-6 sm:grid-cols-[4rem_minmax(0,1fr)] sm:p-8 [border-radius:var(--radius-lg)]"
                >
                  <p className="font-mono text-[10px] tracking-[0.22em] text-gold-400">0{index + 1}</p>
                  <div>
                    <h3 className="font-display text-2xl text-cream-100">{step.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-copy-secondary">{step.body}</p>
                  </div>
                </RevealListItem>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.07] bg-gold-400/[0.025] py-24 sm:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
            <div>
              <Reveal>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">Who it is for</p>
                <h2 className="mt-5 font-display text-4xl leading-[1.08] text-cream-100 sm:text-5xl">
                  The right fit starts with the situation.
                </h2>
              </Reveal>
              <ul className="mt-10 grid gap-4">
                {service.whoFor.map((item, index) => (
                  <RevealListItem
                    key={item}
                    delay={index * 0.06}
                    className="flex gap-4 text-sm leading-7 text-copy-secondary"
                  >
                    <span aria-hidden className="mt-3 h-1 w-1 shrink-0 rounded-full bg-gold-400" />
                    {item}
                  </RevealListItem>
                ))}
              </ul>
            </div>
            <div>
              <Reveal>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">Practical outcomes</p>
                <h2 className="mt-5 font-display text-4xl leading-[1.08] text-cream-100 sm:text-5xl">
                  What better organised looks like.
                </h2>
              </Reveal>
              <ul className="mt-10 grid gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] [border-radius:var(--radius-lg)]">
                {service.outcomes.map((outcome, index) => (
                  <li key={outcome} className="flex items-start gap-5 bg-ink-950 p-5 sm:p-6">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-gold-400/70">0{index + 1}</span>
                    <span className="text-sm leading-6 text-copy-secondary">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">The MECHWEALTH difference</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-center font-display text-4xl leading-[1.08] text-cream-100 sm:text-5xl">
              Thoughtful service is a method, not a mood.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {service.distinctions.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.07}>
                <article className="h-full border border-white/[0.08] bg-white/[0.018] p-7 [border-radius:var(--radius-lg)] sm:p-8">
                  <p className="font-mono text-[9px] tracking-[0.22em] text-gold-400/70">0{index + 1}</p>
                  <h3 className="mt-8 font-display text-2xl text-cream-100">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-copy-secondary">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.07] bg-black/20 py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <Reveal>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">Prepare for the first conversation</p>
                <h2 className="mt-5 font-display text-4xl leading-[1.08] text-cream-100">Bring what you have. We will identify what is missing.</h2>
              </div>
            </Reveal>
            <div>
              <ul className="grid gap-4 sm:grid-cols-3">
                {service.prepare.map((item, index) => (
                  <li key={item} className="border-l border-gold-400/35 pl-4 text-sm leading-6 text-copy-secondary">
                    <span className="mb-3 block font-mono text-[8px] tracking-[0.2em] text-gold-400/70">0{index + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-10 border border-white/[0.08] bg-white/[0.018] p-6 font-mono text-[9px] uppercase leading-5 tracking-[0.16em] text-cream-500 [border-radius:var(--radius-lg)]">
                Important · {service.importantNote}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <div className="isolate relative overflow-hidden border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.08] via-ink-900 to-ink-950 px-7 py-14 text-center [border-radius:var(--radius-lg)] sm:px-12 sm:py-16">
              <CtaPattern />
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">Your next step</p>
              <h2 className="mx-auto mt-5 max-w-4xl font-display text-4xl leading-[1.05] text-cream-100 sm:text-5xl lg:text-6xl">
                {service.ctaTitle}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-copy-secondary">{service.ctaBody}</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link href="/contact" className={buttonClasses("primary", "lg")}>
                  Start the conversation <span aria-hidden>→</span>
                </Link>
                <Link href="/services" className={buttonClasses("secondary", "lg")}>
                  <span aria-hidden>←</span> All services
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="others-heading" className="border-t border-white/[0.07] py-24">
        <Container>
          <Reveal>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">Continue exploring</p>
                <h2 id="others-heading" className="mt-4 font-display text-3xl text-cream-100 sm:text-4xl">Other service routes</h2>
              </div>
              <Link href="/services" className="inline-flex min-h-11 items-center font-mono text-[9px] uppercase tracking-[0.22em] text-cream-500 transition-colors hover:text-gold-400">
                View all five <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/services/${other.slug}`}
                className={`overflow-hidden border border-white/[0.09] bg-ink-950 p-6 pb-14 [border-radius:var(--radius-lg)] ${clickableCardInteraction}`}
              >
                <ClickableCardAccent />
                <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-gold-400/70">{other.index} · {other.category}</span>
                <span className="mt-4 block font-display text-lg text-cream-100 transition-colors group-hover:text-gold-300">{other.shortTitle}</span>
                <ClickableCardArrow />
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
