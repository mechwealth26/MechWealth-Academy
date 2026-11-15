import { COURSE_STAGES } from "@/data/courses";

export const runtime = "nodejs";
const API_VERSION = "v21.0";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "MechWealth";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

// 1. VERIFICATION - This is why you get 12345
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Verification failed", { status: 403 });
}

// Helper to send reply
async function sendReply(to: string, text: string) {
  console.log("SENDING REPLY TO:", to, "TEXT:", text);
  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );
  const result = await res.text();
  console.log("WHATSAPP SEND RESULT:", res.status, result);
}

// 2. RECEIVE + REPLY
export async function POST(req: Request) {
  // LOG FIRST - before anything else
  const rawBody = await req.text();
  console.log("WEBHOOK RECEIVED RAW:", rawBody);

  try {
    const body = JSON.parse(rawBody);
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return new Response("OK", { status: 200 });
    }

    const from = message.from as string;
    const text = ((message.text?.body as string) || "").toLowerCase().trim();

    console.log("FROM:", from, "TEXT:", text);

    // ===== YOUR BOT FLOW =====
    let reply = "";
    if (text === "hi" || text === "hello" || text === "hey") {
      reply = `Hi! Welcome to MechWealth 👋\n\nWhat do you want to learn?\n1. Trading Courses\n2. Investing Courses\n3. Free Demo\n4. Talk to Team\n\nReply with 1, 2, 3 or 4`;
    } else if (text === "1") {
      reply = `Great! Our Trading Course covers Price Action + Risk Management.\n\nWant the full syllabus? Reply YES`;
    } else if (text === "2") {
      reply = `Great! Our Investing Course covers Stocks + Mutual Funds for long term wealth.\n\nWant the full syllabus? Reply YES`;
    } else if (text === "3") {
      reply = `Awesome! Share your Name and we will book your Free Demo.`;
    } else if (text === "4") {
      reply = `Our team will contact you shortly. Please share your Name and City.`;
    } else if (text === "yes") {
      reply = `Perfect! Please share your Name and Phone Number and our team will send you the syllabus on WhatsApp.`;
    } else {
      reply = `Thanks for messaging MechWealth! Reply HI to see the menu again.`;
    }

    await sendReply(from, reply);
  } catch (e) {
    console.error("WEBHOOK ERROR:", e);
  }

  // ALWAYS return OK, even if message exists
  return new Response("OK", { status: 200 });
}
