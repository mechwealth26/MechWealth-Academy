import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProgramCard from "@/components/sections/programs/ProgramCard";
import { PROGRAMS } from "@/data/programs";

const PROGRAM_PATHS: Record<string, string> = {
  "01": "/courses/foundation",
  "02": "/courses/practitioner",
  "03": "/courses/practitioner",
  "04": "/courses/method",
  "05": "/courses/method",
};

/**
 * Academy Programs — five disciplines, editorial grid.
 * Server component; the cards themselves are client (canvas + motion).
 */
export default function AcademyPrograms() {
  return (
    <section id="programs" className="relative scroll-mt-20 border-t border-white/5 py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.04),transparent_60%)]"
      />
      <Container className="relative">
        <SectionHeading
          align="left"
          eyebrow="Academy Programs"
          title={
            <>
              Five disciplines.
              <br />
              One craft.
            </>
          }
          description="A structured path from first principles to professional execution. Every program builds on the last — no shortcuts, no noise."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {PROGRAMS.map((program, i) => (
            <div
              key={program.num}
              className={`h-full ${i < 3 ? "lg:col-span-2" : "sm:col-span-1 lg:col-span-3"}`}
            >
              <ProgramCard
                program={program}
                index={i}
                href={PROGRAM_PATHS[program.num] ?? "/courses"}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
