import { NextResponse } from "next/server";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  program?: unknown;
  message?: unknown;
  website?: unknown;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Expected JSON." }, { status: 415 });
  }

  let body: ContactPayload;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    body = parsed as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const payload = {
    name: clean(body.name, 120),
    email: clean(body.email, 254),
    phone: clean(body.phone, 40),
    program: clean(body.program, 80),
    message: clean(body.message, 3000),
  };

  if (
    !payload.name ||
    !payload.phone ||
    (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email))
  ) {
    return NextResponse.json(
      { error: "Please provide your name and phone number, and a valid email if you include one." },
      { status: 400 }
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.CONTACT_FORM_FROM_EMAIL;
  const resendTo = process.env.CONTACT_FORM_TO_EMAIL;
  const webhookUrl = process.env.CONTACT_FORM_WEBHOOK_URL;
  // An explicitly configured Resend key takes precedence over the legacy webhook.
  if (resendKey ? !resendFrom || !resendTo : !webhookUrl) {
    return NextResponse.json(
      { error: "Enquiries are temporarily unavailable. Your message has not been sent. Please try again later." },
      { status: 503 }
    );
  }

  try {
    if (resendKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [resendTo],
          subject: "New MECHWEALTH course enquiry",
          ...(payload.email ? { reply_to: payload.email } : {}),
          // Plain text keeps visitor-supplied content out of HTML and headers.
          text: [
            "New enquiry from the MECHWEALTH contact form",
            `Name: ${payload.name}`,
            `Phone: ${payload.phone}`,
            `Email: ${payload.email || "Not provided"}`,
            `Course: ${payload.program || "Not specified"}`,
            "", "Message:", payload.message || "Not provided",
          ].join("\n"),
        }),
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Resend returned ${response.status}`);
      const result: unknown = await response.json();
      if (!result || typeof result !== "object" || !("id" in result) ||
          typeof result.id !== "string" || !result.id) {
        throw new Error("Resend did not return an email ID");
      }
      return NextResponse.json({ ok: true });
    }

    const response = await fetch(webhookUrl!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.CONTACT_FORM_WEBHOOK_TOKEN
          ? { authorization: `Bearer ${process.env.CONTACT_FORM_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Contact delivery failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "We could not send your enquiry. Please try again." },
      { status: 502 }
    );
  }
}
