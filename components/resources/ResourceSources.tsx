import type { ResourceArticle } from "@/data/resources";

export default function ResourceSources({ article }: { article: ResourceArticle }) {
  if (!article.sources?.length) return null;
  return (
    <section aria-label="Sources and scope" className="mt-10 border-t border-white/10 pt-6">
      <h2 className="font-display text-xl text-stone-100">Sources and scope</h2>
      <ul className="mt-4 space-y-4 text-sm leading-relaxed text-stone-300">
        {article.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} className="text-gold-400 underline underline-offset-4">{source.title}</a>
            <p className="mt-1">{source.scope}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-stone-400">
        These source checks cover the rules named above, not the article’s trading interpretations. Rules can change; check the current exchange notice for your instrument.
      </p>
    </section>
  );
}
