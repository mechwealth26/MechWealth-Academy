"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import { buttonClasses } from "@/lib/buttonStyles";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-screen items-center outline-none">
      <Container className="py-32 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-400">
          Something went wrong
        </p>
        <h1 className="mt-5 font-display text-5xl text-cream-100 sm:text-6xl">
          This page could not finish loading.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-copy-secondary">
          Your enquiry and navigation choices have not been changed. Try this page again or return
          to a stable route.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClasses("primary", "lg")}>
            Try again
          </button>
          <Link href="/" className={buttonClasses("secondary", "lg")}>
            Return home
          </Link>
        </div>
      </Container>
    </main>
  );
}
