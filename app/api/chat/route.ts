// Website Chat Brain - Separate from WhatsApp, same flow + WhatsApp Notification to Owner
// THIS FILE DOES NOT TOUCH WhatsApp Bot. WhatsApp Bot is in app/webhook/route.ts
export const runtime = "nodejs";

type Lang = "en" | "hi" | "kn";
type Session = { lang: Lang; context: string; stage: string };

const sessions = new Map<string, Session>();

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER!;
const API_VERSION = "v21.0";

// Send notification to YOU on WhatsApp when website lead comes
async function notifyOwner(name: string, interest: string) {
  try {
    console.log("SENDING OWNER NOTIFICATION FOR:", name, interest);
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: ADMIN_NUMBER,
        type: "template",
        template: {
          name: "lead_notification",
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: [
              { type: "text", parameter_name: "customer_name", text: name },
              { type: "text", parameter_name: "interest", text: interest },
              { type: "text", parameter_name: "time", text: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
            ],
          }],
        },
      }),
    });
    const result = await res.text();
    console.log("OWNER NOTIFICATION RESULT:", res.status, result);
  } catch (e) {
    console.error("OWNER NOTIFICATION ERROR:", e);
  }
}

function getSession(id: string): Session {
  if (!sessions.has(id)) sessions.set(id, { lang: "en", context: "Free Demo", stage: "language" });
  return sessions.get(id)!;
}

function menuText(lang: Lang) {
  if (lang === "hi") return { body: "नमस्ते! MechWealth में आपका स्वागत है 👋\n\nआप क्या सीखना चाहते हैं?", b1: "ट्रेडिंग कोर्स", b2: "निवेश", b3: "फ्री डेमो" };
  if (lang === "kn") return { body: "ಹಾಯ್! MechWealth ಗೆ ಸುಸ್ವಾಗತ 👋\n\nನೀವು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?", b1: "ಟ್ರೇಡಿಂಗ್ ಕೋರ್ಸ್", b2: "ಹೂಡಿಕೆ", b3: "ಉಚಿತ ಡೆಮೊ" };
  return { body: "Hi! Welcome to MechWealth 👋\n\nWhat do you want to learn?", b1: "Trading Course", b2: "Investment", b3: "Free Demo" };
}

export async function POST(req: Request) {
  const { sessionId, message } = await req.json();
  const s = getSession(sessionId || "default");
  const msg = (message || "").toString().trim();
  const lower = msg.toLowerCase();

  if (lower === "hi" || lower === "__start__") {
    s.stage = "language";
    return Response.json({
      text: "Please choose your language\nकृपया अपनी भाषा चुनें\nದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      buttons: [
        { id: "lang_en", title: "English" },
        { id: "lang_hi", title: "हिन्दी" },
        { id: "lang_kn", title: "ಕನ್ನಡ" },
      ],
    });
  }

  if (lower === "lang_en" || lower === "lang_hi" || lower === "lang_kn") {
    s.lang = lower === "lang_hi" ? "hi" : lower === "lang_kn" ? "kn" : "en";
    s.stage = "menu";
    const m = menuText(s.lang);
    return Response.json({ text: m.body, buttons: [{ id: "trading", title: m.b1 }, { id: "investment", title: m.b2 }, { id: "demo", title: m.b3 }] });
  }

  if (lower === "trading") {
    s.stage = "trading_list";
    return Response.json({
      text: "Great! Which Trading Course are you interested in?\nTap to select:",
      list: [
        { id: "trading_foundational", title: "Foundational" },
        { id: "trading_practitioner", title: "Foundation Practitioner" },
        { id: "trading_advanced", title: "Advanced" },
        { id: "trading_onetoone", title: "One-to-one" },
      ],
      listButton: "View Courses",
    });
  }

  if (lower === "investment") {
    s.stage = "investment_list";
    return Response.json({
      text: "Great! Which Investment service are you interested in?\nTap to select:",
      list: [
        { id: "inv_demat", title: "Demat & Trading Account" },
        { id: "inv_mutual", title: "Mutual funds" },
        { id: "inv_insurance", title: "Life & Health Insurance" },
        { id: "inv_physical", title: "Physical share services" },
        { id: "inv_iepf", title: "IEPF claims" },
      ],
      listButton: "View Services",
    });
  }

  const details: Record<string, { ctx: string; detail: string; q: string }> = {
    trading_foundational: { ctx: "Foundational", detail: "You selected: Foundational ✅\nThis course covers basics of market, terminology, basics of charts & Introduction to technical analysis", q: "Want the full syllabus?" },
    trading_practitioner: { ctx: "Foundation Practitioner", detail: "You selected: Foundation Practitioner ✅\nThis course covers types of charts, market psychology, dow theory, price action & technical indicators.", q: "Want the full syllabus?" },
    trading_advanced: { ctx: "Advanced", detail: "You selected: Advanced ✅\nThis course covers stock screening, multi-timeframe (MTF) analysis, intraday and swing trading, and building an integrated trading system combining all these techniques.", q: "Want the full syllabus?" },
    trading_onetoone: { ctx: "One-to-one", detail: "You selected: One-to-one ✅\nThis is personal mentoring with our mentor, 1-on-1 sessions.", q: "Want to book a free counselling call?" },
    inv_demat: { ctx: "Demat and trading account", detail: "You selected: Demat and trading account ✅\nWe help you open your Demat + Trading account in 15 mins, fully online.", q: "Want to open your account?" },
    inv_mutual: { ctx: "Mutual funds", detail: "You selected: Mutual funds ✅\nWe help you choose the right Mutual Funds based on your goal.", q: "Want a free portfolio check?" },
    inv_insurance: { ctx: "Life and healthcare insurance", detail: "You selected: Life and healthcare insurance ✅\nWe help you choose the right Term + Health insurance, no mis-selling.", q: "Want a free insurance check?" },
    inv_physical: { ctx: "Physical share services", detail: "You selected: Physical share services ✅\nWe help you convert physical shares into Demat form and facilitate the transmission of shares in the event of a physical shareholder’s demise.", q: "Want to check your shares?" },
    inv_iepf: { ctx: "IEPF claims", detail: "You selected: IEPF claims ✅\nWe help you recover your unclaimed shares / dividends from IEPF.", q: "Want to check your claim?" },
  };

  if (details[lower]) {
    s.context = details[lower].ctx;
    s.stage = "yesno";
    return Response.json({ text: details[lower].detail + "\n\n" + details[lower].q, buttons: [{ id: "yes_btn", title: "✅ Yes" }, { id: "no_btn", title: "❌ No" }] });
  }

  if (lower === "demo") {
    s.context = "Free Demo";
    s.stage = "ask_name";
    return Response.json({ text: "Awesome! You selected Free Demo 🎓\nPlease share your Name to book your slot.", showInput: true });
  }

  if (lower === "yes_btn") {
    s.stage = "ask_name";
    return Response.json({ text: "Perfect! To proceed, please share your Name.", showInput: true });
  }

  if (lower === "no_btn") {
    s.stage = "done";
    const t = s.lang === "hi" ? "कोई बात नहीं! 🙏\nजब भी तैयार हों, फिर से Hi भेजें।\nwww.mechwealth.com" : s.lang === "kn" ? "ಪರವಾಗಿಲ್ಲ! 🙏\nನೀವು ಸಿದ್ಧರಾದಾಗ ಮತ್ತೆ Hi ಕಳುಹಿಸಿ.\nwww.mechwealth.com" : "No problem! 🙏\nWhenever you're ready, just send Hi again.\nwww.mechwealth.com";
    return Response.json({ text: t, buttons: [{ id: "__start__", title: "Start Again" }] });
  }

  if (s.stage === "ask_name" && msg.length >= 2) {
    s.stage = "done";
    notifyOwner(msg, s.context);
    const thanks = s.lang === "hi" ? `धन्यवाद, ${msg}! 🙏\n${s.context} के लिए आपका अनुरोध बुक हो गया है। हमारी टीम आपको कॉल करेगी।\nऔर जानें: www.mechwealth.com` : s.lang === "kn" ? `ಧನ್ಯವಾದಗಳು, ${msg}! 🙏\n${s.context} ಗಾಗಿ ನಿಮ್ಮ ವಿನಂತಿ ಬುಕ್ ಆಗಿದೆ. ನಮ್ಮ ತಂಡವು ನಿಮಗೆ ಕರೆ ಮಾಡುತ್ತದೆ.\nಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ: www.mechwealth.com` : `Thank you, ${msg}! 🙏\nYour request for ${s.context} is booked. Our team will call you.\nLearn more here: www.mechwealth.com`;
    return Response.json({ text: thanks });
  }

  const m = menuText(s.lang);
  return Response.json({ text: m.body, buttons: [{ id: "trading", title: m.b1 }, { id: "investment", title: m.b2 }, { id: "demo", title: m.b3 }] });
}
