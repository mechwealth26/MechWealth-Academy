import { COURSE_STAGES } from "@/data/courses";

export const runtime = "nodejs";
const API_VERSION = "v21.0";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "MechWealth";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// VERIFICATION - Don't touch this
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

// Helper 1: Send Plain Text
async function sendText(to: string, text: string) {
  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
  });
}

// Helper 2: Send Buttons - THIS IS NEW
async function sendMenuButtons(to: string) {
  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "Hi! Welcome to MechWealth 👋\n\nWhat do you want to learn?" },
        action: {
          buttons: [
            { type: "reply", reply: { id: "trading", title: "📈 Trading Course" } },
            { type: "reply", reply: { id: "investing", title: "💰 Investing Course" } },
            { type: "reply", reply: { id: "demo", title: "🎓 Free Demo" } },
          ],
        },
      },
    }),
  });
}

// MAIN BOT
export async function POST(req: Request) {
  const rawBody = await req.text();
  console.log("WEBHOOK RECEIVED RAW:", rawBody);

  try {
    const body = JSON.parse(rawBody);
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return new Response("OK", { status: 200 });

    const from = message.from as string; // <-- THIS IS THE CUSTOMER'S NUMBER, AUTO-CAPTURED
    console.log("CUSTOMER NUMBER:", from);

    // THIS IS THE KEY CHANGE: Check button tap FIRST, then text
    const buttonId = message.interactive?.button_reply?.id as string | undefined;
    const text = (buttonId || message.text?.body || "").toLowerCase().trim();
    console.log("USER SELECTED:", text);

    if (text === "hi" || text === "hello" || text === "hey") {
      await sendMenuButtons(from);
    } else if (text === "trading") {
      await sendText(from, `Great! You selected Trading Course 📈\n\nOur Trading Course covers Price Action + Risk Management.\n\nWant the full syllabus? Reply YES`);
    } else if (text === "investing") {
      await sendText(from, `Great! You selected Investing Course 💰\n\nOur Investing Course covers Stocks + Mutual Funds.\n\nWant the full syllabus? Reply YES`);
    } else if (text === "demo") {
      await sendText(from, `Awesome! You selected Free Demo 🎓\n\nWe have your number: ${from}\nOur team will call you on this same WhatsApp number.\n\nPlease share your Name to book your slot.`);
    } else if (text === "yes") {
      await sendText(from, `Perfect! We will send the syllabus to you on this number: ${from}\n\nPlease share your Name.`);
    } else {
      await sendMenuButtons(from);
    }
  } catch (e) {
    console.error("WEBHOOK ERROR:", e);
  }

  return new Response("OK", { status: 200 });
}
