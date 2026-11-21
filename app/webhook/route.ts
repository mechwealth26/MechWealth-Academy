import { createHmac, timingSafeEqual } from "node:crypto";
import { COURSE_STAGES } from "@/data/courses";
import { SERVICES } from "@/data/services";

export const runtime = "nodejs";
const API_VERSION = "v21.0";
type Lang = "en" | "hi" | "kn";
type Reply = Record<string, unknown>;
const courseIds = ["trading_foundational", "trading_practitioner", "trading_advanced", "trading_onetoone"];
const serviceIds = ["inv_demat", "inv_mutual", "inv_insurance", "inv_physical", "inv_iepf"];
const enquiryUrl = "https://mechwealth.com/contact";
const userLanguages = new Map<string, { lang: Lang; expires: number }>();
const RETENTION_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 1000;
type Delivery = { expires: number; next: number; replies: Reply[]; pending?: Promise<void> };
// shortcut: retry progress and language choices are bounded to this process for 30 minutes;
// shared durable storage is required for deduplication across restarts or multiple workers.
const deliveries = new Map<string, Delivery>();

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}
function text(body: string): Reply { return { type: "text", text: { body } }; }
function buttons(body: string, options: { id: string; title: string }[]): Reply {
  return { type: "interactive", interactive: { type: "button", body: { text: body },
    action: { buttons: options.map((reply) => ({ type: "reply", reply })) } } };
}
function list(body: string, button: string, title: string, rows: { id: string; title: string }[]): Reply {
  return { type: "interactive", interactive: { type: "list", body: { text: body },
    footer: { text: "MechWealth Academy" }, action: { button, sections: [{ title, rows }] } } };
}
function prune() {
  const now = Date.now();
  for (const [key, item] of deliveries) if (!item.pending && item.expires <= now) deliveries.delete(key);
  for (const [key, item] of userLanguages) if (item.expires <= now) userLanguages.delete(key);
}
function repliesFor(selection: string, from: string): Reply[] {
  if (selection === "lang_en" || selection === "lang_hi" || selection === "lang_kn") {
    const lang = selection.slice(5) as Lang;
    if (!userLanguages.has(from) && userLanguages.size >= MAX_ENTRIES) userLanguages.delete(userLanguages.keys().next().value!);
    userLanguages.set(from, { lang, expires: Date.now() + RETENTION_MS });
    const copy = {
      en: ["Hi! Welcome to MechWealth 👋\n\nWhat would you like to explore?", "Trading Course", "Services", "Enquire"],
      hi: ["नमस्ते! MechWealth में आपका स्वागत है 👋\n\nआप क्या जानना चाहते हैं?", "ट्रेडिंग कोर्स", "सेवाएं", "पूछताछ"],
      kn: ["ಹಾಯ್! MechWealth ಗೆ ಸುಸ್ವಾಗತ 👋\n\nನೀವು ಏನನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?", "ಟ್ರೇಡಿಂಗ್ ಕೋರ್ಸ್", "ಸೇವೆಗಳು", "ವಿಚಾರಣೆ"],
    }[lang];
    return [buttons(copy[0], ["trading", "investment", "demo"].map((id, i) => ({ id, title: copy[i + 1] })))];
  }
  if (["hi", "hello", "hey"].includes(selection)) {
    return [buttons("Please choose your language\nकृपया अपनी भाषा चुनें\nದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", [
      { id: "lang_en", title: "English" }, { id: "lang_hi", title: "हिन्दी" }, { id: "lang_kn", title: "ಕನ್ನಡ" },
    ])];
  }
  if (selection === "trading") return [list("Great! Which Trading Course are you interested in?\nTap to select:", "View Courses", "Trading Courses",
    COURSE_STAGES.map((course, i) => ({ id: courseIds[i], title: course.title })))];
  if (selection === "investment") return [list("Which service are you interested in?\nTap to select:", "View Services", "Services",
    SERVICES.map((service, i) => ({ id: serviceIds[i], title: service.title })))];
  const course = COURSE_STAGES[courseIds.indexOf(selection)];
  if (course) return [buttons(`You selected: ${course.title} ✅\n${course.description}\n\nCourse details: https://mechwealth.com/courses/${course.slug}\nWant the full syllabus?`, [
    { id: "yes_btn", title: "✅ Yes" }, { id: "no_btn", title: "❌ No" },
  ])];
  const service = SERVICES[serviceIds.indexOf(selection)];
  if (service) return [buttons(`You selected: ${service.title} ✅\n${service.summary}\n\nService details: https://mechwealth.com/services/${service.slug}\nWould you like to enquire?`, [
    { id: "yes_btn", title: "✅ Yes" }, { id: "no_btn", title: "❌ No" },
  ])];
  const lang = userLanguages.get(from)?.lang ?? "en";
  if (selection === "no_btn") return [text({
    en: "No problem! 🙏\nWhenever you're ready, send Hi again.\nhttps://mechwealth.com",
    hi: "कोई बात नहीं! 🙏\nजब भी तैयार हों, फिर से Hi भेजें।\nhttps://mechwealth.com",
    kn: "ಪರವಾಗಿಲ್ಲ! 🙏\nನೀವು ಸಿದ್ಧರಾದಾಗ ಮತ್ತೆ Hi ಕಳುಹಿಸಿ.\nhttps://mechwealth.com",
  }[lang])];
  return [text({
    en: `For course and service enquiries, please use ${enquiryUrl}\nReply HI to see the menu again.`,
    hi: `कोर्स और सेवाओं के बारे में पूछताछ के लिए ${enquiryUrl} पर जाएं।\nमेनू फिर से देखने के लिए HI भेजें।`,
    kn: `ಕೋರ್ಸ್ ಮತ್ತು ಸೇವೆಗಳ ವಿಚಾರಣೆಗಾಗಿ ${enquiryUrl} ಬಳಸಿ.\nಮೆನು ಮತ್ತೆ ನೋಡಲು HI ಕಳುಹಿಸಿ.`,
  }[lang])];
}

export async function GET(req: Request) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) return new Response("Webhook not configured", { status: 503 });
  const query = new URL(req.url).searchParams;
  const challenge = query.get("hub.challenge");
  if (query.get("hub.mode") === "subscribe" && query.get("hub.verify_token") === verifyToken && challenge) {
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
  if (!signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return new Response("Invalid signature", { status: 401 });
  let body: Record<string, unknown>;
  try {
    const raw = Buffer.from(await req.arrayBuffer());
    const expected = createHmac("sha256", appSecret).update(raw).digest();
    if (!timingSafeEqual(expected, Buffer.from(signature.slice(7), "hex"))) return new Response("Invalid signature", { status: 401 });
    body = record(JSON.parse(raw.toString("utf8")));
  } catch { return new Response("Invalid payload", { status: 400 }); }
  if (body.object !== "whatsapp_business_account" || !Array.isArray(body.entry)) return new Response("Invalid payload", { status: 400 });
  prune();
  let failed = false;
  for (const entry of body.entry) {
    const changes = record(entry).changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      const event = record(change);
      const value = record(event.value);
      if (event.field !== "messages" || value.messaging_product !== "whatsapp" ||
          record(value.metadata).phone_number_id !== phoneNumberId || !Array.isArray(value.messages)) continue;
      for (const item of value.messages) {
        const message = record(item);
        const from = message.from;
        const id = message.id;
        const interactive = record(message.interactive);
        const selection = message.type === "text" ? record(message.text).body
          : message.type === "interactive" && interactive.type === "button_reply" ? record(interactive.button_reply).id
          : message.type === "interactive" && interactive.type === "list_reply" ? record(interactive.list_reply).id : undefined;
        if (typeof from !== "string" || !/^\d+$/.test(from) || typeof id !== "string" || !id || id.length > 512 || typeof selection !== "string") continue;
        const key = JSON.stringify([phoneNumberId, from, id]);
        let delivery = deliveries.get(key);
        if (!delivery) {
          if (deliveries.size >= MAX_ENTRIES) {
            const evict = [...deliveries].find(([, item]) => !item.pending)?.[0];
            if (evict === undefined) { failed = true; continue; }
            deliveries.delete(evict);
          }
          delivery = { expires: Date.now() + RETENTION_MS, next: 0, replies: repliesFor(selection.toLowerCase().trim(), from) };
          deliveries.set(key, delivery);
        }
        const current = delivery;
        if (!current.pending) {
          current.pending = (async () => {
            while (current.next < current.replies.length) {
              const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
                method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ messaging_product: "whatsapp", to: from, ...current.replies[current.next] }),
                signal: AbortSignal.timeout(10_000),
              });
              if (!response.ok) throw new Error("Reply delivery failed");
              current.next += 1;
            }
          })();
        }
        const pending = current.pending;
        try { await pending; } catch { failed = true; }
        finally { if (current.pending === pending) current.pending = undefined; }
      }
    }
  }
  return new Response(failed ? "Reply delivery failed" : "OK", { status: failed ? 502 : 200 });
}
