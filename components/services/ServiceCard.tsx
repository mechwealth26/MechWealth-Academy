"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ServiceCardIllustration from "@/components/services/ServiceCardIllustration";
import {
  ClickableCardAccent,
  ClickableCardArrow,
  clickableCardInteraction,
} from "@/components/ui/ClickableCard";
import { cn } from "@/lib/utils";
import type { Service } from "@/data/services";
import { trackConversion } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ServiceCard({
  service,
  featured = false,
  delay = 0,
}: {
  service: Service;
  featured?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className="h-full"
    >
      <Link
        href={`/services/${service.slug}`}
        onClick={() =>
          trackConversion("explore_service_click", {
            service_slug: service.slug,
            service_name: service.title,
          })
        }
        className={cn(
          "grid h-full overflow-hidden border border-white/[0.09] bg-white/[0.018] [border-radius:var(--radius-lg)]",
          clickableCardInteraction,
          featured && "lg:min-h-[30rem] lg:grid-cols-[minmax(0,1.06fr)_minmax(22rem,0.94fr)]"
        )}
      >
        <ClickableCardAccent />

        <span
          className={cn(
            "relative block min-h-60 overflow-hidden bg-ink-950/40",
            featured ? "lg:min-h-full" : "border-b border-white/[0.06]"
          )}
        >
          <ServiceCardIllustration motif={service.motif} />
        </span>

        <span className={cn("flex min-w-0 flex-col p-7 sm:p-8", featured && "justify-center lg:p-11")}>
          <span className="flex items-center justify-between gap-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold-400/78">
              {service.category}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-copy-muted">
              {service.index} / 05
            </span>
          </span>
          <span className={cn("mt-6 block font-display leading-tight text-cream-100 transition-colors duration-300 group-hover:text-gold-300", featured ? "text-3xl sm:text-4xl" : "text-2xl")}> 
            {service.title}
          </span>
          <span className="mt-4 block max-w-xl text-sm leading-7 text-copy-secondary">
            {service.tagline}
          </span>
          <span className="mt-8 flex items-center gap-4 border-t border-white/[0.06] pt-5 pr-10">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-cream-500 transition-colors duration-300 group-hover:text-gold-400">
              Explore the service
            </span>
          </span>
        </span>
        <ClickableCardArrow />
      </Link>
    </motion.article>
  );
}
