# US English usage audit

**Status:** UK English changes have been applied (see below).

Audit of the **rt-spaces** codebase for American (US) English spellings and terms.  
UK alternatives are suggested where applicable. Items that are **API/standard** (e.g. CSS/JS property names) are listed but marked as “do not change.”

---

## 1. User-facing copy (recommended to change for UK English)

| Location | Current (US) | Suggested (UK) |
|--------|---------------|-----------------|
| `app/book-online/page.tsx` (line 67) | **"Booking Canceled"** | **"Booking Cancelled"** |
| `components/StudioSections.tsx` (line 1201) | **"For urgent inquiries"** | **"For urgent enquiries"** (matches "enquiry" used elsewhere in the app) |

**Note:** The rest of the app uses UK **"enquiry"** (e.g. BookingForm: "Send enquiry", "Free enquiry", "Unable to send enquiry"). Only this line uses US **"inquiries"**.

---

## 2. URL / query parameters (optional to change)

| Location | Current (US) | Notes |
|----------|--------------|--------|
| `app/api/checkout/route.ts` | `canceled=true` in `cancel_url` | Stripe redirect; changing would require updating the book-online page check. |
| `app/book-online/page.tsx` | `searchParams?.canceled === "true"` | Must match checkout `cancel_url` if you change it. |
| `r-t-spaces/app/api/checkout/route.ts` | Same as above | Duplicate in `r-t-spaces/`. |
| `r-t-spaces/app/book-online/page.tsx` | Same as above | Duplicate in `r-t-spaces/`. |

If you standardise on UK spelling, use `cancelled=true` in the URL and in both book-online pages.

---

## 3. Log messages / internal strings (optional)

| Location | Current (US) | Suggested (UK) |
|----------|--------------|-----------------|
| `lib/calendlyApi.ts` (lines 125, 135, 138) | `'Payment failed or canceled'`, `'Calendly event canceled successfully'`, `'Error canceling Calendly event'` | Use **cancelled** / **cancelling** if you want consistency in logs. |
| `r-t-spaces/lib/calendlyApi.ts` | Same as above | Same. |

---

## 4. Documentation (`.md` files)

### 4.1 Root docs (and `r-t-spaces/` copies where present)

| File | US usage | Suggested (UK) |
|------|----------|-----------------|
| `SETUP_GUIDE.md` | "customize pricing" | "customise pricing" |
| `PAYMENT_FIRST_IMPLEMENTATION.md` | "customize email templates", "customize success message" | "customise" |
| `WEBHOOK_SETUP_GUIDE.md` | "authorize the CLI" | "authorise the CLI" |
| `README.md` | "optimize and load" (Next.js doc quote) | Can leave as-is (quoted from Next.js) or paraphrase with "optimise" |
| `AUDIT_REPORT.md` | "optimization" | "optimisation" |
| `PAYMENT_FLOW_IMPROVEMENTS.md` | "canceled", "canceling", "canceled successfully", "Error canceling" | "cancelled", "cancelling" |
| `PAYMENT_FLOW_ANALYSIS.md` | "cancellation" (noun is same in UK) | No change. |
| `CALENDLY_STRIPE_FLOW.md` | "is canceled", "canceled" | "is cancelled", "cancelled" |
| `USER_FLOW_DIAGRAM.md` | `canceled=true` in diagrams | Could use `cancelled=true` for consistency. |
| `r-t-spaces/SETUP_GUIDE.md` | "customize" (e.g. stripe/pricing) | "customise" |
| `r-t-spaces/PAYMENT_FIRST_IMPLEMENTATION.md` | "customize" | "customise" |
| `r-t-spaces/WEBHOOK_SETUP_GUIDE.md` | "authorize" | "authorise" |
| `r-t-spaces/README.md` | "optimize" | As per README above. |
| `r-t-spaces/AUDIT_REPORT.md` | "optimization" | "optimisation" |
| `r-t-spaces/PAYMENT_FLOW_IMPROVEMENTS.md` | "canceled", "canceling" | "cancelled", "cancelling" |
| `r-t-spaces/CALENDLY_STRIPE_FLOW.md` | "canceled" | "cancelled" |
| `r-t-spaces/USER_FLOW_DIAGRAM.md` | `canceled=true` | "cancelled" if desired. |

Other docs (e.g. CODEBASE_AUDIT.md, PAYMENT_WINDOW_SETUP.md) use "cancellation" (same in UK) or "configured" (same in UK); no change needed for US vs UK.

---

## 5. Do not change (API / standard names)

These are standard in web/JS/CSS; changing them would break code or diverge from specs.

| Location | Term | Reason |
|----------|------|--------|
| `app/services/page.tsx` | `behavior: "smooth"` | `Element.scrollIntoView()` option; JS API uses US spelling. |
| `app/globals.css` | `scroll-behavior: smooth` | CSS property name. |
| All CSS / Tailwind | `color`, `background-color`, `text-center`, `items-center`, etc. | CSS and Tailwind use US spelling. |
| `package-lock.json` | e.g. `color-convert`, `supports-color` | Dependency package names. |

No code changes are recommended for these.

---

## 6. Summary

- **User-facing:** 2 clear fixes for UK consistency: **"Booking Canceled" → "Booking Cancelled"** and **"inquiries" → "enquiries"** in `StudioSections.tsx`.
- **Optional:** URL param `canceled` → `cancelled`, log/comment strings, and all documentation spellings above.
- **Leave as-is:** All uses of `behavior`, `color`, `center` (and similar) in CSS, Tailwind, and JavaScript APIs.

**Duplicate folder:** Many of the same files exist under `r-t-spaces/`. If that folder is part of the active project, apply the same edits there for consistency.
