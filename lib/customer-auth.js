// Contas de clientes: senha com hash scrypt e sessão em cookie assinado (HMAC).
// Use só no servidor.
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);
export const CUSTOMER_COOKIE = "nf_cliente";
export const CUSTOMER_SESSION_DAYS = 30;
const KEYLEN = 64;

function secret() {
  const s = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Configure CUSTOMER_SESSION_SECRET ou ADMIN_PASSWORD");
  return "segredo-local-de-desenvolvimento";
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(String(password), salt, KEYLEN);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [alg, salt, hex] = String(stored ?? "").split("$");
  if (alg !== "scrypt" || !salt || !hex) return false;
  const expected = Buffer.from(hex, "hex");
  const actual = await scrypt(String(password), salt, expected.length);
  return timingSafeEqual(actual, expected);
}

const sign = (msg) => createHmac("sha256", secret()).update(`cliente:${msg}`).digest("hex");

export function createCustomerToken(customerId, now = Date.now()) {
  const expires = now + CUSTOMER_SESSION_DAYS * 86400 * 1000;
  const msg = `${customerId}.${expires}`;
  return `${msg}.${sign(msg)}`;
}

// Devolve o id do cliente ou null.
export function readCustomerToken(token, now = Date.now()) {
  const [id, expires, sig] = String(token ?? "").split(".");
  if (!id || !expires || !sig || Number(expires) < now) return null;
  const expected = Buffer.from(sign(`${id}.${expires}`), "hex");
  const got = Buffer.from(sig, "hex");
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  return Number(id);
}

export const normalizeEmail = (e) => String(e ?? "").trim().toLowerCase();

export function validateSignup({ name, email, password }) {
  const errors = {};
  if (String(name ?? "").trim().split(/\s+/).length < 2) errors.name = "Informe nome e sobrenome";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) errors.email = "E-mail inválido";
  if (String(password ?? "").length < 8) errors.password = "A senha precisa ter pelo menos 8 caracteres";
  return errors;
}

// Nome exibido nas avaliações: "Maria S."
export function publicName(fullName) {
  const parts = String(fullName).trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)[0].toUpperCase()}.` : parts[0];
}
