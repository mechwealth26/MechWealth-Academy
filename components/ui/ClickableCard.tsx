import { cn } from "@/lib/utils";

/** Shared interaction contract for every card that navigates or opens content. */
export const clickableCardInteraction =
  "group relative transition-[border-color,background-color,box-shadow] duration-300 ease-out hover:border-gold-400/35 hover:bg-gold-400/[0.025] hover:shadow-[0_24px_60px_-32px_rgba(232,201,106,0.28)] focus-visible:border-gold-400/35 focus-visible:bg-gold-400/[0.025] focus-visible:shadow-[0_24px_60px_-32px_rgba(232,201,106,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400";

export function ClickableCardAccent() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-gradient-to-r from-gold-400 via-gold-400/60 to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
    />
  );
}

export function ClickableCardArrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      data-card-arrow
      className={cn(
        "pointer-events-none absolute bottom-6 right-6 z-20 text-gold-400 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1",
        className
      )}
    >
      →
    </span>
  );
}
