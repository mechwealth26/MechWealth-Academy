import { siteConfig } from "@/data/site";
import styles from "./WebsiteChat.module.css";

export default function WebsiteChat() {
  return (
    <a
      data-website-chat
      href={`https://wa.me/${siteConfig.contact.telephone.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MECHWEALTH on WhatsApp (opens in a new tab)"
      className={styles.launcher}
      style={{ position: "fixed", bottom: 20, right: 20, zIndex: 55, width: 60, height: 60, borderRadius: "50%", background: "#25D366", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .1 5.4.1 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6a12 12 0 0 0 5.8 1.5h.1c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.6-8.4ZM12.1 21.9a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10 10 0 0 1 2.1 12c0-5.5 4.5-10 10-10a10 10 0 0 1 7.1 2.9 10 10 0 0 1 2.9 7.1c0 5.5-4.5 9.9-10 9.9Zm5.5-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2.1-.4 0-.5L8.8 6.6c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1 1-1 2.5 1.1 2.9 1.3 3.1c.1.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" /></svg>
    </a>
  );
}
