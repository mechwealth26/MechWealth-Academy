import { siteConfig } from "@/data/site";

const PLATFORMS = [
  { name: "Instagram", host: "instagram.com" },
  { name: "Facebook", host: "facebook.com" },
  { name: "YouTube", host: "youtube.com" },
] as const;

export default function FooterSocialLinks() {
  const profiles = PLATFORMS.map((platform) => ({
    ...platform,
    href: siteConfig.socialLinks.find((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" &&
          url.hostname.replace(/^www\./, "") === platform.host &&
          url.pathname !== "/";
      } catch {
        return false;
      }
    }),
  }));

  return (
    <div className="mt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-500">
        {profiles.some((profile) => profile.href) ? "Follow along" : "Social pages coming soon"}
      </p>
      <ul aria-label="Social media" className="mt-3 flex items-center gap-3">
        {profiles.map(({ name, href }) => {
          const icon = name === "Instagram" ? (
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          ) : name === "Facebook" ? (
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M14 21v-8h2.7l.4-3H14V8c0-.9.3-1.5 1.6-1.5H17V3.8a18 18 0 0 0-2.3-.2C12.4 3.6 11 5 11 7.7V10H8v3h3v8h3Z" />
            </svg>
          ) : (
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
              <rect x="2" y="5" width="20" height="14" rx="4" />
              <path d="m10 8 6 4-6 4V8Z" fill="currentColor" stroke="none" />
            </svg>
          );
          const classes = "inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/25 text-gold-400";
          return (
            <li key={name}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Follow MECHWEALTH on ${name} (opens in a new tab)`} className={`${classes} transition-colors hover:border-gold-400 hover:bg-gold-500/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400`}>
                  {icon}
                </a>
              ) : (
                <span title={`${name} — coming soon`} className={`${classes} opacity-60`}>
                  {icon}
                  <span className="sr-only">{name} — coming soon</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
