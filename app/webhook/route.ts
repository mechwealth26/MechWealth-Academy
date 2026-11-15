import { createHmac, timingSafeEqual } from "node:crypto";
import { COURSE_STAGES } from "@/data/courses";

export const runtime = "nodejs";
const API_VERSION = "v21.0";

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function GET(req: Request) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) return new Response("Webhook not configured", { status: 503 });

  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("hub.challenge");
  if (searchParams.get("hub.mode") === "subscribe" &&
      searchParams.get("hub.verify_token") === verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Verification failed", { status: 403 });
}

export async function POST(req: Request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!appSecret || !accessToken || !phoneNumberId || !/^\d+$/.test(phoneNumberId)) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = req.headers.get("x-hub-signature-256");
  if (!signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = Buffer.from(await req.arrayBuffer());
    const expected = createHmac("sha256", appSecret).update(rawBody).digest();
    const supplied = Buffer.from(signature.slice(7), "hex");
    if (!timingSafeEqual(expected, supplied)) {
      return new Response("Invalid signature", { status: 401 });
    }
    body = record(JSON.parse(rawBody.toString("utf8")));
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
  if (body.object !== "whatsapp_business_account" || !Array.isArray(body.entry)) {
    return new Response("Invalid payload", { status: 400 });
  }

  for (const entry of body.entry) {
    const changes = record(entry).changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      const value = record(record(change).value);
      if (record(change).field !== "messages" || value.messaging_product !== "whatsapp" ||
          record(value.metadata).phone_number_id !== phoneNumberId || !Array.isArray(value.messages)) continue;
      for (const item of value.messages) {
        const message = record(item);
        const from = message.from;
        const textBody = record(message.text).body;
        // Ignore delivery receipts, non-text events and unsupported sender identifiers.
        if (message.type !== "text" || typeof from !== "string" || !/^\d+$/.test(from) ||
            typeof textBody !== "string") continue;
        const text = textBody.toLowerCase().trim();
        const course = COURSE_STAGES.find((stage) => String(Number(stage.num)) === text);
        let reply: string;
        if (text === "hi" || text === "hello" || text === "hey") {
          const menu = COURSE_STAGES.map((stage) => `${Number(stage.num)}. ${stage.title} — ${stage.level}`).join("\n");
          reply = `Hi! Welcome to MECHWEALTH 👋\n\nChoose a course to learn more:\n${menu}\n\nReply with 1, 2, 3 or 4.\nCompare the courses: https://mechwealth.com/courses`;
        } else if (course) {
          reply = `${course.title} — ${course.level}\n\n${course.description}\n\nWho it is for: ${course.audience}\n\nCourse details: https://mechwealth.com/courses/${course.slug}\nFor syllabus and enquiries: https://mechwealth.com/contact`;
        } else if (text === "yes") {
          reply = "You can request a syllabus or ask about a course here: https://mechwealth.com/contact\n\nReply HI to see the courses again.";
        } else {
          reply = "Thanks for messaging MECHWEALTH! Reply HI to see the courses, or send an enquiry at https://mechwealth.com/contact";
        }

        try {
          const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messaging_product: "whatsapp", to: from, type: "text", text: { body: reply } }),
            signal: AbortSignal.timeout(10_000),
          });
          if (!response.ok) return new Response("Reply delivery failed", { status: 502 });
        } catch {
          return new Response("Reply delivery failed", { status: 502 });
        }
      }
    }
  }
  // shortcut: no durable message-ID deduplication; add shared storage before relying on retry-safe replies.
  return new Response("OK", { status: 200 });
}
