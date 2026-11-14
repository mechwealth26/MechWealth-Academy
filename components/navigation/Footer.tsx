import Link from "next/link";
import BrandMark from "@/components/ui/BrandMark";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/data/site";
import { COURSE_STAGES } from "@/data/courses";
import CookiePreferencesButton from "@/components/analytics/CookiePreferencesButton";
import FooterSocialLinks from "@/components/navigation/FooterSocialLinks";

const PROGRAM_LINKS: [string, string][] = [
  ["Academy overview", "/academy"],
  ...COURSE_STAGES.map((course): [string, string] => [
    `${course.title} — ${course.tagline}`,
    `/courses/${course.slug}`,
  ]),
];

const EXPLORE_LINKS: [string, string][] = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Resources", "/resources"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

/**
 * Premium footer — brand, section navigation and the educational
 * risk disclosure. Static server component.
 */
export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-ink-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"
      />
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          {/* Brand */}
          <div>
            <Link href="/" aria-label="MECHWEALTH — home" className="inline-flex min-h-11 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400">
              <BrandMark footer />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-500">
              A premium Indian stock-market learning experience — built on
              structure, process and risk discipline. Education first,
              always.
            </p>
            <FooterSocialLinks />
          </div>

          {/* Programs */}
          <nav aria-label="Programs">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-500/80">
              Programs
            </p>
            <ul className="mt-4 space-y-2.5">
              {PROGRAM_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 min-w-11 items-center text-sm text-cream-500 transition-colors hover:text-gold-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Learn / company */}
          <nav aria-label="Learn">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-500/80">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 min-w-11 items-center text-sm text-cream-500 transition-colors hover:text-gold-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Risk disclosure */}
        <div className="mt-14 border-t border-white/[0.06] pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-copy-muted">
            MECHWEALTH Trading Academy is an educational platform. All content
            — including charts, examples and visualisations on this page — is
            illustrative and provided for learning purposes only. Nothing here
            constitutes live prices, investment advice, trading
            recommendations or performance guarantees. Trading in securities
            involves substantial risk of loss; please consult a
            SEBI-registered investment adviser before making financial
            decisions.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] tracking-wide text-copy-muted">
            © {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link className="min-h-11 min-w-11 content-center text-sm text-copy-secondary transition-colors hover:text-gold-300" href="/privacy">
              Privacy
            </Link>
            <Link className="min-h-11 min-w-11 content-center text-sm text-copy-secondary transition-colors hover:text-gold-300" href="/terms">
              Terms
            </Link>
            <CookiePreferencesButton />
          </nav>
        </div>
      </Container>
    </footer>
  );
}
