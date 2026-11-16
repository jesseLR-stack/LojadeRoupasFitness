// Login do painel de administração.
// A senha fica na variável ADMIN_PASSWORD (configurada na Vercel). A sessão é um cookie
// assinado (HMAC) que expira em 12 horas. Funciona no middleware (Edge) e no servidor Node.

export const SESSION_COOKIE = "nf_admin";
export const SESSION_HOURS = 12;
const DEV_PASSWORD = "admin"; // só vale rodando no seu computador (npm run dev)

export function adminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? null : DEV_PASSWORD;
}

const enc = new TextEncoder();
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function hmac(message) {
  const secret = process.env.ADMIN_SESSION_SECRET || adminPassword();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

// Compara em tempo constante (não revela quantas letras acertou).
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkPassword(input) {
  const expected = adminPassword();
  if (!expected) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(String(input))),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  return safeEqual(toHex(a), toHex(b));
}

export async function createSessionToken(now = Date.now()) {
  const expires = now + SESSION_HOURS * 3600 * 1000;
  return `${expires}.${await hmac(String(expires))}`;
}

export async function verifySessionToken(token, now = Date.now()) {
  if (!token || !adminPassword()) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < now) return false;
  return safeEqual(sig, await hmac(expires));
}
