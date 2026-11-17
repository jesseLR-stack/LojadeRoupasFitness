import { test } from "node:test";
import assert from "node:assert/strict";
import { createCustomerToken, hashPassword, publicName, readCustomerToken, validateSignup, verifyPassword } from "../lib/customer-auth.js";
import { couponProblem, couponStatusLabel, normalizeCouponInput, todayBR } from "../lib/coupons.js";
import { niceMax, summarize } from "../lib/analytics.js";

test("senha do cliente: hash não guarda a senha e confere certo", async () => {
  const h = await hashPassword("minhasenha123");
  assert.ok(h.startsWith("scrypt$") && !h.includes("minhasenha123"));
  assert.notEqual(h, await hashPassword("minhasenha123"), "sal diferente a cada hash");
  assert.equal(await verifyPassword("minhasenha123", h), true);
  assert.equal(await verifyPassword("outrasenha", h), false);
  assert.equal(await verifyPassword("x", "lixo"), false);
});

test("sessão do cliente: válida, adulterada e expirada", () => {
  const now = Date.now();
  const t = createCustomerToken(7, now);
  assert.equal(readCustomerToken(t, now), 7);
  const [, exp, sig] = t.split(".");
  assert.equal(readCustomerToken(`8.${exp}.${sig}`, now), null, "trocar o id invalida");
  assert.equal(readCustomerToken(t, Number(exp) + 1), null, "expirada");
  assert.equal(readCustomerToken("lixo"), null);
});

test("cadastro e nome público", () => {
  assert.deepEqual(validateSignup({ name: "Ana Lima", email: "ana@x.com", password: "12345678" }), {});
  const e = validateSignup({ name: "Ana", email: "x", password: "123" });
  assert.ok(e.name && e.email && e.password);
  assert.equal(publicName("Maria da Silva Souza"), "Maria S.");
  assert.equal(publicName("Cher"), "Cher");
});

test("cupons: validade, limite e ativação", () => {
  const now = new Date("2026-11-17T12:00:00-03:00");
  assert.equal(todayBR(now), "2026-11-17");
  const ok = { code: "X10", percent: 10, active: true, expires_at: "2026-11-17", max_uses: 5, uses: 4 };
  assert.equal(couponProblem(ok, now), null, "vale até o fim do último dia");
  assert.match(couponProblem({ ...ok, expires_at: "2026-11-16" }, now), /expirou/);
  assert.match(couponProblem({ ...ok, uses: 5 }, now), /limite/);
  assert.match(couponProblem({ ...ok, active: false }, now), /ativo/);
  assert.equal(couponProblem(null), "Cupom inválido");
  assert.equal(couponStatusLabel({ ...ok, uses: 5 }, now), "Esgotado");
  const { coupon, errors } = normalizeCouponInput({ code: " verao20 ", percent: "20", max_uses: "", expires_at: "", active: "on" });
  assert.deepEqual(errors, {});
  assert.deepEqual(coupon, { code: "VERAO20", percent: 20, max_uses: null, expires_at: null, active: true });
  assert.ok(normalizeCouponInput({ code: "a b", percent: "95" }).errors.code);
});

test("painel: resumo ignora cancelados e agrupa por dia", () => {
  const now = new Date("2026-11-17T15:00:00-03:00");
  const orders = [
    { status: "pago", total: 100, created_at: "2026-11-17T10:00:00-03:00", items: [{ id: 1, name: "Legging", qty: 2, price: 50 }] },
    { status: "novo", total: 50, created_at: "2026-11-16T23:30:00-03:00", items: [{ id: 2, name: "Top", qty: 1, price: 50 }] },
    { status: "cancelado", total: 999, created_at: "2026-11-17T09:00:00-03:00", items: [{ id: 3, name: "Jaqueta", qty: 9, price: 111 }] },
  ];
  const s = summarize(orders, [{ active: true, stock: 2 }, { active: true, stock: 50 }], { now });
  assert.equal(s.revenue, 150);
  assert.equal(s.avgTicket, 75);
  assert.equal(s.toShip, 2);
  assert.equal(s.lowStock.length, 1);
  assert.equal(s.daily.length, 14);
  assert.deepEqual(s.daily.slice(-2).map((d) => d.total), [50, 100], "23h30 de Brasília conta no dia 16");
  assert.deepEqual(s.top.map((t) => t.name), ["Legging", "Top"], "cancelado fora do ranking");
  assert.equal(niceMax(1234), 1500);
  assert.equal(niceMax(0), 100);
});
