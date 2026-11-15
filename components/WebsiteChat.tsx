"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./WebsiteChat.module.css";

type Msg = { from: "bot" | "user"; text: string; buttons?: { id: string; title: string }[]; list?: { id: string; title: string }[]; listButton?: string };

export default function WebsiteChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showList, setShowList] = useState<{ list: { id: string; title: string }[]; button: string } | null>(null);
  const [sessionId] = useState(() => "web-" + Math.random().toString(36).slice(2, 9));
  const bottomRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const scroller = bottomRef.current?.parentElement;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [messages, open]);

  useEffect(() => { if (open) closeRef.current?.focus({ preventScroll: true }); }, [open]);

  const closeChat = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
  };

  const sendToBot = async (text: string, label = text) => {
    if (text && text !== "__start__") setMessages((p) => [...p, { from: "user", text: label }]);
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
        <button data-website-chat ref={launcherRef} className={styles.launcher} onClick={openChat} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 55, width: 60, height: 60, borderRadius: "50%", background: "#25D366", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }} aria-label="Open website chat"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .1 5.4.1 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6a12 12 0 0 0 5.8 1.5h.1c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.6-8.4ZM12.1 21.9a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10 10 0 0 1 2.1 12c0-5.5 4.5-10 10-10a10 10 0 0 1 7.1 2.9 10 10 0 0 1 2.9 7.1c0 5.5-4.5 9.9-10 9.9Zm5.5-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2.1-.4 0-.5L8.8 6.6c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1 1-1 2.5 1.1 2.9 1.3 3.1c.1.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" /></svg></button>
      )}
      {open && (
        <div data-website-chat className={styles.panel} role="region" aria-label="MECHWEALTH chat" data-lenis-prevent onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); closeChat(); } }} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 55, width: 400, maxWidth: "calc(100vw - 40px)", height: 560, maxHeight: "calc(100dvh - 40px)", background: "#ECE5DD", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          <div className={styles.header} style={{ flexShrink: 0, background: "#075E54", color: "#fff", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700, fontSize: 17 }}>MechWealth Academy</div><div style={{ fontSize: 13, color: "#e0f5ef" }}>Online • Replies instantly</div></div>
            <button ref={closeRef} aria-label="Close chat" onClick={closeChat} style={{ width: 44, height: 44, flexShrink: 0, background: "transparent", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", background: m.from === "user" ? "#DCF8C6" : "#fff", color: "#111827", padding: "10px 14px", borderRadius: 12, maxWidth: "94%", overflowWrap: "anywhere", whiteSpace: "pre-line", fontSize: 16, lineHeight: 1.6 }}>
                {m.text}
                {m.buttons && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>{m.buttons.map((b) => (<button key={b.id} onClick={() => sendToBot(b.id, b.title)} style={{ background: "#fff", border: "1px solid #25D366", color: "#075E54", padding: "8px 12px", minHeight: 44, borderRadius: 20, cursor: "pointer", fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>{b.title}</button>))}</div>}
                {m.list && <button onClick={() => setShowList({ list: m.list!, button: m.listButton || "View" })} style={{ marginTop: 8, background: "#25D366", color: "#073b2b", border: "none", minHeight: 44, fontSize: 15, padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 700 }}>{m.listButton} ▾</button>}
              </div>
            ))}
            {showList && <div style={{ background: "#fff", borderRadius: 12, padding: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>{showList.list.map((item) => (<button key={item.id} onClick={() => sendToBot(item.id, item.title)} style={{ display: "block", width: "100%", textAlign: "left", color: "#111827", background: "transparent", border: "none", borderBottom: "1px solid #eee", padding: "12px 10px", minHeight: 44, cursor: "pointer", fontSize: 16, lineHeight: 1.5 }}>{item.title} →</button>))}</div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (!input.trim()) return; sendToBot(input.trim()); setInput(""); }} style={{ flexShrink: 0, display: "flex", gap: 8, padding: 12, background: "#fff" }}>
            <input aria-label="Message" value={input} onChange={(e) => setInput(e.target.value)} placeholder={showInput ? "Type your Name..." : "Type Hi to start..."} style={{ flex: 1, minWidth: 0, color: "#111827", background: "#fff", border: "1px solid #71817d", borderRadius: 20, padding: "10px 14px", fontSize: 16 }} />
            <button type="submit" aria-label="Send message" style={{ flexShrink: 0, background: "#075E54", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}
