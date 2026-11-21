// Website chat is retired; the floating button opens WhatsApp directly.
export function POST() {
  return Response.json(
    { error: "Website chat is unavailable. Please use the WhatsApp link on the website." },
    { status: 410 },
  );
}
