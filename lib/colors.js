// Paleta de cores dos produtos. Para adicionar uma cor, inclua uma linha aqui:
// a loja, o painel e os fundos dos cartões passam a usá-la automaticamente.
// `light: true` marca cores claras (o fundo do cartão fica escuro para a peça aparecer).

export const COLOR_GROUPS = [
  {
    label: "Básicas",
    colors: [
      ["preto", "Preto", "#1c1c1f"],
      ["branco", "Branco", "#f7f7f8", true],
      ["off-white", "Off-white", "#f1ede4", true],
      ["creme", "Creme", "#eee0bf", true],
      ["bege", "Bege", "#d2b48c", true],
      ["cinza", "Cinza", "#8b8f97"],
      ["marrom", "Marrom", "#6b4430"],
    ],
  },
  {
    label: "Vibrantes",
    colors: [
      ["vermelho", "Vermelho", "#d7263d"],
      ["laranja", "Laranja", "#f26a1b"],
      ["amarelo", "Amarelo", "#f6c81d", true],
      ["pink", "Pink", "#ff2e88"],
      ["rosa", "Rosa", "#f4a6c0", true],
      ["roxo", "Roxo", "#6a2c91"],
      ["lilas", "Lilás", "#a78bfa"],
      ["azul", "Azul", "#2563eb"],
      ["turquesa", "Turquesa", "#1fbfb8"],
      ["verde", "Verde", "#22a447"],
    ],
  },
  {
    label: "Clássicas do fitness",
    colors: [
      ["azul-marinho", "Azul-marinho", "#1b2a4a"],
      ["verde-militar", "Verde-militar", "#4d5d3a"],
      ["vinho", "Vinho", "#7a1f3d"],
      ["verde-limao", "Verde-limão", "#c6ff00", true],
    ],
  },
];

export const COLORS = Object.fromEntries(
  COLOR_GROUPS.flatMap((g) => g.colors.map(([id, name, hex, light]) => [id, { name, hex, light: !!light }])),
);

// Cores da versão anterior -> cor nova mais parecida (pedidos antigos e sacolas salvas continuam funcionando).
export const LEGACY_COLORS = {
  lima: "verde-limao",
  oceano: "azul",
  areia: "bege",
  coral: "laranja",
  // "verde" antigo era o Verde Militar; produtos no banco são convertidos pelo supabase/004_cores.sql
};

export const normalizeColor = (key) => LEGACY_COLORS[key] ?? key;

// Sempre devolve algo exibível, mesmo para uma cor desconhecida.
export function colorOf(key) {
  return COLORS[normalizeColor(key)] ?? { name: String(key), hex: "#8b8f97", light: false };
}

// ---------- Fundo dos cartões, gerado a partir da cor ----------

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => rgbToHex(hexToRgb(a).map((v, i) => v + (hexToRgb(b)[i] - v) * t));

// Peça clara -> fundo escuro levemente tingido; peça escura ou viva -> fundo claro tingido.
export function backgroundFor({ hex, light }) {
  return light
    ? [mix(hex, "#16161b", 0.78), mix(hex, "#0e0e12", 0.9)]
    : [mix(hex, "#f4f3ef", 0.8), mix(hex, "#dedcd5", 0.68)];
}

export function colorBackgroundsCss() {
  const keys = { ...Object.fromEntries(Object.keys(COLORS).map((k) => [k, k])), ...LEGACY_COLORS };
  return Object.entries(keys)
    .map(([attr, key]) => {
      const [a, b] = backgroundFor(COLORS[key]);
      return `[data-bg="${attr}"]{background:linear-gradient(160deg,${a},${b})}`;
    })
    .join("");
}
