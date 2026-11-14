import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("max-w-full", className)}>
      <ol className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[9px] uppercase tracking-[0.2em] sm:gap-x-3 sm:text-[10px]">
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 max-w-full items-center gap-x-2 sm:gap-x-3">
              {index === 0 && (
                <span aria-hidden className="shrink-0 text-gold-400/65">
                  ←
                </span>
              )}
              {index > 0 && (
                <span aria-hidden className="shrink-0 text-gold-400/45">
                  /
                </span>
              )}
              {current || !item.href ? (
                <span aria-current={current ? "page" : undefined} className="min-w-0 break-words text-copy-secondary">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 min-w-11 items-center text-cream-500 transition-colors duration-300 hover:text-gold-400 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
