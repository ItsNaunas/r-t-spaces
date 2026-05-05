const COOKIE_NAME = "admin_session";
const TOKEN_TTL_SECONDS = 86400; // 24 hours

function base64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(str: string): ArrayBuffer {
  const binary = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD not set");

  const payload = base64urlEncode(
    new TextEncoder().encode(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS })
    )
  );
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${base64urlEncode(sig)}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_PASSWORD;
    if (!secret) return false;

    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return false;

    const payload = token.slice(0, dotIndex);
    const sigBytes = base64urlDecode(token.slice(dotIndex + 1));

    const key = await getHmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload)
    );
    if (!valid) return false;

    const decoded = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payload))
    ) as { exp: number };
    return decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
