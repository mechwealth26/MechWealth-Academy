import Link from "next/link";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main id="main" className="relative flex min-h-screen items-center">
      <Container className="pt-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold-400">
          404 — Page not found
        </p>
        <h1 className="mt-6 font-display text-5xl leading-tight text-stone-100 sm:text-6xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-stone-400">
          The address may have changed or never existed. The paths below are
          all real.
        </p>
        <nav aria-label="Primary routes" className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            { href: "/", label: "Home" },
            { href: "/academy", label: "Academy" },
            { href: "/courses", label: "Courses" },
            { href: "/services", label: "Services" },
            { href: "/resources", label: "Resources" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-stone-300 transition-colors hover:border-gold-400 hover:text-gold-400"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>
    </main>
  );
}
