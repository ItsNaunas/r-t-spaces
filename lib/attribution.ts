/**
 * Where a customer came from (Instagram, TikTok, Google, ...).
 *
 * The studio's links carry ?utm_source=instagram (and optionally
 * &utm_campaign=student-offer). Untagged visits fall back to the referring
 * site, or "direct". AttributionCapture saves the result in a first-party
 * cookie on the visitor's first page; checkout copies it into the Stripe
 * session's metadata, and /admin/bookings shows it per booking.
 *
 * Rules: a tagged link beats a guess from the referrer, otherwise the first
 * visit wins (someone who found us on TikTok and books a week later by typing
 * the address still counts as TikTok). The cookie lasts 30 days.
 */

export const ATTRIBUTION_COOKIE = "rt_src";
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 30;

export type Attribution = {
  source: string;
  campaign: string;
  /** True when it came from a utm_source tag rather than the referrer. */
  tagged: boolean;
};

/** Short names people might type in a link, mapped to one spelling. */
const ALIASES: Record<string, string> = {
  ig: "instagram",
  insta: "instagram",
  tt: "tiktok",
  fb: "facebook",
  twitter: "x",
  wa: "whatsapp",
};

/** Referring sites, by domain suffix. Anything else shows as its domain. */
const REFERRERS: [string, string][] = [
  ["instagram.com", "instagram"],
  ["tiktok.com", "tiktok"],
  ["facebook.com", "facebook"],
  ["fb.com", "facebook"],
  ["messenger.com", "facebook"],
  ["t.co", "x"],
  ["x.com", "x"],
  ["twitter.com", "x"],
  ["wa.me", "whatsapp"],
  ["whatsapp.com", "whatsapp"],
  ["linkedin.com", "linkedin"],
  ["lnkd.in", "linkedin"],
  ["youtube.com", "youtube"],
  ["pinterest.com", "pinterest"],
  ["pinterest.co.uk", "pinterest"],
  ["snapchat.com", "snapchat"],
  ["bing.com", "bing"],
  ["duckduckgo.com", "duckduckgo"],
  ["yahoo.com", "yahoo"],
];

/** Our own site and the services we send people through and back from. */
const IGNORED = ["rtspaces.co.uk", "stripe.com", "cal.com", "vercel.app", "localhost"];

const matches = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

/** Lowercase, a-z 0-9 . _ - only, at most 40 characters. Empty if nothing usable. */
export function cleanLabel(raw: string | null | undefined): string {
  const label = (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s+]+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 40);
  return ALIASES[label] ?? label;
}

/**
 * The source for a referrer URL: a known network's name, the referring
 * domain, or null when it should not count (our own pages, Stripe, Cal.com).
 * An empty referrer means "direct".
 */
export function sourceFromReferrer(referrer: string | null | undefined): string | null {
  if (!referrer) return "direct";
  let host: string;
  try {
    const url = new URL(referrer);
    // Android apps refer as android-app://com.instagram.android etc.; reversed
    // that reads android.instagram.com, which the domain rules below match.
    host = url.protocol === "android-app:" ? url.host.split(".").reverse().join(".") : url.hostname;
  } catch {
    return "direct";
  }
  host = host.toLowerCase().replace(/^www\./, "");
  if (!host) return "direct";
  if (IGNORED.some((d) => matches(host, d))) return null;
  // google.com, google.co.uk, android-app google apps ...
  if (/(^|\.)google(\.[a-z]+)+$/.test(host) || host === "google") return "google";
  const known = REFERRERS.find(([domain]) => matches(host, domain));
  return known ? known[1] : cleanLabel(host);
}

/** What this page view says about where the visitor came from. */
export function attributionFromVisit(pageUrl: string, referrer: string): Attribution | null {
  let params: URLSearchParams;
  try {
    params = new URL(pageUrl).searchParams;
  } catch {
    params = new URLSearchParams();
  }
  const tag = cleanLabel(params.get("utm_source"));
  if (tag) return { source: tag, campaign: cleanLabel(params.get("utm_campaign")), tagged: true };
  const source = sourceFromReferrer(referrer);
  return source ? { source, campaign: "", tagged: false } : null;
}

/** Keep what we had unless the new visit is tagged and the old one wasn't. */
export function chooseAttribution(existing: Attribution | null, visit: Attribution | null): Attribution | null {
  if (!visit) return existing;
  if (!existing) return visit;
  return visit.tagged && !existing.tagged ? visit : existing;
}

export function encodeAttribution(a: Attribution): string {
  return [a.source, a.campaign, a.tagged ? "1" : "0"].join("|");
}

export function decodeAttribution(value: string | null | undefined): Attribution | null {
  if (!value) return null;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Use as is.
  }
  const [source, campaign = "", tagged = "0"] = decoded.split("|");
  const clean = cleanLabel(source);
  return clean ? { source: clean, campaign: cleanLabel(campaign), tagged: tagged === "1" } : null;
}

/** The attribution cookie from a raw Cookie header. */
export function attributionFromCookieHeader(header: string | null | undefined): Attribution | null {
  const pair = (header ?? "")
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${ATTRIBUTION_COOKIE}=`));
  return decodeAttribution(pair?.slice(ATTRIBUTION_COOKIE.length + 1));
}

/**
 * Fields for a Stripe Checkout session's metadata. A checkout with no cookie
 * (blocked cookies, or a link straight to checkout) is recorded as "unknown".
 */
export function attributionMetadata(request: Request): { source: string; campaign: string } {
  const a = attributionFromCookieHeader(request.headers.get("cookie"));
  return { source: a?.source ?? "unknown", campaign: a?.campaign ?? "" };
}
