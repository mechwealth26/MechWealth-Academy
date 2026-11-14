"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { buttonClasses } from "@/lib/buttonStyles";
import { useLenis } from "@/hooks/useLenis";
import BrandMark from "@/components/ui/BrandMark";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";

const EASE = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function WhatsAppLink() {
  return (
    <a
      href={`https://wa.me/${siteConfig.contact.telephone.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MECHWEALTH on WhatsApp (opens in a new tab)"
      title={`WhatsApp: ${siteConfig.contact.phone}`}
      className="theme-switcher-button inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-copy-secondary transition-colors hover:text-cream-100"
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .1 5.4.1 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6a12 12 0 0 0 5.8 1.5h.1c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.6-8.4ZM12.1 21.9a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10 10 0 0 1 2.1 12c0-5.5 4.5-10 10-10a10 10 0 0 1 7.1 2.9 10 10 0 0 1 2.9 7.1c0 5.5-4.5 9.9-10 9.9Zm5.5-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2.1-.4 0-.5L8.8 6.6c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1 1-1 2.5 1.1 2.9 1.3 3.1c.1.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" />
      </svg>
    </a>
  );
}

/**
 * Global navigation.
 *
 * - Transparent over the hero; refined dark/blurred once scrolled.
 * - Hides on scroll-down, returns on scroll-up (never while the menu is open).
 * - Active page indicator (shared-layout gold rule).
 * - Fullscreen mobile menu: staggered reveal, scroll lock (Lenis-aware),
 *   Escape to close, focus moved in and restored.
 */
export default function Navbar() {
  const pathname = usePathname();
  const lenis = useLenis();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const homeLinkRef = useRef<HTMLAnchorElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Scroll state: transparent over the hero, dark/blurred once scrolled.
  // The header is always sticky — it never hides.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the menu whenever the route changes (e.g. back/forward navigation;
  // in-menu links already close it explicitly on click). Render-time
  // adjustment is React's documented pattern for state derived from props.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  // Menu side-effects: scroll lock, background isolation, keyboard confinement,
  // initial focus and focus restoration.
  useEffect(() => {
    if (!open) return;
    // Match Tailwind's xl breakpoint so a hidden menu cannot retain its locks.
    const desktop = window.matchMedia("(min-width: 80rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    closeOnDesktop();

    const ownsScrollLock = document.documentElement.style.overflow !== "hidden";
    lenis?.stop();
    if (ownsScrollLock) document.documentElement.style.overflow = "hidden";

    const backgroundElements = [
      document.querySelector<HTMLElement>('a[href="#main"]'),
      headerRef.current,
      document.querySelector<HTMLElement>("main#main"),
      document.querySelector<HTMLElement>("footer"),
    ].filter((element): element is HTMLElement => Boolean(element));

    const ownedInertElements = backgroundElements.filter(
      (element) => !element.inert
    );
    ownedInertElements.forEach((element) => {
      element.inert = true;
    });

    const focusTimer = setTimeout(() => firstLinkRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
      ).filter(
        (element) =>
          !element.hidden &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        e.preventDefault();
        return;
      }

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const menuBtn = menuBtnRef.current;
    const homeLink = homeLinkRef.current;
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      ownedInertElements.forEach((element) => {
        element.inert = false;
      });
      if (ownsScrollLock) {
        lenis?.start();
        document.documentElement.style.overflow = "";
      }
      requestAnimationFrame(() => {
        const target = desktop.matches ? homeLink : menuBtn;
        target?.focus();
      });
    };
  }, [open, lenis]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-out ${
          scrolled || open
            ? "border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="relative mx-auto grid h-16 w-full grid-cols-[1fr_auto] items-center px-4 sm:px-6 md:px-16 xl:grid-cols-[1fr_auto_1fr]"
        >
          <Link
            ref={homeLinkRef}
            href="/"
            aria-label="MECHWEALTH — home"
            className="inline-flex min-h-11 min-w-11 items-center justify-self-start font-display text-sm font-semibold tracking-[0.22em] text-cream-100 transition-colors duration-300 hover:text-gold-400"
          >
            <BrandMark />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-7 xl:flex xl:justify-self-center 2xl:gap-8">
            {siteConfig.nav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex min-h-11 min-w-11 items-center justify-center text-sm transition-colors duration-300 ${
                      active
                        ? "text-gold-400"
                        : "text-cream-300 hover:text-cream-100"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active-indicator"
                        transition={{ duration: 0.35, ease: EASE }}
                        className="absolute inset-x-0 -bottom-0.5 h-px bg-gold-500"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-self-end xl:gap-3">
            <WhatsAppLink />
            <ThemeSwitcher />
            <Link
              href={siteConfig.cta.href}
              className={buttonClasses("primary", "sm", "hidden xl:inline-flex")}
            >
              {siteConfig.cta.label}
            </Link>

          {/* Hamburger — 44px touch target, animates to an X */}
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative -mr-2 flex h-11 w-11 items-center justify-center justify-self-end xl:hidden"
          >
            <span
              aria-hidden
              className={`absolute h-px w-6 bg-cream-100 transition-transform duration-300 ease-out ${
                open ? "rotate-45" : "-translate-y-[5px]"
              }`}
            />
            <span
              aria-hidden
              className={`absolute h-px w-6 bg-cream-100 transition-transform duration-300 ease-out ${
                open ? "-rotate-45" : "translate-y-[5px]"
              }`}
            />
          </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen mobile menu */}
      {open && (
        <motion.div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            data-lenis-prevent
            className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-ink-950/[0.985] backdrop-blur-xl xl:hidden"
          >
            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-4 pb-10 sm:px-6">
              <div className="flex h-16 shrink-0 items-center justify-between">
                <span className="font-display text-sm font-semibold tracking-[0.22em] text-cream-100">
                  <BrandMark />
                </span>
                <div className="flex items-center gap-1">
                  <WhatsAppLink />
                  <ThemeSwitcher />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="relative -mr-2 flex h-11 w-11 shrink-0 items-center justify-center"
                  >
                    <span aria-hidden className="absolute h-px w-6 rotate-45 bg-cream-100" />
                    <span aria-hidden className="absolute h-px w-6 -rotate-45 bg-cream-100" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center py-6 [@media(max-height:640px)]:justify-start [@media(max-height:640px)]:py-3">
                <ul>
                  {siteConfig.nav.map((item, i) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.href} className="overflow-hidden">
                        <motion.div
                          initial={{ y: 26, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.05 + i * 0.055,
                            ease: EASE,
                          }}
                        >
                          <Link
                            ref={i === 0 ? firstLinkRef : undefined}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={`flex min-h-11 touch-manipulation items-center py-2.5 font-display text-2xl font-semibold transition-colors duration-300 sm:text-3xl ${
                              active ? "text-gold-400" : "text-cream-100"
                            }`}
                          >
                            <span className="mr-4 font-mono text-xs tracking-[0.2em] text-accent-muted">
                              0{i + 1}
                            </span>
                            {item.label}
                          </Link>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.34, ease: EASE }}
                  className="mt-8"
                >
                  <Link
                    href={siteConfig.cta.href}
                    onClick={() => setOpen(false)}
                    className={`${buttonClasses("primary", "lg")} w-full sm:w-auto`}
                  >
                    {siteConfig.cta.label}
                  </Link>
                  <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.3em] text-copy-muted">
                    {siteConfig.shortName} · Trading Academy
                  </p>
                </motion.div>
              </div>
            </div>
        </motion.div>
      )}
    </>
  );
}
