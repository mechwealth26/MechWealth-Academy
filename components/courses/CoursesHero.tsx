import Link from "next/link";
import AboutHero from "@/components/about/AboutHero";
import { COURSE_STAGES } from "@/data/courses";
import { buttonClasses } from "@/lib/buttonStyles";

export default function CoursesHero() {
  return (
    <AboutHero
      eyebrow="The learning path · Four stages"
      titleLines={["Stock-market courses.", "Find your starting point."]}
      intro="New to markets? Begin with Foundation. Our four stages build from market basics and chart reading to testing a trading plan and reviewing your progress with a mentor."
    >
      <div className="mb-7 flex flex-wrap gap-3">
        <Link href="/courses/foundation" className={buttonClasses("primary")}>
          Explore Foundation <span aria-hidden>→</span>
        </Link>
        <Link href="/contact" className={buttonClasses("secondary")}>
          Help me choose <span aria-hidden>→</span>
        </Link>
      </div>
      <nav
        aria-label="Learning stages"
        className="grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 sm:gap-x-10"
      >
        {COURSE_STAGES.map((stage) => (
          <a
            key={stage.num}
            href={`#stage-${stage.num}`}
            className="group border-l border-white/[0.1] pl-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
          >
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold-400/80 transition-colors group-hover:text-gold-300">
              {stage.num} · {stage.level}
            </p>
            <p className="mt-1.5 font-display text-sm uppercase tracking-wider text-cream-100/85 transition-colors group-hover:text-gold-200">
              {stage.title}
            </p>
            <p className="mt-2 text-sm text-copy-secondary">{stage.tagline}</p>
          </a>
        ))}
      </nav>
    </AboutHero>
  );
}
