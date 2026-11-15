import { COURSE_STAGES } from "@/data/courses";

export const runtime = "nodejs";
const API_VERSION = "v21.0";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "MechWealth";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// Store language per user: phone -> en | hi | kn
const userLang = new Map<string, "en" | "hi" | "kn">();

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

async function sendText(to: string, text: string) {
  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
  });
}

// 1. LANGUAGE SELECTION - NEW FIRST STEP
async function sendLanguageMenu(to: string) {
  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "Please choose your language\nकृपया अपनी भाषा चुनें\nದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ" },
        action: {
          buttons: [
            { type: "reply", reply: { id: "lang_en", title: "English" } },
            { type: "reply", reply: { id: "lang_hi", title: "हिन्दी" } },
            { type: "reply", reply: { id: "lang_kn", title: "ಕನ್ನಡ" } },
          ],
        },
      },
    }),
  });
}

// 2. MAIN MENU IN USER'S LANGUAGE
async function sendMainMenu(to: string, lang: "en" | "hi" | "kn") {
  const texts = {
    en: { body: "Hi! Welcome to MechWealth 👋\n\nWhat do you want to learn?", b1: "Trading Course", b2: "Investment", b3: "Free Demo" },
    hi: { body: "नमस्ते! MechWealth में आपका स्वागत है 👋\n\nआप क्या सीखना चाहते हैं?", b1: "ट्रेडिंग कोर्स", b2: "निवेश", b3: "फ्री डेमो" },
    kn: { body: "ಹಾಯ್! MechWealth ಗೆ ಸುಸ್ವಾಗತ 👋\n\nನೀವು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?", b1: "ಟ್ರೇಡಿಂಗ್ ಕೋರ್ಸ್", b2: "ಹೂಡಿಕೆ", b3: "ಉಚಿತ ಡೆಮೊ" },
  }[lang];

  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: texts.body },
        action: {
          buttons: [
            { type: "reply", reply: { id: "trading", title: texts.b1 } },
            { type: "reply", reply: { id: "investment", title: texts.b2 } },
            { type: "reply", reply: { id: "demo", title: texts.b3 } },
          ],
        },
      },
    }),
  });
}

// Trading / Investment Lists - Same as before, in English for details
async function sendTradingList(to: string) {
  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "list",
        body: { text: "Great! Which Trading Course are you interested in?\nTap to select:" },
        footer: { text: "MechWealth Academy" },
        action: { button: "View Trading Courses", sections: [{ title: "Trading Courses", rows: [
          { id: "trading_foundational", title: "Foundational" },
          { id: "trading_practitioner", title: "Foundation Practitioner" },
          { id: "trading_advanced", title: "Advanced" },
          { id: "trading_onetoone", title: "One-to-one" },
        ] }] },
      },
    }),
  });
}

async function sendInvestmentList(to: string) {
  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "【entity-whatsapp¦canonical_name=WhatsApp】", to, type: "interactive",
      interactive: {
        type: "list",
        body: { text: "Great! Which Investment service are you interested in?\nTap to select:" },
        footer: { text: "MechWealth Academy" },
        action: { button: "View Investment Services", sections: [{ title: "Investment Services", rows: [
          { id: "inv_demat", title: "Demat & Trading Account" },
          { id: "inv_mutual", title: "Mutual funds" },
          { id: "inv_insurance", title: "Life & Health Insurance" },
          { id: "inv_physical", title: "Physical share services" },
          { id: "inv_iepf", title: "IEPF claims" },
        ] }] },
      },
    }),
  });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  console.log("WEBHOOK RECEIVED RAW:", rawBody);
  try {
    const body = JSON.parse(rawBody);
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return new Response("OK", { status: 200 });

    const from = message.from as string;
    const buttonId = message.interactive?.button_reply?.id as string | undefined;
    const listId = message.interactive?.list_reply?.id as string | undefined;
    const rawText = (message.text?.body || "").trim();
    const selection = (buttonId || listId || rawText).toLowerCase().trim();

    // --- LANGUAGE SELECTION ---
    if (selection === "lang_en" || selection === "lang_hi" || selection === "lang_kn") {
      const lang = selection === "lang_hi" ? "hi" : selection === "lang_kn" ? "kn" : "en";
      userLang.set(from, lang);
      console.log("LANGUAGE SET:", from, lang);
      await sendMainMenu(from, lang);
      return new Response("OK", { status: 200 });
    }

    const lang = userLang.get(from) || "en";

    // --- HI = ASK LANGUAGE FIRST ---
    if (selection === "hi" || selection === "hello" || selection === "hey") {
      await sendLanguageMenu(from);
    } else if (selection === "trading") {
      await sendTradingList(from);
    } else if (selection === "trading_foundational") {
      await sendText(from, `You selected: Foundational ✅\nThis course covers basics of market, terminology, basics of charts & Introduction to technical analysis\nWant the full syllabus? Reply YES`);
    } else if (selection === "trading_practitioner") {
      await sendText(from, `You selected: Foundation Practitioner ✅\nThis course covers types of charts, market psychology, dow theory, price action & technical indicators.\nWant the full syllabus? Reply YES`);
    } else if (selection === "trading_advanced") {
      await sendText(from, `You selected: Advanced ✅\nThis course covers stock screening, multi-timeframe (MTF) analysis, intraday and swing trading, and building an integrated trading system combining all these techniques.\nWant the full syllabus? Reply YES`);
    } else if (selection === "trading_onetoone") {
      await sendText(from, `You selected: One-to-one ✅\nThis is personal mentoring with our mentor, 1-on-1 sessions.\nWant to book a free counselling call? Reply YES`);
    } else if (selection === "investment") {
      await sendInvestmentList(from);
    } else if (selection === "inv_demat") {
      await sendText(from, `You selected: Demat and trading account ✅\nWe help you open your Demat + Trading account in 15 mins, fully online.\nWant to open your account? Reply YES`);
    } else if (selection === "inv_mutual") {
      await sendText(from, `You selected: Mutual funds ✅\nWe help you choose the right Mutual Funds based on your goal.\nWant a free portfolio check? Reply YES`);
    } else if (selection === "inv_insurance") {
      await sendText(from, `You selected: Life and healthcare insurance ✅\nWe help you choose the right Term + Health insurance, no mis-selling.\nWant a free insurance check? Reply YES`);
    } else if (selection === "inv_physical") {
      await sendText(from, `You selected: Physical share services ✅\nWe help you convert physical shares into Demat form and facilitate the transmission of shares in the event of a physical shareholder’s demise.\nWant to check your shares? Reply YES`);
    } else if (selection === "inv_iepf") {
      await sendText(from, `You selected: IEPF claims ✅\nWe help you recover your unclaimed shares / dividends from IEPF.\nWant to check your claim? Reply YES`);
    } else if (selection === "demo") {
      await sendText(from, `Awesome! You selected Free Demo 🎓\nWe have your number auto-saved.\nPlease share your Name to book your slot.`);
    } else if (selection === "yes") {
      const thanks = lang === "hi" ? `धन्यवाद! 🙏\nआपका अनुरोध नोट कर लिया गया है। हमारी टीम आपको इसी WhatsApp नंबर पर संपर्क करेगी: ${from}\n\nऔर जानें: www.mechwealth.com` : lang === "kn" ? `ಧನ್ಯವಾದಗಳು! 🙏\nನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ. ನಮ್ಮ ತಂಡವು ಇದೇ WhatsApp ಸಂಖ್ಯೆಯಲ್ಲಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ: ${from}\n\nಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ: www.mechwealth.com` : `Thank you! 🙏\nYour request is noted. Our team will contact you on this same WhatsApp number: ${from}\n\nLearn more here: www.mechwealth.com`;
      await sendText(from, thanks);
    } else if (rawText && rawText.length >= 2 && !message.interactive) {
      // Name capture
      const thanks = lang === "hi" ? `धन्यवाद, ${rawText}! 🙏\nआपका Free Demo बुक हो गया है। हमारी टीम आपको इसी WhatsApp नंबर पर कॉल करेगी।\nऔर जानें: www.mechwealth.com` : lang === "kn" ? `ಧನ್ಯವಾದಗಳು, ${rawText}! 🙏\nನಿಮ್ಮ ಉಚಿತ ಡೆಮೊ ಬುಕ್ ಆಗಿದೆ. ನಮ್ಮ ತಂಡವು ಇದೇ WhatsApp ಸಂಖ್ಯೆಯಲ್ಲಿ ನಿಮಗೆ ಕರೆ ಮಾಡುತ್ತದೆ.\nಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ: www.mechwealth.com` : `Thank you, ${rawText}! 🙏\nYour Free Demo is booked. Our team will call you on this same WhatsApp number.\nLearn more here: www.mechwealth.com`;
      await sendText(from, thanks);
    } else {
      await sendLanguageMenu(from);
    }
  } catch (e) {
    console.error("WEBHOOK ERROR:", e);
  }
  return new Response("OK", { status: 200 });
}
