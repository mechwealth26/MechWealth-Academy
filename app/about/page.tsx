import CtaPattern from "@/components/ui/CtaPattern";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import MethodLoop from "@/components/about/MethodLoop";
import AboutHero from "@/components/about/AboutHero";
import { siteConfig } from "@/data/site";
import { TEACHING_METHOD } from "@/data/teachingMethod";
import { buttonClasses } from "@/lib/buttonStyles";
import { absoluteUrl, breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo";
import founderPortrait from "@/public/images/founder.png";

const title = "About Kirankumar Kajagar";
const description =
  "Meet Kirankumar Kajagar, founder of MECHWEALTH Trading Academy. Explore his engineering background, teaching method and standards for market education.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `${title} | ${siteConfig.name}`,
    description,
    url: "/about",
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
  },
};

const eyebrowClass = "font-mono text-[10px] uppercase leading-5 tracking-[0.28em] text-gold-400 sm:text-[11px]";
const headingClass = "mt-5 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-cream-100 sm:text-4xl lg:text-5xl";

const LEARNING = [
  {
    title: "Read the chart before forming an opinion.",
    body: "Foundation introduces market basics, charts and candlesticks. Practitioner builds on that vocabulary with market structure, levels and a repeatable chart-reading routine.",
    href: "/courses/practitioner",
    link: "Explore chart-reading practice",
  },
  {
    title: "Turn an idea into something testable.",
    body: "A strategy is a hypothesis. Writing its rules precisely makes it possible to test the same idea against historical examples and examine where it fails.",
    href: "/courses/method",
    link: "Explore the Method course",
  },
  {
    title: "Review the process, including its limits.",
    body: "Risk is decided before entry. Results need a meaningful sample, and losses belong in the review. The aim is a process you can inspect and improve, without a promise of returns.",
    href: "/academy",
    link: "Explore the academy approach",
  },
];

const EXAMPLE = [
  "Mark the swing highs and lows on a historical chart before naming the trend.",
  "Write down what would qualify as an uptrend, a downtrend or a range.",
  "Apply the same definition to other historical charts, including unclear cases.",
  "Record where the definition was useful and where it left room for interpretation.",
  "Clarify one criterion, then repeat the exercise to see what changed.",
];

export default function AboutPage() {
  const founder = siteConfig.founder;
  const founderId = absoluteUrl("/about#founder");
  const organizationId = absoluteUrl("/#organization");

  return (
    <main id="main" className="relative min-h-screen">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "AboutPage",
            "@id": absoluteUrl("/about#webpage"),
            url: absoluteUrl("/about"),
            name: `${title} | ${siteConfig.name}`,
            description,
            mainEntity: { "@id": organizationId },
            about: { "@id": founderId },
          },
          { ...organizationJsonLd(), "@id": organizationId, founder: { "@id": founderId } },
          {
            "@type": "Person",
            "@id": founderId,
            name: founder.name,
            jobTitle: "Founder",
            description: founder.bio,
            image: absoluteUrl(founderPortrait.src),
            url: absoluteUrl("/about#founder"),
            worksFor: { "@id": organizationId },
          },
        ],
      }} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ])} />
      {/* Cinematic hero */}
      <AboutHero
        eyebrow={`About · ${founder.name}`}
        titleLines={["An engineering", "approach to markets."]}
        intro="MECHWEALTH exists because trading is usually taught as prediction. It should be taught as engineering: observe, define, test, learn, improve. This page is the honest version of how that happened."
      />

      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      </Container>

      <section id="founder" aria-labelledby="founder-heading" className="scroll-mt-28 py-16 sm:py-24">
        <Container className="grid items-center gap-x-10 gap-y-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-20">
          <figure className="mx-auto w-full max-w-md md:contents">
            <div className="relative aspect-[4/5] overflow-hidden md:col-start-1 md:row-start-1 md:aspect-auto md:h-full md:min-h-[26rem] bg-ink-900 [border-radius:var(--radius-lg)]">
              <Image src={founderPortrait} alt={`Portrait of ${founder.name}`} fill
                sizes="(min-width: 1280px) 30rem, (min-width: 768px) 40vw, (min-width: 640px) 28rem, calc(100vw - 2rem)"
                placeholder="blur" className="object-cover" />
            </div>
            <figcaption className="mt-4 font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-copy-muted md:col-start-1 md:row-start-2 md:mt-0">
              {founder.name} · Founder
            </figcaption>
          </figure>
          <div className="py-6 md:col-start-2 md:row-start-1 lg:py-12">
            <p className={eyebrowClass}>01 · Meet the founder</p>
            <h2 id="founder-heading" className={headingClass}>{founder.name}</h2>
            <p className="mt-5 font-display text-xl leading-relaxed text-cream-300 sm:text-2xl">
              One person teaches every session.
            </p>
            <p className="mt-6 max-w-xl text-base leading-8 text-copy-secondary">{founder.bio}</p>
            <div className="mt-8 border-l border-gold-400/35 pl-6">
              <p className={eyebrowClass}>The discipline that stayed</p>
              <p className="mt-3 max-w-xl leading-7 text-copy-secondary">
                A chart is a measurement. An indicator is an instrument. A strategy
                is a hypothesis. The vocabulary changes; the need to define,
                test and review remains.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="purpose-heading" className="border-y border-white/[0.08] py-20 sm:py-28">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className={eyebrowClass}>02 · Why MECHWEALTH exists</p>
            <h2 id="purpose-heading" className={headingClass}>From an idea<br className="hidden sm:block" /> to evidence.</h2>
          </div>
          <div className="space-y-6 text-base leading-8 text-copy-secondary sm:text-lg">
            <p>MECHWEALTH brings an engineering approach to market education: study what happened, define the idea clearly, and test it before relying on it. The academy focuses on the work between recognising a pattern and understanding whether a rule holds up.</p>
            <p>One teacher carries that approach through the learning path, from the first chart to a written and tested method. The purpose is to make the reasoning visible, so you can question an idea, examine its limits and explain it in your own words.</p>
            <p>Understanding means more than recognising a term. It means being able to write it down precisely enough for someone else to test it.</p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="teaching-heading" className="py-20 sm:py-28">
        <Container>
          <p className={eyebrowClass}>03 · What that means for learning</p>
          <h2 id="teaching-heading" className={`${headingClass} max-w-2xl`}>A clear idea. A written rule.<br /> Evidence you can review.</h2>
          <div className="mt-12 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {LEARNING.map((item, index) => (
              <article key={item.href} className="grid gap-4 py-8 md:grid-cols-[3rem_minmax(0,5fr)_minmax(0,7fr)] md:gap-8 sm:py-10">
                <span aria-hidden className={eyebrowClass}>0{index + 1}</span>
                <h3 className="max-w-sm font-display text-2xl leading-snug text-cream-100">{item.title}</h3>
                <div>
                  <p className="max-w-xl leading-7 text-copy-secondary">{item.body}</p>
                  <Link href={item.href} className={`${buttonClasses("secondary", "sm")} mt-5`}>{item.link}<span aria-hidden>→</span></Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="method-heading" className="border-y border-white/[0.08] bg-ink-900/40 py-20 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <p className={eyebrowClass}>04 · The teaching method</p>
            <h2 id="method-heading" className={headingClass}>Five steps. Then go again.</h2>
            <p className="mt-6 leading-7 text-copy-secondary">Observe, define, test, learn and improve. The loop gives each idea a structure, and a reason to revisit it when the evidence changes.</p>
          </div>
          <div className="mt-10 border-y border-white/[0.08] py-8 sm:py-12"><MethodLoop /></div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <div>
              <p className={eyebrowClass}>Illustrative learning exercise</p>
              <h3 className="mt-4 font-display text-2xl text-cream-100 sm:text-3xl">What do you mean by a trend?</h3>
              <p className="mt-5 leading-7 text-copy-secondary">This example shows how the loop can turn a familiar chart-reading term into a definition you can check. It is an educational illustration, not a trading signal or a reported result.</p>
            </div>
            <ol className="divide-y divide-white/[0.08]">
              {TEACHING_METHOD.map((step, index) => (
                <li key={step.label} className="grid gap-2 py-5 first:pt-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5">
                  <h4 className="font-display text-lg text-cream-100">{step.label}</h4>
                  <p className="text-sm leading-7 text-copy-secondary">{EXAMPLE[index]}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section aria-labelledby="background-heading" className="py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className={eyebrowClass}>05 · Background & professional roles</p>
            <h2 id="background-heading" className={headingClass}>Know who<br /> you learn from.</h2>
            <p className="mt-6 max-w-lg leading-7 text-copy-secondary">Kirankumar holds an MTech in Mechanical Engineering from VTU Belagavi and does not practise engineering. His professional roles in mutual funds, broking and insurance are listed here separately from the academy&apos;s teaching method.</p>
            <Link href="/services" className={`${buttonClasses("secondary", "sm")} mt-6`}>Explore the services<span aria-hidden>→</span></Link>
          </div>
          <dl className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {founder.credentials.map((credential) => (
              <div key={credential.label} className="py-7">
                <dt className="font-display text-xl text-cream-100">{credential.label}</dt>
                <dd className="mt-3 space-y-2 font-mono text-sm leading-6 text-copy-secondary">
                  {credential.lines.map((line) => <p key={line}>{line}</p>)}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section aria-labelledby="standards-heading" className="border-t border-white/[0.08] py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className={eyebrowClass}>06 · Standards & boundaries</p>
            <h2 id="standards-heading" className={headingClass}>A process,<br /> without promises.</h2>
            <p className="mt-6 max-w-lg leading-7 text-copy-secondary">A rule must be testable. Risk belongs before entry, and a small sample is not enough evidence. Honest review includes losses as well as successes.</p>
          </div>
          <div>
            <h3 className="font-display text-2xl text-cream-100">What the academy does not promise</h3>
            <ul className="mt-6 space-y-4 text-base leading-7 text-copy-secondary">
              <li className="border-l border-gold-400/30 pl-5">No profit promises, income claims or return targets.</li>
              <li className="border-l border-gold-400/30 pl-5">No tips, calls or trade recommendations. The academy teaches analysis.</li>
              <li className="border-l border-gold-400/30 pl-5">No guaranteed outcomes. Markets carry risk, and losses are part of every honest sample.</li>
              <li className="border-l border-gold-400/30 pl-5">Educational content is not investment advice. Financial decisions remain your own.</li>
            </ul>
          </div>
        </Container>
      </section>

      <Container className="pb-24 sm:pb-32">
        <div className="relative isolate overflow-hidden border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.08] via-ink-900 to-ink-950 px-6 py-14 text-center [border-radius:var(--radius-lg)] sm:px-12 sm:py-20">
          <CtaPattern />
          <p className={eyebrowClass}>Continue exploring</p>
          <h2 className={`${headingClass} mx-auto max-w-3xl`}>See how the method<br /> becomes a learning path.</h2>
          <p className="mx-auto mt-6 max-w-xl leading-7 text-copy-secondary">Explore the four course stages, read the academy approach, or ask a question about where to begin.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className={buttonClasses("primary", "lg")}>Explore all courses<span aria-hidden>→</span></Link>
            <Link href="/contact" className={buttonClasses("secondary", "lg")}>Ask a question<span aria-hidden>→</span></Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
