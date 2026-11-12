/**
 * In-memory stand-in for the slice of @upstash/redis this app uses. Like
 * Upstash, values written as JSON strings come back parsed.
 */
export function createFakeRedis() {
  const kv = new Map<string, unknown>();
  const lists = new Map<string, unknown[]>();
  const sets = new Map<string, Set<string>>();
  const zsets = new Map<string, Map<string, number>>();
  /** Keys whose next `get` should throw once (simulates a Redis blip). */
  const failOnce = new Set<string>();

  const decode = (v: unknown) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  };

  const api = {
    kv,
    lists,
    failOnce,
    async get(key: string) {
      if (failOnce.delete(key)) throw new Error(`simulated Redis failure on ${key}`);
      return kv.has(key) ? structuredClone(kv.get(key)) : null;
    },
    async set(key: string, value: unknown, opts?: { nx?: boolean; ex?: number }) {
      if (opts?.nx && kv.has(key)) return null;
      kv.set(key, decode(value));
      return "OK";
    },
    async setnx(key: string, value: unknown) {
      if (kv.has(key)) return 0;
      kv.set(key, decode(value));
      return 1;
    },
    async del(key: string) {
      return kv.delete(key) ? 1 : 0;
    },
    async incr(key: string) {
      const n = Number(kv.get(key) ?? 0) + 1;
      kv.set(key, n);
      return n;
    },
    async incrby(key: string, by: number) {
      const n = Number(kv.get(key) ?? 0) + by;
      kv.set(key, n);
      return n;
    },
    async decrby(key: string, by: number) {
      const n = Number(kv.get(key) ?? 0) - by;
      kv.set(key, n);
      return n;
    },
    async expire() {
      return 1;
    },
    async rpush(key: string, ...values: unknown[]) {
      const list = lists.get(key) ?? [];
      list.push(...values.map(decode));
      lists.set(key, list);
      return list.length;
    },
    async lpush(key: string, ...values: unknown[]) {
      const list = lists.get(key) ?? [];
      list.unshift(...values.map(decode).reverse());
      lists.set(key, list);
      return list.length;
    },
    async ltrim(key: string, start: number, stop: number) {
      const list = lists.get(key) ?? [];
      lists.set(key, list.slice(start, stop + 1));
      return "OK";
    },
    async lrange(key: string, start = 0, stop = -1) {
      const list = lists.get(key) ?? [];
      return structuredClone(list.slice(start, stop === -1 ? undefined : stop + 1));
    },
    async sadd(key: string, ...members: string[]) {
      const s = sets.get(key) ?? new Set<string>();
      members.forEach((m) => s.add(m));
      sets.set(key, s);
      return members.length;
    },
    async srem(key: string, ...members: string[]) {
      members.forEach((m) => sets.get(key)?.delete(m));
      return members.length;
    },
    async smembers(key: string) {
      return [...(sets.get(key) ?? [])];
    },
    async zadd(key: string, entry: { score: number; member: string }) {
      const z = zsets.get(key) ?? new Map<string, number>();
      z.set(entry.member, entry.score);
      zsets.set(key, z);
      return 1;
    },
    async zrem(key: string, member: string) {
      return zsets.get(key)?.delete(member) ? 1 : 0;
    },
    /** Only the byScore form, which is all the app uses. */
    async zrange(key: string, min: number, max: number) {
      return [...(zsets.get(key) ?? new Map<string, number>())]
        .filter(([, score]) => score >= min && score <= max)
        .sort((a, b) => a[1] - b[1])
        .map(([member]) => member);
    },
    pipeline() {
      const ops: [string, unknown[]][] = [];
      const p: Record<string, unknown> = new Proxy(
        {},
        {
          get: (_t, name: string) =>
            name === "exec"
              ? async () => {
                  const out = [];
                  for (const [op, args] of ops) {
                    out.push(await (api as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[op](...args));
                  }
                  return out;
                }
              : (...args: unknown[]) => {
                  ops.push([name, args]);
                  return p;
                },
        }
      );
      return p;
    },
  };
  return api;
}

export type FakeRedis = ReturnType<typeof createFakeRedis>;
