"use client";

import { useState } from "react";
import Link from "next/link";

export function InfoPopup() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const location = "Unit 3E, 736-740 Romford Road, London E12 6BT";
  const phone = "07944667000";
  const email = "enquires@rtspaces.co.uk";

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[var(--base)] border-t-2 border-[var(--accent)]/20 transition-all duration-300 ${
        isExpanded ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full min-h-[44px] px-6 py-4 flex items-center justify-between bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 transition-colors active:opacity-70"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Hide contact information" : "Show contact information"}
      >
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
          Quick Contact Info
        </span>
        <svg
          className={`h-5 w-5 text-[var(--accent)] transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 py-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Location */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]/60">
                Location
              </p>
              <p className="text-sm text-[var(--accent)]">{location}</p>
              <button
                onClick={() => copyToClipboard(location, "location")}
                className="min-w-[44px] min-h-[44px] px-3 py-2 text-xs text-[var(--primary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 active:opacity-70"
              >
                {copiedField === "location" ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]/60">
                Phone
              </p>
              <a
                href={`tel:${phone}`}
                className="text-sm text-[var(--accent)] hover:text-[var(--primary)] transition-colors block"
              >
                {phone}
              </a>
              <button
                onClick={() => copyToClipboard(phone, "phone")}
                className="min-w-[44px] min-h-[44px] px-3 py-2 text-xs text-[var(--primary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 active:opacity-70"
              >
                {copiedField === "phone" ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]/60">
                Email
              </p>
              <a
                href={`mailto:${email}`}
                className="text-sm text-[var(--accent)] hover:text-[var(--primary)] transition-colors block"
              >
                {email}
              </a>
              <button
                onClick={() => copyToClipboard(email, "email")}
                className="min-w-[44px] min-h-[44px] px-3 py-2 text-xs text-[var(--primary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 active:opacity-70"
              >
                {copiedField === "email" ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--accent)]/10">
            <Link
              href="/#contact"
              className="btn-primary btn-small"
            >
              Book Online
            </Link>
            <Link
              href="/#contact"
              className="btn-secondary btn-small"
            >
              Contact Us
            </Link>
            <Link
              href="/studio"
              className="btn-secondary btn-small"
            >
              View Studios
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

