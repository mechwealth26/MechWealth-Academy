"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/buttonStyles";
import { COURSE_STAGES } from "@/data/courses";
import { siteConfig } from "@/data/site";
import { trackConversion } from "@/lib/analytics";

const inputClasses =
  "w-full scroll-mt-24 rounded-lg border border-cream-500/80 bg-ink-950 px-4 py-3 text-base text-cream-100 outline-none transition-colors placeholder:text-copy-muted focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30";

function errorId(id: string) {
  return `${id}-error`;
}

function revealAndFocusField(id: string) {
  const field = document.getElementById(id);
  if (!field) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  field.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "center",
    inline: "nearest",
  });
  field.focus({ preventScroll: true });
}

function Field({
  id,
  label,
  type = "text",
  required = true,
  textarea = false,
  autoComplete,
  error,
  maxLength,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  autoComplete?: string;
  error?: string;
  maxLength: number;
}) {
  const invalid = Boolean(error);
  const describedBy = invalid ? errorId(id) : undefined;
  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-cream-100"
      >
        {label}
        <span className="ml-2 font-normal text-copy-muted">({required ? "required" : "optional"})</span>
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          maxLength={maxLength}
          required={required}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={`${inputClasses} resize-y ${
            invalid
              ? "border-bear-500 focus:border-bear-500"
              : ""
          }`}
          placeholder="For example: I’m new to markets. What will I learn in Foundation?"
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          maxLength={maxLength}
          required={required}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoComplete={autoComplete}
          className={`${inputClasses} ${
            invalid
              ? "border-bear-500 focus:border-bear-500"
              : ""
          }`}
        />
      )}
      {invalid && (
        <p
          id={errorId(id)}
          role="alert"
          className="mt-2 text-sm leading-relaxed text-bear-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

type Errors = Partial<Record<"name" | "phone" | "email", string>>;

export default function EnquiryForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const submissionInFlight = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) successRef.current?.focus();
    else if (formError) revealAndFocusField("enquiry-error");
  }, [sent, formError]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestController.current?.abort();
      requestController.current = null;
      submissionInFlight.current = false;
    };
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submissionInFlight.current) return;
    const data = new FormData(e.currentTarget);
    for (const field of ["name", "email", "phone", "message"]) {
      data.set(field, String(data.get(field) ?? "").trim());
    }
    const next: Errors = {};
    if (!data.get("name"))
      next.name = "Please enter your name.";
    if (!data.get("phone"))
      next.phone = "Please enter your phone number so we can contact you.";
    if (data.get("email") && !/^\S+@\S+\.\S+$/.test(String(data.get("email"))))
      next.email = "That email address doesn't look valid.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0];
      revealAndFocusField(first);
      return;
    }
    submissionInFlight.current = true;
    setSending(true);
    const controller = new AbortController();
    requestController.current = controller;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || result.ok !== true) {
        if (mounted.current) setFormError(result.error || "Your message was not sent. Please try again. Your details are still in the form.");
        return;
      }
      if (mounted.current) {
        setSent(true);
        trackConversion("contact_form_submit", { program: String(data.get("program")) });
      }
    } catch {
      if (controller.signal.aborted) return;
      if (mounted.current) {
        setFormError(
          "Your message was not sent. Check your connection and try again. Your details are still in the form."
        );
      }
    } finally {
      requestController.current = null;
      submissionInFlight.current = false;
      if (mounted.current) setSending(false);
    }
  };

  if (sent) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" aria-live="polite"
        className="scroll-mt-24 rounded-lg border border-gold-400/30 bg-gold-400/5 p-6 outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-400">Enquiry received</p>
        <h3 className="mt-4 font-display text-2xl text-cream-100">Thank you for reaching out to MECHWEALTH.</h3>
        <p className="mt-4 leading-7 text-copy-secondary">Your message has been sent. Any reply will use the contact details you provided. You do not need to send the same enquiry again.</p>
        <Link href="/courses" className={`${buttonClasses("secondary", "sm")} mt-6`}>Explore the courses<span aria-hidden>→</span></Link>
      </div>
    );
  }

  return (
    <form aria-label="Send an enquiry" noValidate onSubmit={onSubmit} className="space-y-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          maxLength={120}
          autoComplete="name"
          error={errors.name}
        />
        <Field
          id="phone"
          label="Phone"
          maxLength={40}
          type="tel"
          autoComplete="tel"
          error={errors.phone}
        />
      </div>
      <Field
        id="email"
        label="Email"
        maxLength={254}
        type="email"
        required={false}
        autoComplete="email"
        error={errors.email}
      />
      <div>
        <label htmlFor="program" className="mb-2 block text-sm font-medium text-cream-100">Course you are interested in <span className="ml-2 font-normal text-copy-muted">(optional)</span></label>
        <select id="program" name="program" defaultValue="General Enquiry" aria-describedby="program-help" className={inputClasses}>
          <option value="General Enquiry">Not sure yet / General question</option>
          {COURSE_STAGES.map((course) => <option key={course.num} value={course.title}>{course.title} — {course.level} · {course.tagline}</option>)}
        </select>
        <p id="program-help" className="mt-2 text-sm leading-6 text-copy-muted">You can leave this as “Not sure yet”.</p>
      </div>
      <Field id="message" label="Message" maxLength={3000} required={false} textarea />

      {formError ? (
        <p id="enquiry-error" tabIndex={-1} role="alert" className="scroll-mt-24 rounded-lg border border-bear-500/40 bg-bear-500/10 p-4 text-sm leading-6 text-bear-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bear-500">
          {formError}{" "}
          You can also <a href={`mailto:${siteConfig.contact.email}`} className="underline underline-offset-4">email {siteConfig.contact.email}</a>.
        </p>
      ) : null}

      <p className="text-sm leading-6 text-copy-secondary">
        Your details are used to respond to your enquiry. <Link href="/privacy" className="text-gold-400 underline underline-offset-4">Read the privacy policy</Link>.
      </p>
      <button type="submit" disabled={sending} className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
        <span aria-live="polite">{sending ? "Sending…" : "Send enquiry"}</span>
        {!sending && <span aria-hidden>→</span>}
      </button>
      <p className="text-sm leading-6 text-copy-muted">No investment advice, trading tips or return promises are provided through this form.</p>
    </form>
  );
}
