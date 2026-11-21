"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { GOLD } from "@/lib/theme";
import { createPortal } from "react-dom";
import LessonDemo from "@/components/foundation/LessonDemo";
import ResourceArticleBody from "@/components/resources/ResourceArticleBody";
import ResourceSources from "@/components/resources/ResourceSources";
import { Container } from "@/components/ui/Container";
import {
  ClickableCardAccent,
  ClickableCardArrow,
  clickableCardInteraction,
} from "@/components/ui/ClickableCard";
import { useLenis } from "@/hooks/useLenis";
import { suspendCookiePreferences } from "@/lib/analyticsConsent";
import {
  RESOURCES,
  RESOURCE_CATEGORIES,
  type ResourceArticle,
} from "@/data/resources";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// Keep the quick reader while preserving real URLs and native new-tab behavior.
function openReaderLink(event: MouseEvent<HTMLAnchorElement>, open: () => void) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  open();
}

export function includeResourceInQueue(
  queue: string[],
  slug: string,
  afterSlug?: string
) {
  if (!RESOURCES.some((resource) => resource.slug === slug)) return queue;
  if (queue.includes(slug)) return queue;

  const insertionIndex = afterSlug ? queue.indexOf(afterSlug) + 1 : 0;
  if (insertionIndex > 0) {
    return [
      ...queue.slice(0, insertionIndex),
      slug,
      ...queue.slice(insertionIndex),
    ];
  }
  return [...queue, slug];
}

function CategoryChip({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-11 whitespace-nowrap rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all duration-300 ${
        active
          ? "border-gold-400 bg-gold-400/10 text-gold-400"
          : "border-white/10 text-stone-400 hover:border-white/30 hover:text-stone-200"
      }`}
      aria-pressed={active}
    >
      {label}{" "}
      <span className={active ? "text-accent-muted" : "text-stone-400"}>
        {count}
      </span>
    </button>
  );
}

function ResourceCard({
  resource,
  onOpen,
  hovered,
  onHover,
}: {
  resource: ResourceArticle;
  onOpen: (el: HTMLElement) => void;
  hovered: boolean;
  onHover: (v: boolean) => void;
}) {
  return (
    <a
      href={`/resources/${resource.slug}`}
      onClick={(event) => openReaderLink(event, () => onOpen(event.currentTarget))}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      className={`flex flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-gradient-to-b from-white/[0.03] to-transparent text-left ${clickableCardInteraction}`}
      aria-label={`Read ${resource.title}`}
    >
      <ClickableCardAccent />
      {/* Live preview — animates only while hovered */}
      <span className="relative block h-40 w-full overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: hovered ? 1 : 0.55 }}
        >
          <LessonDemo variant={resource.demo} active animate={hovered} />
        </div>
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400 backdrop-blur">
          {resource.category}
        </span>
      </span>

      <span className="flex flex-1 flex-col p-5 pb-7 text-left">
        <h2 className="font-display text-lg leading-snug text-stone-100 transition-colors duration-300 group-hover:text-gold-400">
          {resource.title}
        </h2>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-400">
          {resource.summary}
        </p>
        <div className="mt-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-stone-400">
          <span>{resource.minutes} min</span>
          <span className="h-1 w-1 rounded-full bg-stone-700" />
          <span>Interactive</span>
        </div>
      </span>
      <ClickableCardArrow />
    </a>
  );
}

export default function ResourcesLibrary() {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [readerQueue, setReaderQueue] = useState<string[]>([]);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Element that opened the reader — focus returns here on close (WCAG 2.4.3)
  const invokerRef = useRef<HTMLElement | null>(null);

  const closeReader = useCallback(() => {
    setOpenSlug(null);
    setReaderQueue([]);
    setHoveredSlug(null);
    const el = invokerRef.current;
    if (el) requestAnimationFrame(() => el.focus());
  }, []);

  const featured = RESOURCES.find((r) => r.featured) ?? RESOURCES[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const openReader = (slug: string, trigger: HTMLElement | null) => {
    invokerRef.current = trigger;
    setReaderQueue(filtered.map((resource) => resource.slug));
    setOpenSlug(slug);
  };

  const navigateReader = (resource: ResourceArticle) => {
    setReaderQueue((queue) =>
      includeResourceInQueue(queue, resource.slug, openSlug ?? undefined)
    );
    setOpenSlug(resource.slug);
  };

  return (
    <Container className="relative z-10 pb-24 pt-16 sm:pt-20">
      {/* Featured resource */}
      {category === "All" && query === "" && (
        <a
          href={`/resources/${featured.slug}`}
          onClick={(event) => openReaderLink(event, () => openReader(featured.slug, event.currentTarget))}
          onMouseEnter={() => setHoveredSlug(featured.slug)}
          onMouseLeave={() => setHoveredSlug(null)}
          onFocus={() => setHoveredSlug(featured.slug)}
          onBlur={() => setHoveredSlug(null)}
          className={`mb-14 grid w-full overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.04] to-transparent text-left md:grid-cols-2 ${clickableCardInteraction}`}
        >
          <ClickableCardAccent />
          <div className="relative h-56 overflow-hidden border-b border-white/5 md:h-auto md:border-b-0 md:border-r">
            <LessonDemo
              variant={featured.demo}
              active
              animate={hoveredSlug === featured.slug}
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <span
              className="w-fit rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-black"
              style={{ background: GOLD }}
            >
              Start here · Featured
            </span>
            <h2 className="mt-5 font-display text-2xl text-stone-100 transition-colors duration-300 group-hover:text-gold-400 md:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-400 md:text-base">
              {featured.summary}
            </p>
            <span className="mt-6 pr-10 font-mono text-[9px] uppercase tracking-[0.22em] text-cream-500 transition-colors duration-300 group-hover:text-gold-400">
              Read the lesson
            </span>
          </div>
          <ClickableCardArrow />
        </a>
      )}

      {/* Controls: search + category filter */}
      <div className="mb-8 flex flex-col gap-4">
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the library…"
          aria-label="Search resources"
          className="min-h-11 w-full max-w-md rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-stone-200 placeholder-stone-400 outline-none backdrop-blur transition-colors focus:border-gold-400/50"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <CategoryChip
            label="All"
            active={category === "All"}
            count={RESOURCES.length}
            onClick={() => setCategory("All")}
          />
          {RESOURCE_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={category === cat}
              count={RESOURCES.filter((r) => r.category === cat).length}
              onClick={() => setCategory(category === cat ? "All" : cat)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-20 text-center font-mono text-sm uppercase tracking-widest text-stone-400">
          Nothing matches “{query}”. Try another term.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ResourceCard
              key={r.slug}
              resource={r}
              hovered={hoveredSlug === r.slug}
              onHover={(v) => setHoveredSlug(v ? r.slug : null)}
              onOpen={(el) => openReader(r.slug, el)}
            />
          ))}
        </div>
      )}

      {/* Reader */}
      {openSlug && (
        <ResourceReader
          slug={openSlug}
          queue={readerQueue}
          onClose={closeReader}
          onNavigate={navigateReader}
        />
      )}
    </Container>
  );
}

/** Full-screen immersive reader: progress bar, related links, prev/next. */
function ResourceReader({
  slug,
  queue,
  onClose,
  onNavigate,
}: {
  slug: string;
  queue: string[];
  onClose: () => void;
  onNavigate: (resource: ResourceArticle) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const [progress, setProgress] = useState(0);
  const article = RESOURCES.find((r) => r.slug === slug)!;
  const activeQueue = includeResourceInQueue(queue, slug);
  const idx = activeQueue.indexOf(slug);
  const prev =
    idx > 0 ? RESOURCES.find((r) => r.slug === activeQueue[idx - 1]) : null;
  const next =
    idx >= 0 && idx < activeQueue.length - 1
      ? RESOURCES.find((r) => r.slug === activeQueue[idx + 1])
      : null;
  const related = article.related
    .map((s) => RESOURCES.find((r) => r.slug === s))
    .filter((r): r is ResourceArticle => Boolean(r));

  // Reset scroll + focus per article
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    closeRef.current?.focus();
  }, [slug]);

  // Reading progress from the overlay's own scroll container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [slug]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const restoreCookiePreferences = suspendCookiePreferences();

    const header =
      document.querySelector<HTMLElement>("body > header") ??
      document.querySelector<HTMLElement>("header");
    const backgroundElements = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element !== dialog &&
        !element.contains(dialog) &&
        element !== header &&
        !element.contains(header)
    );
    const previousInert = new Map(
      backgroundElements.map((element) => [element, element.inert])
    );
    backgroundElements.forEach((element) => {
      element.inert = true;
    });

    const onKey = (e: KeyboardEvent) => {
      // The mobile menu has its own focus scope while it is open above the
      // reader. Let that scope handle Escape and Tab until it closes.
      if (e.defaultPrevented || document.getElementById("mobile-menu")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const isFocusable = (element: HTMLElement) =>
        !element.hidden &&
        !element.closest("[inert]") &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.getClientRects().length > 0;
      const headerFocusable = Array.from(
        header?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
      ).filter(isFocusable);
      const dialogFocusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(isFocusable);
      const focusable = [...headerFocusable, ...dialogFocusable];
      const first = focusable[0];
      const last = focusable.at(-1);
      const firstDialog = dialogFocusable[0];
      const lastHeader = headerFocusable.at(-1);
      if (!first || !last) {
        e.preventDefault();
        return;
      }

      if (!focusable.includes(document.activeElement as HTMLElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (
        e.shiftKey &&
        lastHeader &&
        document.activeElement === firstDialog
      ) {
        e.preventDefault();
        lastHeader.focus();
      } else if (
        !e.shiftKey &&
        firstDialog &&
        document.activeElement === lastHeader
      ) {
        e.preventDefault();
        firstDialog.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    // Lock Lenis + native scroll while the reader is open
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      previousInert.forEach((inert, element) => {
        element.inert = inert;
      });
      lenis?.start();
      document.documentElement.style.overflow = "";
      restoreCookiePreferences();
    };
  }, [onClose, lenis]);

  // Portal to <body>: the route-transition wrapper is a transformed ancestor,
  // which would otherwise break `fixed` positioning and the header mask.
  // (The reader only mounts after a user click, so document.body always exists.)
  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-40 bg-ink-950"
      role="dialog"
      aria-label={article.title}
    >
      {/* Progress rail — sits just below the fixed site header */}
      <div className="absolute inset-x-0 top-16 z-10 h-0.5 bg-white/5">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%`, background: GOLD }}
        />
      </div>

      <div
        ref={scrollRef}
        data-lenis-prevent
        className="h-full overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto max-w-3xl px-6 pb-24">
          {/* Reader toolbar — sticks just under the site header */}
          <div className="sticky top-16 z-10 -mx-6 mb-8 mt-0 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-ink-950/90 px-6 py-3 backdrop-blur-md">
            <button
              ref={closeRef}
              onClick={onClose}
              className="min-h-11 rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400 transition-colors hover:border-gold-400 hover:text-gold-400"
            >
              ← Resources
            </button>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-stone-400">
              {idx + 1} / {activeQueue.length}
            </span>
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-400">
            {article.category}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-stone-100 md:text-5xl">
            {article.title}
          </h2>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
            {article.minutes} min · Interactive lesson · Educational only — not advice
          </p>

          {/* Live visualization */}
          <div className="mt-8 h-64 overflow-hidden rounded-xl border border-white/10 sm:h-80">
            <LessonDemo variant={article.demo} active animate />
          </div>

          {/* Body */}
          <ResourceArticleBody content={article.content} />
          <ResourceSources article={article} />
          <a href={`/resources/${article.slug}`} className="mt-6 inline-flex min-h-11 items-center text-sm text-gold-400 underline underline-offset-4">
            Open full article page →
          </a>

          {/* Related resources */}
          {related.length > 0 && (
            <section
              aria-label="Related resources"
              className="mt-14 border-t border-white/10 pt-8"
            >
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-400">
                Continue here
              </h2>
              <div className="mt-4 grid gap-3">
                {related.map((r) => (
                  <a
                    key={r.slug}
                    href={`/resources/${r.slug}`}
                    onClick={(event) => openReaderLink(event, () => onNavigate(r))}
                    className={`flex items-center gap-4 rounded-xl border border-white/[0.09] px-5 py-4 pr-12 text-left ${clickableCardInteraction}`}
                  >
                    <ClickableCardAccent />
                    <span>
                      <span className="block font-display text-base text-stone-100 group-hover:text-gold-400">
                        {r.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
                        {r.category} · {r.minutes} min
                      </span>
                    </span>
                    <ClickableCardArrow />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Prev / next */}
          <nav
            aria-label="Article navigation"
            className="mt-12 flex flex-wrap items-center justify-between gap-3"
          >
            {prev ? (
              <a
                href={`/resources/${prev.slug}`}
                onClick={(event) => openReaderLink(event, () => onNavigate(prev))}
                className="min-h-11 max-w-[48%] truncate rounded-full border border-white/15 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-stone-400 transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                ← {prev.title}
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a
                href={`/resources/${next.slug}`}
                onClick={(event) => openReaderLink(event, () => onNavigate(next))}
                className="min-h-11 max-w-[48%] truncate rounded-full border border-white/15 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-stone-400 transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                {next.title} →
              </a>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </div>
    </div>,
    document.body
  );
}
