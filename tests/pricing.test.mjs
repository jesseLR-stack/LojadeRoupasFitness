import { test } from "node:test";
import assert from "node:assert/strict";
import { cartTotals, FREE_SHIPPING, SHIPPING_COST } from "../lib/pricing.js";
import { validCPF, RULES, MASKS } from "../lib/validation.js";

const legging = { key: "a", id: 1, color: "preto", size: "M", qty: 1 }; // R$ 189,90
const jaqueta = { key: "b", id: 5, color: "preto", size: "M", qty: 1 }; // R$ 299,90

test("sacola vazia não cobra frete", () => {
  assert.deepEqual(
    { subtotal: cartTotals([], null).subtotal, shipping: cartTotals([], null).shipping, total: cartTotals([], null).total },
    { subtotal: 0, shipping: 0, total: 0 },
  );
});

test("abaixo de R$ 299 cobra frete PAC", () => {
  const t = cartTotals([legging], null);
  assert.equal(t.subtotal, 189.9);
  assert.equal(t.shipping, SHIPPING_COST);
  assert.equal(t.total, 214.8);
});

test("frete grátis considera o valor já com cupom", () => {
  const t = cartTotals([jaqueta], "NEW10"); // 299,90 - 10% = 269,91
  assert.ok(t.base < FREE_SHIPPING);
  assert.equal(t.shipping, SHIPPING_COST);
  assert.equal(cartTotals([jaqueta], null).shipping, 0);
});

test("Pix dá 5% sobre os produtos, não sobre o frete", () => {
  const t = cartTotals([legging, jaqueta], null, { ship: "sedex", pay: "pix" });
  assert.equal(t.subtotal, 489.8);
  assert.equal(t.pix, 24.49);
  assert.equal(t.total, 505.21); // 489,80 - 24,49 + 39,90
});

test("cupom inválido é ignorado e produto inexistente some", () => {
  const t = cartTotals([legging, { key: "x", id: 999, color: "preto", size: "M", qty: 1 }], "FAKE");
  assert.equal(t.discount, 0);
  assert.equal(t.lines.length, 1);
});

test("CPF válido e inválido", () => {
  assert.equal(validCPF("529.982.247-25"), true);
  assert.equal(validCPF("529.982.247-24"), false);
  assert.equal(validCPF("111.111.111-11"), false);
});

test("máscaras", () => {
  assert.equal(MASKS.tel("11987654321"), "(11) 98765-4321");
  assert.equal(MASKS.cep("01310100"), "01310-100");
  assert.equal(MASKS.card("4111111111111111"), "4111 1111 1111 1111");
});

test("validade do cartão vale até o fim do mês", () => {
  const now = new Date(2026, 10, 16); // 16/11/2026
  assert.equal(RULES.validade("11/26", now), true);
  assert.equal(RULES.validade("10/26", now), "Cartão vencido");
  assert.equal(RULES.validade("13/27", now), "MM/AA");
});
