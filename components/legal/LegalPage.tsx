import type { ReactNode } from "react";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Container from "@/components/ui/Container";

export default function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main id="main" tabIndex={-1} className="relative min-h-screen outline-none">
      <header className="border-b border-white/[0.07] pb-16 pt-24 sm:pb-20 sm:pt-28">
        <Container>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: title }]}
          />
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-gold-400">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[1.02] text-cream-100 sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-copy-secondary sm:text-lg">
            {intro}
          </p>
        </Container>
      </header>
      <Container className="py-16 sm:py-24">
        <article className="legal-copy max-w-4xl">{children}</article>
      </Container>
    </main>
  );
}
