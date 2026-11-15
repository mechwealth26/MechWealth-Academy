export const runtime = "nodejs";
const API_VERSION = "v21.0";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "MechWealth";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

const userLang = new Map<string, "en" | "hi" | "kn">();
const userContext = new Map<string, string>();

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

async function sendYesNo(to: string, question: string) {
  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "button",
        body: { text: question },
        action: { buttons: [
          { type: "reply", reply: { id: "yes_btn", title: "✅ Yes" } },
          { type: "reply", reply: { id: "no_btn", title: "❌ No" } },
        ] },
      },
    }),
  });
}

async function sendLanguageMenu(to: string) {
  await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "button",
        body: { text: "Please choose your language\nकृपया अपनी भाषा चुनें\nದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ" },
        action: { buttons: [
          { type: "reply", reply: { id: "lang_en", title: "English" } },
          { type: "reply", reply: { id: "lang_hi", title: "हिन्दी" } },
          { type: "reply", reply: { id: "lang_kn", title: "ಕನ್ನಡ" } },
        ] },
      },
    }),
  });
}

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
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: { type: "button", body: { text: texts.body }, action: { buttons: [
        { type: "reply", reply: { id: "trading", title: texts.b1 } },
        { type: "reply", reply: { id: "investment", title: texts.b2 } },
        { type: "reply", reply: { id: "demo", title: texts.b3 } },
      ] } },
    }),
  });
}

async function sendTradingList(to: string) {
  console.log("SENDING TRADING LIST TO:", to);
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "list",
        body: { text: "Great! Which Trading Course are you interested in?\nTap to select:" },
        footer: { text: "MechWealth Academy" },
        action: {
          button: "View Courses",
          sections: [{ title: "Trading Courses", rows: [
            { id: "trading_foundational", title: "Foundational" },
            { id: "trading_practitioner", title: "Foundation Practitioner" },
            { id: "trading_advanced", title: "Advanced" },
            { id: "trading_onetoone", title: "One-to-one" },
          ] }]
        },
      },
    }),
  });
  const result = await res.text();
  console.log("TRADING LIST RESULT:", res.status, result);
}

async function sendInvestmentList(to: string) {
  console.log("SENDING INVESTMENT LIST TO:", to);
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "list",
        body: { text: "Great! Which Investment service are you interested in?\nTap to select:" },
        footer: { text: "MechWealth Academy" },
        action: {
          button: "View Services",
          sections: [{ title: "Investment Services", rows: [
            { id: "inv_demat", title: "Demat & Trading Account" },
            { id: "inv_mutual", title: "Mutual funds" },
            { id: "inv_insurance", title: "Life & Health Insurance" },
            { id: "inv_physical", title: "Physical share services" },
            { id: "inv_iepf", title: "IEPF claims" },
          ] }]
        },
      },
    }),
  });
  const result = await res.text();
  console.log("INVESTMENT LIST RESULT:", res.status, result);
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

    if (selection === "lang_en" || selection === "lang_hi" || selection === "lang_kn") {
      const lang = selection === "lang_hi" ? "hi" : selection === "lang_kn" ? "kn" : "en";
      userLang.set(from, lang);
      await sendMainMenu(from, lang);
      return new Response("OK", { status: 200 });
    }

    if (selection === "hi" || selection === "hello" || selection === "hey") {
      await sendLanguageMenu(from);
    } else if (selection === "trading") {
      await sendTradingList(from);
    } else if (selection === "trading_foundational") {
      userContext.set(from, "Foundational");
      await sendText(from, `You selected: Foundational ✅\nThis course covers basics of market, terminology, basics of charts & Introduction to technical analysis`);
      await sendYesNo(from, `Want the full syllabus?`);
    } else if (selection === "trading_practitioner") {
      userContext.set(from, "Foundation Practitioner");
      await sendText(from, `You selected: Foundation Practitioner ✅\nThis course covers types of charts, market psychology, dow theory, price action & technical indicators.`);
      await sendYesNo(from, `Want the full syllabus?`);
    } else if (selection === "trading_advanced") {
      userContext.set(from, "Advanced");
      await sendText(from, `You selected: Advanced ✅\nThis course covers stock screening, multi-timeframe (MTF) analysis, intraday and swing trading, and building an integrated trading system combining all these techniques.`);
      await sendYesNo(from, `Want the full syllabus?`);
    } else if (selection === "trading_onetoone") {
      userContext.set(from, "One-to-one");
      await sendText(from, `You selected: One-to-one ✅\nThis is personal mentoring with our mentor, 1-on-1 sessions.`);
      await sendYesNo(from, `Want to book a free counselling call?`);
    } else if (selection === "investment") {
      await sendInvestmentList(from);
    } else if (selection === "inv_demat") {
      userContext.set(from, "Demat and trading account");
      await sendText(from, `You selected: Demat and trading account ✅\nWe help you open your Demat + Trading account in 15 mins, fully online.`);
      await sendYesNo(from, `Want to open your account?`);
    } else if (selection === "inv_mutual") {
      userContext.set(from, "Mutual funds");
      await sendText(from, `You selected: Mutual funds ✅\nWe help you choose the right Mutual Funds based on your goal.`);
      await sendYesNo(from, `Want a free portfolio check?`);
    } else if (selection === "inv_insurance") {
      userContext.set(from, "Life and healthcare insurance");
      await sendText(from, `You selected: Life and healthcare insurance ✅\nWe help you choose the right Term + Health insurance, no mis-selling.`);
      await sendYesNo(from, `Want a free insurance check?`);
    } else if (selection === "inv_physical") {
      userContext.set(from, "Physical share services");
      await sendText(from, `You selected: Physical share services ✅\nWe help you convert physical shares into Demat form and facilitate the transmission of shares in the event of a physical shareholder’s demise.`);
      await sendYesNo(from, `Want to check your shares?`);
    } else if (selection === "inv_iepf") {
      userContext.set(from, "IEPF claims");
      await sendText(from, `You selected: IEPF claims ✅\nWe help you recover your unclaimed shares / dividends from IEPF.`);
      await sendYesNo(from, `Want to check your claim?`);
    } else if (selection === "demo") {
      userContext.set(from, "Free Demo");
      await sendText(from, `Awesome! You selected Free Demo 🎓\nWe have your number auto-saved.\nPlease share your Name to book your slot.`);
    } else if (selection === "yes_btn") {
      await sendText(from, `Perfect! To proceed, please share your Name.`);
    } else if (selection === "no_btn") {
      const lang = userLang.get(from) || "en";
      await sendText(from, lang === "hi" ? `कोई बात नहीं! 🙏\nजब भी तैयार हों, फिर से Hi भेजें।\nwww.mechwealth.com` : lang === "kn" ? `ಪರವಾಗಿಲ್ಲ! 🙏\nನೀವು ಸಿದ್ಧರಾದಾಗ ಮತ್ತೆ Hi ಕಳುಹಿಸಿ.\nwww.mechwealth.com` : `No problem! 🙏\nWhenever you're ready, just send Hi again.\nwww.mechwealth.com`);
    } else if (rawText && rawText.length >= 2 && !message.interactive) {
      const lang = userLang.get(from) || "en";
      const context = userContext.get(from) || "Free Demo";
      const thanks = lang === "hi" ? `धन्यवाद, ${rawText}! 🙏\n${context} के लिए आपका अनुरोध बुक हो गया है। हमारी टीम आपको इसी WhatsApp नंबर पर कॉल करेगी।\nऔर जानें: www.mechwealth.com` : lang === "kn" ? `ಧನ್ಯವಾದಗಳು, ${rawText}! 🙏\n${context} ಗಾಗಿ ನಿಮ್ಮ ವಿನಂತಿ ಬುಕ್ ಆಗಿದೆ. ನಮ್ಮ ತಂಡವು ಇದೇ WhatsApp ಸಂಖ್ಯೆಯಲ್ಲಿ ನಿಮಗೆ ಕರೆ ಮಾಡುತ್ತದೆ.\nಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ: www.mechwealth.com` : `Thank you, ${rawText}! 🙏\nYour request for ${context} is booked. Our team will call you on this same WhatsApp number.\nLearn more here: www.mechwealth.com`;
      await sendText(from, thanks);
    } else {
      await sendLanguageMenu(from);
    }
  } catch (e) {
    console.error("WEBHOOK ERROR:", e);
  }
  return new Response("OK", { status: 200 });
}
