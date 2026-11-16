import { test } from "node:test";
import assert from "node:assert/strict";

process.env.ADMIN_PASSWORD = "senha-forte-123";
const { checkPassword, createSessionToken, verifySessionToken } = await import("../lib/auth.js");
const { db, DB_MODE, OutOfStockError, normalizeProductInput } = await import("../lib/db.js");

test("senha do painel", async () => {
  assert.equal(await checkPassword("senha-forte-123"), true);
  assert.equal(await checkPassword("senha-errada"), false);
  assert.equal(await checkPassword(""), false);
});

test("sessão: válida, adulterada e expirada", async () => {
  const now = Date.now();
  const token = await createSessionToken(now);
  assert.equal(await verifySessionToken(token, now), true);
  const [exp, sig] = token.split(".");
  assert.equal(await verifySessionToken(`${Number(exp) + 999999}.${sig}`, now), false, "prazo alterado");
  assert.equal(await verifySessionToken(`${exp}.${"0".repeat(sig.length)}`, now), false, "assinatura falsa");
  assert.equal(await verifySessionToken(token, Number(exp) + 1), false, "expirada");
  assert.equal(await verifySessionToken(undefined), false);
});

test("formulário de produto: valida e normaliza", () => {
  const { product, errors } = normalizeProductInput({
    name: "Bermuda Ciclista Pro", price: "129,90", oldPrice: "", stock: "8", category: "shorts", gender: "feminino",
    colors: ["preto"], sizes: ["P", "M"], description: "Compressão alta e cós largo.", active: "on",
  });
  assert.deepEqual(errors, {});
  assert.equal(product.slug, "bermuda-ciclista-pro");
  assert.equal(product.price, 129.9);
  assert.equal(product.oldPrice, null);
  assert.equal(product.active, true);
  assert.equal(product.isNew, false);

  const bad = normalizeProductInput({ name: "X", price: "0", oldPrice: "0", stock: "-1", colors: [], sizes: [] }).errors;
  for (const k of ["name", "price", "oldPrice", "stock", "category", "gender", "colors", "sizes", "description"]) assert.ok(bad[k], k);
});

test("modo demonstração: estoque é baixado de forma tudo-ou-nada", async () => {
  assert.equal(DB_MODE, "demo");
  const before = (await db.getProduct({ id: 1 })).stock;
  await db.reserveStock([{ id: 1, qty: 2 }]);
  assert.equal((await db.getProduct({ id: 1 })).stock, before - 2);

  const stock2 = (await db.getProduct({ id: 2 })).stock;
  await assert.rejects(db.reserveStock([{ id: 2, qty: 1 }, { id: 1, qty: 9999 }]), OutOfStockError);
  assert.equal((await db.getProduct({ id: 2 })).stock, stock2, "nada foi baixado");
});

test("modo demonstração: produto oculto some da loja, mas não do painel", async () => {
  const p = await db.getProduct({ id: 3 });
  await db.saveProduct({ ...p, active: false });
  assert.ok(!(await db.listProducts()).some((x) => x.id === 3));
  assert.ok((await db.listProducts({ includeInactive: true })).some((x) => x.id === 3));
});
