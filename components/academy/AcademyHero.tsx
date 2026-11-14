import Link from "next/link";
import AboutHero from "@/components/about/AboutHero";
import { buttonClasses } from "@/lib/buttonStyles";

export default function AcademyHero() {
  return (
    <AboutHero
      eyebrow="The MECHWEALTH Academy"
      titleLines={["Stock market education.", "Build your method."]}
      intro="A connected learning system for understanding price, testing ideas and managing risk. No disconnected tips. No shortcuts. Every lesson moves you toward independent, evidence-led thinking."
    >
      <div className="flex flex-wrap gap-3">
        <a href="#disciplines" className={buttonClasses("primary", "lg")}>
          Explore the academy
          <span aria-hidden>↓</span>
        </a>
        <Link href="/courses" className={buttonClasses("secondary", "lg")}>
          View courses
          <span aria-hidden>→</span>
        </Link>
      </div>

      <dl className="mt-10 grid max-w-xl grid-cols-3 border-y border-white/[0.08] py-5">
        {[
          ["05", "Disciplines"],
          ["04", "Learning stages"],
          ["01", "Connected method"],
        ].map(([value, label], index) => (
          <div
            key={label}
            className={index ? "border-l border-white/[0.08] pl-4 sm:pl-7" : ""}
          >
            <dt className="font-mono text-[8px] uppercase tracking-[0.15em] text-cream-500 sm:text-[10px] sm:tracking-[0.18em]">
              {label}
            </dt>
            <dd className="mt-2 font-display text-xl text-cream-100 sm:text-2xl">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </AboutHero>
  );
}
