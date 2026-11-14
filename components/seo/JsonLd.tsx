/**
 * Renders a Schema.org JSON-LD block. Server component — safe in any page
 * or template. One <script type="application/ld+json"> per call.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
