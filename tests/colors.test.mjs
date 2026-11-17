import { test } from "node:test";
import assert from "node:assert/strict";
import { COLORS, COLOR_GROUPS, backgroundFor, colorBackgroundsCss, colorOf, normalizeColor } from "../lib/colors.js";
import { SEED_PRODUCTS } from "../lib/products.js";

const PEDIDAS = ["Preto", "Branco", "Cinza", "Bege", "Marrom", "Off-white", "Creme", "Vermelho", "Laranja", "Amarelo",
  "Pink", "Rosa", "Roxo", "Lilás", "Azul", "Verde", "Turquesa"];

test("paleta tem todas as cores pedidas, sem repetir", () => {
  const nomes = Object.values(COLORS).map((c) => c.name);
  for (const n of PEDIDAS) assert.ok(nomes.includes(n), n);
  assert.equal(new Set(nomes).size, nomes.length);
  assert.equal(Object.keys(COLORS).length, COLOR_GROUPS.flatMap((g) => g.colors).length);
  for (const c of Object.values(COLORS)) assert.match(c.hex, /^#[0-9a-f]{6}$/);
});

test("cores antigas são convertidas e cor desconhecida não quebra", () => {
  assert.equal(normalizeColor("lima"), "verde-limao");
  assert.equal(normalizeColor("oceano"), "azul");
  assert.equal(colorOf("areia").name, "Bege");
  assert.equal(colorOf("preto").name, "Preto");
  assert.equal(colorOf("cor-inventada").name, "cor-inventada");
});

test("produtos de exemplo só usam cores da paleta", () => {
  for (const p of SEED_PRODUCTS) for (const c of p.colors) assert.ok(COLORS[c], `${p.name}: ${c}`);
});

test("fundo do cartão: escuro para peça clara, claro para peça escura", () => {
  const lum = (h) => [1, 3, 5].reduce((s, i) => s + parseInt(h.slice(i, i + 2), 16), 0) / 3;
  assert.ok(lum(backgroundFor(COLORS.branco)[0]) < 80);
  assert.ok(lum(backgroundFor(COLORS.preto)[0]) > 180);
  const css = colorBackgroundsCss();
  for (const k of [...Object.keys(COLORS), "lima", "oceano"]) assert.ok(css.includes(`[data-bg="${k}"]`), k);
});
