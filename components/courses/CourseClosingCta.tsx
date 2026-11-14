import CtaPattern from "@/components/ui/CtaPattern";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { buttonClasses } from "@/lib/buttonStyles";

function splitHeadline(headline: string) {
  const sentences =
    headline.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()) ??
    [headline];
  if (sentences.length > 1) return sentences;

  const words = headline.trim().split(/\s+/);
  if (words.length < 4) return [headline];

  let splitAt = 1;
  let smallestDifference = Infinity;
  for (let index = 1; index < words.length; index += 1) {
    const left = words.slice(0, index).join(" ");
    const right = words.slice(index).join(" ");
    const difference = Math.abs(left.length - right.length);
    if (difference < smallestDifference) {
      splitAt = index;
      smallestDifference = difference;
    }
  }
  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

export default function CourseClosingCta({
  eyebrow,
  headline,
  primaryLabel,
}: {
  eyebrow: string;
  headline: string;
  primaryLabel: string;
}) {
  const headlineLines = splitHeadline(headline);

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <div className="isolate relative overflow-hidden border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.08] via-ink-900 to-ink-950 px-6 py-14 [border-radius:var(--radius-lg)] sm:px-10 sm:py-16 lg:px-16">
          <CtaPattern />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400 sm:text-[11px]">
              {eyebrow}
            </p>
            <h2 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-cream-100 sm:text-5xl lg:text-6xl">
              {headlineLines.map((line) => (
                <span key={line} className="sm:block">
                  {line}{" "}
                </span>
              ))}
            </h2>
            <div className="mt-9 flex w-full flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className={buttonClasses("primary", "lg", "w-full whitespace-nowrap px-3 text-sm sm:w-auto sm:px-8 sm:text-base")}
              >
                {primaryLabel} <span aria-hidden>→</span>
              </Link>
              <Link
                href="/courses"
                className={buttonClasses("secondary", "lg", "w-full whitespace-nowrap px-3 text-sm sm:w-auto sm:px-8 sm:text-base")}
              >
                <span aria-hidden>←</span> All course stages
              </Link>
            </div>
          </div>
          <p className="relative mt-10 border-t border-white/[0.08] pt-5 text-center font-mono text-[8px] uppercase leading-5 tracking-[0.2em] text-cream-500">
            Educational content only · No trading advice, outcomes or performance promises
          </p>
        </div>
      </Container>
    </section>
  );
}
