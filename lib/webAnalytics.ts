/**
 * Website traffic for rtspaces.co.uk, read from Vercel Web Analytics (the
 * site already ships @vercel/analytics, which is cookieless, so this counts
 * every visitor). Same approach as the Nelia Rose portal.
 *
 * Project and team ids are identifiers, not secrets. The token is: a Vercel
 * access token in the server-only env rt_spaces_analytics (kept in
 * Bitwarden; VERCEL_ANALYTICS_TOKEN also works). On the Hobby plan the API refuses anything reaching back more
 * than 31 days, so every range here stays inside that.
 */
const API = "https://api.vercel.com/v1/query/web-analytics/visits";
const PROJECT_ID = "prj_QENPKEypNAgE89yhacyUj1GEXbvQ";
const TEAM_ID = "team_Aeo1C0YBm4lJyGwKDiCyz9dC";

/**
 * The studio using the admin portal isn't a visitor. Setting a filter replaces
 * the API's default production-only filter, so production is restated here.
 */
const FILTER = "environment eq 'production' and not startswith(requestPath,'/admin')";

export const HISTORY_DAYS = 30;

export type Totals = { visitors: number; pageviews: number };
export type Row = Totals & { key: string };
export type Point = Totals & { date: string };
export type Dimension = "requestPath" | "referrerHostname" | "country" | "deviceType";

function token() {
  return process.env.rt_spaces_analytics || process.env.VERCEL_ANALYTICS_TOKEN;
}

export function analyticsConfigured() {
  return Boolean(token());
}

async function call<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ projectId: PROJECT_ID, teamId: TEAM_ID, filter: FILTER, ...params });
  const res = await fetch(`${API}/${path}?${qs}`, {
    headers: { Authorization: `Bearer ${token()}` },
    // An hour stale is fine, and keeps API calls low however often the page is opened.
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Vercel analytics ${path} failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { data: T }).data;
}

export function totals(since: Date, until: Date) {
  return call<Totals>("count", { since: since.toISOString(), until: until.toISOString() });
}

/** One point per day in [since, until), with empty days filled in as zero. */
export async function daily(since: Date, until: Date): Promise<Point[]> {
  const rows = await call<(Totals & { timestamp: string })[]>("aggregate", {
    by: "day",
    since: since.toISOString(),
    until: until.toISOString(),
    limit: "100",
  });
  const byDay = new Map(rows.map((r) => [r.timestamp.slice(0, 10), r]));
  const points: Point[] = [];
  for (const d = new Date(since); d < until; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const r = byDay.get(date);
    points.push({ date, visitors: r?.visitors ?? 0, pageviews: r?.pageviews ?? 0 });
  }
  return points;
}

/** Top values for one dimension, without the API's "Others" catch-all row. */
export async function breakdown(by: Dimension, since: Date, until: Date, limit = 8): Promise<Row[]> {
  const rows = await call<(Totals & Record<string, string>)[]>("aggregate", {
    by,
    since: since.toISOString(),
    until: until.toISOString(),
    limit: String(limit),
  });
  return rows
    .filter((r) => r[by] !== "Others")
    .map((r) => ({ key: r[by], visitors: r.visitors, pageviews: r.pageviews }))
    .sort((a, b) => b.visitors - a.visitors);
}

/** Relabel rows, merging any that share a label (l.instagram.com and instagram.com). */
export function labelled(rows: Row[], label: (key: string) => string) {
  const merged = new Map<string, Row & { label: string }>();
  for (const r of rows) {
    const name = label(r.key);
    const prev = merged.get(name);
    if (prev) {
      prev.visitors += r.visitors;
      prev.pageviews += r.pageviews;
    } else {
      merged.set(name, { ...r, label: name });
    }
  }
  return [...merged.values()].sort((a, b) => b.visitors - a.visitors);
}

export function deviceName(type: string) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Other";
}

export function pageName(path: string) {
  if (path === "/") return "Home";
  const last = path.split("/").filter(Boolean).pop() ?? path;
  const words = decodeURIComponent(last).replace(/[-_]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const countryNames = new Intl.DisplayNames(["en-GB"], { type: "region" });

export function countryName(code: string) {
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}
