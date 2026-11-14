import CtaPattern from "@/components/ui/CtaPattern";
import type { Metadata } from "next";
import Link from "next/link";
import TrackedLink from "@/components/analytics/TrackedLink";
import AboutHero from "@/components/about/AboutHero";
import {
  Reveal,
  RevealListItem,
} from "@/components/about/StorySections";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceCardMotion from "@/components/services/ServiceCardMotion";
import JsonLd from "@/components/seo/JsonLd";
import Container from "@/components/ui/Container";
import { SERVICES } from "@/data/services";
import { siteConfig } from "@/data/site";
import { buttonClasses } from "@/lib/buttonStyles";
import { absoluteUrl } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Demat, Mutual Fund, Insurance & Share Services",
  description:
    "Demat accounts, mutual funds, insurance, physical share services and IEPF claims — explained clearly and handled through a documented process.",
  alternates: { canonical: "/services" },
};

const SERVICE_STANDARDS = [
  ["Understand first", "The decision, documents and trade-offs are explained before the process begins."],
  ["One visible process", "You know what is complete, what is pending and who owns the next action."],
  ["No manufactured urgency", "Questions are welcome. Market risk and administrative uncertainty are stated plainly."],
];

const WORKFLOW = [
  ["01", "Start with the situation", "We listen for the real job: setting up, organising, protecting, converting or recovering."],
  ["02", "Make the route visible", "The requirements, dependencies and likely decision points are laid out in plain language."],
  ["03", "Handle the record", "Documents, submissions and follow-ups stay connected so the process does not disappear into inboxes."],
];

export default function ServicesIndexPage() {
  return (
    <main id="main" className="relative min-h-screen">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "MECHWEALTH Services",
          itemListElement: SERVICES.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.title,
            url: absoluteUrl(`/services/${service.slug}`),
          })),
        }}
      />

      <AboutHero
        eyebrow="MECHWEALTH Services · One accountable desk"
        titleLines={["Financial services,", "made legible."]}
        intro="From opening a market account to recovering a legacy holding, we turn unfamiliar financial processes into clear decisions, organised records and visible next steps."
      >
        <div className="flex flex-wrap gap-3">
          <a href="#service-directory" className={buttonClasses("primary", "lg")}>
            Find your service <span aria-hidden>↓</span>
          </a>
          <Link href="/contact" className={buttonClasses("secondary", "lg")}>
            Explain your situation <span aria-hidden>→</span>
          </Link>
        </div>
      </AboutHero>

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(22rem,5fr)] lg:gap-20">
            <Reveal>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">
                A different standard of service
              </p>
              <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-cream-100 sm:text-5xl lg:text-6xl">
                The paperwork matters. Understanding it matters more.
              </h2>
              <p className="mt-7 max-w-2xl text-base leading-8 text-copy-secondary">
                Financial administration often feels difficult because the process is hidden behind forms, portals and specialist language. We slow the first conversation down, make the route visible, then keep the work moving with you.
              </p>
            </Reveal>

            <div className="grid content-start gap-7">
              {SERVICE_STANDARDS.map(([title, body], index) => (
                <Reveal key={title} delay={index * 0.08}>
                  <article className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4">
                    <p className="font-mono text-[9px] tracking-[0.22em] text-gold-400/70">
                      0{index + 1}
                    </p>
                    <div>
                      <h3 className="font-display text-lg text-cream-100">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-copy-secondary">{body}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="service-directory" className="scroll-mt-20 border-y border-white/[0.07] bg-ink-900/40 py-24 sm:py-32">
        <Container>
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">
                  Five services · One working standard
                </p>
                <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-cream-100 sm:text-5xl">
                  Choose the work in front of you.
                </h2>
              </div>
              <p className="text-sm leading-7 text-copy-secondary">
                Each service has its own route, records and regulatory context. Explore the detail before deciding what belongs in your next conversation.
              </p>
            </div>
          </Reveal>

          <ServiceCardMotion>
            <div>
              <ServiceCard service={SERVICES[0]} featured />
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {SERVICES.slice(1).map((service, index) => (
                <ServiceCard key={service.slug} service={service} delay={index * 0.06} />
              ))}
            </div>
          </ServiceCardMotion>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(18rem,4fr)_minmax(0,8fr)] lg:gap-20">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">
                  The service experience
                </p>
                <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-cream-100 sm:text-5xl">
                  Clarity at every handoff.
                </h2>
                <p className="mt-6 max-w-md text-sm leading-7 text-copy-secondary">
                  The exact documents differ. The operating standard does not: diagnose carefully, explain plainly, document the work.
                </p>
              </div>
            </Reveal>

            <ol className="grid gap-5">
              {WORKFLOW.map(([number, title, body], index) => (
                <RevealListItem
                  key={number}
                  delay={index * 0.08}
                  className="grid gap-5 border border-white/[0.08] bg-white/[0.018] p-6 [border-radius:var(--radius-lg)] sm:grid-cols-[5rem_minmax(0,1fr)] sm:p-8"
                >
                  <p className="font-mono text-sm tracking-[0.2em] text-gold-400">{number}</p>
                  <div>
                    <h3 className="font-display text-2xl text-cream-100">{title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-copy-secondary">{body}</p>
                  </div>
                </RevealListItem>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.07] bg-gold-400/[0.025] py-24 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-20">
            <Reveal>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">
                Accountable credentials
              </p>
              <h2 className="mt-5 font-display text-4xl leading-[1.08] text-cream-100 sm:text-5xl">
                Know who sits behind the process.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-copy-secondary">
                Every enquiry is handled through the same MECHWEALTH desk. Relevant registrations are stated openly; their scope is never stretched into a guarantee.
              </p>
            </Reveal>
            <dl className="grid gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3 [border-radius:var(--radius-lg)]">
              {siteConfig.founder.credentials.map((credential) => (
                <div key={credential.label} className="bg-ink-950 p-6">
                  <dt className="font-mono text-[8px] uppercase leading-5 tracking-[0.2em] text-gold-400/75">
                    {credential.label}
                  </dt>
                  <dd className="mt-4 space-y-1 font-mono text-[10px] leading-5 text-copy-secondary">
                    {credential.lines.map((line) => <span key={line} className="block">{line}</span>)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <div className="isolate relative overflow-hidden border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.08] via-ink-900 to-ink-950 px-7 py-14 [border-radius:var(--radius-lg)] sm:px-12 lg:px-16">
              <CtaPattern />
              <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
                <div className="flex flex-col items-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">
                    Not sure where the case belongs?
                  </p>
                  <h2 className="mt-5 max-w-4xl font-display text-4xl leading-[1.05] text-cream-100 sm:text-5xl">
                    <span className="sm:block">Start with the situation,</span>{" "}
                    <span className="sm:block">not the service name.</span>
                  </h2>
                  <p className="mt-6 max-w-4xl text-sm leading-7 text-copy-secondary sm:text-base">
                    <span className="lg:block">
                      Describe what you have, what changed and what is currently stuck.
                    </span>{" "}
                    <span className="lg:block">
                      We will help identify the honest next step without creating urgency.
                    </span>
                  </p>
                </div>
                <TrackedLink
                  href="/contact"
                  eventName="talk_to_mechwealth_click"
                  eventProperties={{ source: "services_cta" }}
                  className={`${buttonClasses("primary", "lg")} mt-9`}
                >
                  Talk to MECHWEALTH <span aria-hidden>→</span>
                </TrackedLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
