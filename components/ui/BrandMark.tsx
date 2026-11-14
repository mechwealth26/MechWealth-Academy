import Image from "next/image";
import { siteConfig } from "@/data/site";

/** Shared icon and wordmark; the surrounding home link supplies its accessible name. */
export default function BrandMark({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`inline-flex min-w-0 items-center ${footer ? "gap-3" : "gap-2 sm:gap-2.5"}`}>
      <Image
        src={siteConfig.logo}
        alt=""
        aria-hidden="true"
        width={46}
        height={46}
        unoptimized
        loading="eager"
        className={`shrink-0 object-contain ${footer ? "h-11 w-11 sm:h-[46px] sm:w-[46px]" : "h-8 w-8 sm:h-9 sm:w-9"}`}
      />
      <span className={`flex min-w-0 flex-col ${footer ? "" : "max-[319px]:sr-only"}`}>
        <span className={`whitespace-nowrap font-display font-semibold text-cream-100 ${footer ? "text-lg tracking-wide sm:text-xl" : "text-xs tracking-[0.12em] sm:text-sm sm:tracking-[0.16em]"}`}>
          {siteConfig.shortName}<span className="text-gold-500">.</span>
        </span>
        {footer && (
          <span className="mt-1 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.24em] text-cream-500 sm:text-[10px]">
            Trading Academy
          </span>
        )}
      </span>
    </span>
  );
}
