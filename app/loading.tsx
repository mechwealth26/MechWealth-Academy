export default function Loading() {
  return (
    <main id="main" aria-busy="true" aria-label="Loading page" className="min-h-screen pt-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-3 w-40 animate-pulse rounded-full bg-gold-400/20" />
        <div className="mt-8 h-14 max-w-3xl animate-pulse rounded-xl bg-white/[0.07]" />
        <div className="mt-4 h-14 max-w-2xl animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="mt-10 h-5 max-w-xl animate-pulse rounded bg-white/[0.05]" />
      </div>
      <p className="sr-only" role="status">Loading page…</p>
    </main>
  );
}
