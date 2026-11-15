"use client";
import { useState, useEffect, useRef } from "react";

type Msg = { from: "bot" | "user"; text: string; buttons?: { id: string; title: string }[]; list?: { id: string; title: string }[]; listButton?: string };

export default function WebsiteChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showList, setShowList] = useState<{ list: { id: string; title: string }[]; button: string } | null>(null);
  const [sessionId] = useState(() => "web-" + Math.random().toString(36).slice(2, 9));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const sendToBot = async (text: string) => {
    if (text) setMessages((p) => [...p, { from: "user", text }]);
    setShowList(null);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, message: text }) });
    const data = await res.json();
    setMessages((p) => [...p, { from: "bot", text: data.text, buttons: data.buttons, list: data.list, listButton: data.listButton }]);
    setShowInput(!!data.showInput);
    if (data.list) setShowList({ list: data.list, button: data.listButton || "View" });
  };

  const openChat = () => {
    setOpen(true);
    if (messages.length === 0) sendToBot("__start__");
  };

  return (
    <>
      {!open && (
        <button onClick={openChat} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, width: 60, height: 60, borderRadius: "50%", background: "#25D366", border: "none", fontSize: 28, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }} aria-label="Chat">💬</button>
      )}
      {open && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, width: 360, maxWidth: "calc(100vw - 40px)", height: 520, maxHeight: "calc(100vh - 40px)", background: "#ECE5DD", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          <div style={{ background: "#075E54", color: "#fff", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700 }}>MechWealth Academy</div><div style={{ fontSize: 12, opacity: 0.85 }}>Online • Replies instantly</div></div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", background: m.from === "user" ? "#DCF8C6" : "#fff", padding: "8px 12px", borderRadius: 12, maxWidth: "85%", whiteSpace: "pre-line", fontSize: 14, lineHeight: 1.45 }}>
                {m.text}
                {m.buttons && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>{m.buttons.map((b) => (<button key={b.id} onClick={() => sendToBot(b.id)} style={{ background: "#fff", border: "1px solid #25D366", color: "#075E54", padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{b.title}</button>))}</div>}
                {m.list && <button onClick={() => setShowList({ list: m.list!, button: m.listButton || "View" })} style={{ marginTop: 8, background: "#25D366", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 700 }}>{m.listButton} ▾</button>}
              </div>
            ))}
            {showList && <div style={{ background: "#fff", borderRadius: 12, padding: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>{showList.list.map((item) => (<button key={item.id} onClick={() => sendToBot(item.id)} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", borderBottom: "1px solid #eee", padding: "10px 8px", cursor: "pointer", fontSize: 14 }}>{item.title} →</button>))}</div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (!input.trim()) return; sendToBot(input.trim()); setInput(""); }} style={{ display: "flex", gap: 8, padding: 10, background: "#fff" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={showInput ? "Type your Name..." : "Type Hi to start..."} style={{ flex: 1, border: "1px solid #ddd", borderRadius: 20, padding: "10px 14px", outline: "none" }} />
            <button type="submit" style={{ background: "#25D366", border: "none", color: "#fff", width: 42, height: 42, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}
