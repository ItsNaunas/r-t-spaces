/**
 * Cal.com setup — configuration as code.
 *
 * Creates (or updates) the studio's availability schedule, one event type per
 * booking package, and the booking webhook, deriving everything from
 * lib/pricing.ts so Cal.com and the site can never drift apart.
 *
 * Usage:
 *   node scripts/setup-calcom.ts             # dry run, prints the plan, writes nothing
 *   node scripts/setup-calcom.ts --apply     # actually create/update
 *   --only=offer-half-day,offer-full-day     # limit to these event types
 *   --skip-webhook                           # leave the webhook alone
 *
 * Requires CAL_API_KEY in the environment (from .env.local or the shell).
 * The key is never printed, logged, or written to disk by this script.
 *
 * Node 22.18+/24 runs this directly via native TypeScript type stripping.
 */

import { BOOKING_PACKAGES, type BookingPackage } from "../lib/pricing.ts";

// ─── Config ──────────────────────────────────────────────────────────────────

const API = "https://api.cal.com/v2";

/** Cal.com versions each endpoint group separately. These are not interchangeable. */
const V_EVENT_TYPES = "2026-06-12";
const V_SCHEDULES = "2024-06-11";

/** From the site: "We are open daily from 8 AM to 11 PM." (app/faq/page.tsx) */
const OPENING = { start: "08:00", end: "23:00" };
const TIMEZONE = "Europe/London";
const SCHEDULE_NAME = "Studio opening hours";

/** Minutes of turnover between sessions. Studio reset, not bookable. */
const AFTER_EVENT_BUFFER = 15;

/** Hours of notice required before a booking can start. */
const MINIMUM_BOOKING_NOTICE = 120;

/** How far ahead people can book, in business days. */
const BOOKING_WINDOW_DAYS = 120;

/** Granularity of offered start times, in minutes. */
const SLOT_INTERVAL = 60;

const LOCATION = {
  type: "address" as const,
  address: "Unit 3E, 736-740 Romford Road, London E12 6BT",
  public: true,
};

const WEBHOOK_URL =
  process.env.CAL_WEBHOOK_URL ??
  `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.rtspaces.co.uk"}/api/webhooks/calcom`;

const WEBHOOK_TRIGGERS = [
  "BOOKING_REQUESTED",
  "BOOKING_CREATED",
  "BOOKING_CANCELLED",
  "BOOKING_REJECTED",
  "BOOKING_RESCHEDULED",
];

// ─── Derive event types from the package list ────────────────────────────────

type PlannedEventType = {
  title: string;
  slug: string;
  description: string;
  lengthInMinutes: number;
  lengthInMinutesOptions?: number[];
  packageId: string;
};

/**
 * Hourly-hire packages (priceFromTime) let the booker pick a duration, so the
 * calendar blocks the real amount of room time. Fixed packages have their
 * length baked in — the wizard preselects it and the booker only picks a start.
 *
 * Upper bound on the duration picker is the longest fixed package (Full Day),
 * so nobody can book past closing.
 */
const MAX_HOURS = Math.max(...BOOKING_PACKAGES.map((p) => p.hours));

function planEventType(pkg: BookingPackage): PlannedEventType {
  const base = {
    title: pkg.title,
    slug: pkg.id,
    description: [pkg.duration, pkg.bestFor ? `Best for ${pkg.bestFor}.` : ""]
      .filter(Boolean)
      .join(" "),
    packageId: pkg.id,
  };

  if (pkg.priceFromTime) {
    const min = pkg.minimumHours ?? 2;
    const options = [];
    for (let h = min; h <= MAX_HOURS; h++) options.push(h * 60);
    return { ...base, lengthInMinutes: min * 60, lengthInMinutesOptions: options };
  }

  return { ...base, lengthInMinutes: pkg.hours * 60 };
}

// ─── API plumbing ────────────────────────────────────────────────────────────

function apiKey(): string {
  const key = process.env.CAL_API_KEY;
  if (!key) {
    console.error(
      "CAL_API_KEY is not set.\n" +
        "Add it to .env.local (it is gitignored) or export it in your shell.\n" +
        "The value stays in Bitwarden; nothing here writes it to disk."
    );
    process.exit(1);
  }
  return key;
}

/**
 * `version` is the cal-api-version header. Pass null for endpoint groups that
 * are not versioned (webhooks, calendars) — sending one there is not just
 * redundant, it can be rejected.
 */
async function call(
  method: string,
  path: string,
  version: string | null,
  body?: unknown
): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      ...(version ? { "cal-api-version": version } : {}),
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    // Deliberately does not echo the request headers, so the key cannot leak
    // into logs or a terminal transcript.
    throw new Error(
      `${method} ${path} -> ${res.status}\n${JSON.stringify(json, null, 2).slice(0, 1200)}`
    );
  }
  return json;
}

// ─── Steps ───────────────────────────────────────────────────────────────────

async function ensureSchedule(apply: boolean): Promise<number | null> {
  const existing = await call("GET", "/schedules", V_SCHEDULES);
  const match = (existing.data ?? []).find((s: any) => s.name === SCHEDULE_NAME);

  if (match) {
    console.log(`  schedule "${SCHEDULE_NAME}" exists (id ${match.id})`);
    return match.id;
  }

  console.log(
    `  + schedule "${SCHEDULE_NAME}": daily ${OPENING.start}-${OPENING.end} ${TIMEZONE}`
  );
  if (!apply) return null;

  const created = await call("POST", "/schedules", V_SCHEDULES, {
    name: SCHEDULE_NAME,
    timeZone: TIMEZONE,
    isDefault: true,
    availability: [
      {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        startTime: OPENING.start,
        endTime: OPENING.end,
      },
    ],
  });
  return created.data?.id ?? null;
}

async function ensureEventTypes(scheduleId: number | null, apply: boolean) {
  const existing = await call("GET", "/event-types", V_EVENT_TYPES);
  const bySlug = new Map<string, any>(
    (existing.data ?? []).map((e: any) => [e.slug, e])
  );

  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;

  for (const pkg of BOOKING_PACKAGES) {
    if (only && !only.has(pkg.id)) continue;
    const plan = planEventType(pkg);
    const durations = plan.lengthInMinutesOptions
      ? `${plan.lengthInMinutesOptions.length} options, ${plan.lengthInMinutesOptions[0] / 60}-${
          plan.lengthInMinutesOptions.at(-1)! / 60
        }h`
      : `fixed ${plan.lengthInMinutes / 60}h`;

    const payload = {
      title: plan.title,
      slug: plan.slug,
      description: plan.description,
      lengthInMinutes: plan.lengthInMinutes,
      ...(plan.lengthInMinutesOptions
        ? { lengthInMinutesOptions: plan.lengthInMinutesOptions }
        : {}),
      slotInterval: SLOT_INTERVAL,
      afterEventBuffer: AFTER_EVENT_BUFFER,
      minimumBookingNotice: MINIMUM_BOOKING_NOTICE,
      // Cal.com caps rolling windows at 61 days, so this is a plain 120-business-day window.
      bookingWindow: { type: "businessDays", value: BOOKING_WINDOW_DAYS, rolling: false },
      locations: [LOCATION],
      // The hold: a new booking sits pending until the Stripe webhook confirms
      // it. Unpaid ones are cancelled by the expiry job, so the slot is never
      // blocked by someone who did not pay.
      confirmationPolicy: { type: "always", blockUnconfirmedBookingsInBooker: true },
      // Special offer event types are only sold through the website while the
      // offer runs, so keep them off the public Cal.com profile page.
      hidden: Boolean(pkg.promoOnly),
      ...(scheduleId ? { scheduleId } : {}),
    };

    const found = bySlug.get(plan.slug);
    if (found) {
      console.log(`  ~ ${plan.slug.padEnd(22)} update (${durations})`);
      if (apply) await call("PATCH", `/event-types/${found.id}`, V_EVENT_TYPES, payload);
    } else {
      console.log(`  + ${plan.slug.padEnd(22)} create (${durations})`);
      if (apply) await call("POST", "/event-types", V_EVENT_TYPES, payload);
    }
  }
}

async function ensureWebhook(apply: boolean) {
  if (process.argv.includes("--skip-webhook")) {
    console.log("  webhook skipped (--skip-webhook)");
    return;
  }
  if (/localhost|127\.0\.0\.1/.test(WEBHOOK_URL)) {
    console.log(
      `  ! webhook skipped: ${WEBHOOK_URL} is not reachable by Cal.com.\n` +
        "    Set CAL_WEBHOOK_URL to the deployed site before creating it."
    );
    return;
  }
  const existing = await call("GET", "/webhooks", null);
  const match = (existing.data ?? []).find((w: any) => w.subscriberUrl === WEBHOOK_URL);

  if (match) {
    console.log(`  webhook -> ${WEBHOOK_URL} exists (id ${match.id})`);
    return;
  }

  console.log(`  + webhook -> ${WEBHOOK_URL}`);
  console.log(`    triggers: ${WEBHOOK_TRIGGERS.join(", ")}`);
  if (!apply) return;

  await call("POST", "/webhooks", null, {
    subscriberUrl: WEBHOOK_URL,
    triggers: WEBHOOK_TRIGGERS,
    active: true,
  });
}

async function googleCalendarConnectUrl() {
  try {
    const res = await call("GET", "/calendars/google/connect", null);
    const url = res.data?.authUrl ?? res.authUrl;
    if (url) {
      // Never print this link: Cal.com embeds the API key in its `state`
      // parameter, so printing it leaks the secret into logs and transcripts.
      console.log(
        "\nIf the studio Google Calendar is not connected yet, connect it in Cal.com:\n" +
          "  Settings -> Calendars -> Add calendar -> Google Calendar"
      );
    }
  } catch {
    console.log(
      "\nCould not fetch the Google Calendar connect URL. Connect it in Cal.com settings instead."
    );
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const apply = process.argv.includes("--apply");

console.log(
  apply
    ? "Applying Cal.com setup.\n"
    : "Dry run. Nothing will be written. Re-run with --apply to commit.\n"
);

const scheduleId = await ensureSchedule(apply);
await ensureEventTypes(scheduleId, apply);
await ensureWebhook(apply);

if (!apply) {
  console.log("\nDry run complete. Re-run with --apply to create the above.");
} else {
  await googleCalendarConnectUrl();
  console.log("\nDone.");
}
