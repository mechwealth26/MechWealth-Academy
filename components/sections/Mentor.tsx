import Image from "next/image";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/data/site";
import founderPortrait from "@/public/images/founder.png";

/**
 * Mentor / founder section — section 02, directly after the hero.
 * Static server component. Content lives in data/site.ts.
 *
 * Portrait content lives at public/images/founder.png.
 */
export default function Mentor() {
  const founder = siteConfig.founder;

  return (
    <section id="mentor" className="relative border-t border-white/5 py-24 sm:py-32">
      <Container className="grid items-start gap-x-8 gap-y-3 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-12">
        {/* Portrait */}
        <figure className="mx-auto w-full max-w-md md:contents">
          <div className="relative aspect-[4/5] overflow-hidden md:col-start-1 md:row-start-1 md:aspect-auto md:h-full md:w-full rounded-lg bg-gradient-to-b from-ink-850 via-ink-900 to-ink-950">
            <Image
              src={founderPortrait}
              alt={`Portrait of ${founder.name}`}
              fill
              sizes="(min-width: 1280px) 29rem, (min-width: 768px) 40vw, (min-width: 640px) 28rem, calc(100vw - 2rem)"
              placeholder="blur"
              className="object-cover object-center"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink-950/35 via-transparent to-black/10"
            />

            {/* Corner brackets */}
            {[
              "left-3 top-3 border-l border-t",
              "right-3 top-3 border-r border-t",
              "bottom-3 left-3 border-b border-l",
              "bottom-3 right-3 border-b border-r",
            ].map((pos) => (
              <span
                key={pos}
                aria-hidden
                className={`absolute z-10 h-5 w-5 border-cream-100/35 ${pos}`}
              />
            ))}
          </div>
          <figcaption className="mt-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-copy-muted md:col-start-1 md:row-start-2 md:mt-0">
            {founder.portraitCaption}
          </figcaption>
        </figure>

        {/* Story + credentials */}
        <div className="min-w-0 pt-8 md:col-start-2 md:row-start-1 md:self-center md:py-2">
          <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-gold-500">
            {founder.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] text-cream-100 lg:text-4xl xl:text-5xl">
            {founder.headline}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-300">
            {founder.bio}
          </p>

          <div className="mt-6 grid gap-3">
            {founder.credentials.map((cred) => (
              <div
                key={cred.label}
                className="grid gap-2 rounded-lg border border-white/[0.08] bg-ink-900/60 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center transition-colors duration-500 hover:border-gold-500/25"
              >
                <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-copy-muted">
                  {cred.label}
                </p>
                <div className="min-w-0 space-y-1">
                  {cred.lines.map((line) => (
                    <p
                      key={line}
                      className="break-words font-mono text-xs leading-relaxed text-cream-100"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
