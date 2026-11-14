import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LessonDemo from "@/components/foundation/LessonDemo";
import ResourceArticleBody from "@/components/resources/ResourceArticleBody";
import ResourceSources from "@/components/resources/ResourceSources";
import { RESOURCES } from "@/data/resources";

export const dynamicParams = false;

export function generateStaticParams() {
  return RESOURCES.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

function findArticle(slug: string) {
  const article = RESOURCES.find((resource) => resource.slug === slug);
  if (!article) notFound();
  return article;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = findArticle((await params).slug);
  const title = article.content.split("\n")[0].replace(/^# /, "");
  const path = `/resources/${article.slug}`;
  return {
    title,
    description: article.summary,
    alternates: { canonical: path },
    openGraph: { title, description: article.summary, url: path, type: "article" },
    twitter: { card: "summary_large_image", title, description: article.summary },
  };
}

export default async function ResourcePage({ params }: Props) {
  const article = findArticle((await params).slug);
  const index = RESOURCES.indexOf(article);
  const previous = RESOURCES[index - 1];
  const next = RESOURCES[index + 1];
  const related = RESOURCES.filter((resource) => article.related.includes(resource.slug));

  return (
    <main id="main" className="relative min-h-screen">
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-24 sm:pt-28">
        <Link href="/resources" className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400 hover:border-gold-400 hover:text-gold-400">
          ← Resources
        </Link>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-gold-400">{article.category}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-stone-100 md:text-5xl">
          {article.content.split("\n")[0].replace(/^# /, "")}
        </h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
          {article.minutes} min · Interactive lesson · Educational only — not advice
        </p>
        <div className="mt-8 h-64 overflow-hidden rounded-xl border border-white/10 sm:h-80">
          <LessonDemo variant={article.demo} active animate />
        </div>
        <ResourceArticleBody content={article.content} />
        <ResourceSources article={article} />
        <nav aria-label="Related resources" className="mt-14 border-t border-white/10 pt-8">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-400">Continue here</h2>
          <div className="mt-4 grid gap-3">
            {related.map((resource) => (
              <Link key={resource.slug} href={`/resources/${resource.slug}`} className="rounded-xl border border-white/[0.09] px-5 py-4 font-display text-base text-stone-100 hover:border-gold-400 hover:text-gold-400">
                {resource.title} →
              </Link>
            ))}
          </div>
        </nav>
        <nav aria-label="Article navigation" className="mt-12 flex flex-wrap justify-between gap-4 text-sm text-gold-400">
          {previous && <Link className="inline-flex min-h-11 items-center" href={`/resources/${previous.slug}`}>← {previous.title}</Link>}
          {next && <Link className="ml-auto inline-flex min-h-11 items-center" href={`/resources/${next.slug}`}>{next.title} →</Link>}
        </nav>
      </article>
    </main>
  );
}
