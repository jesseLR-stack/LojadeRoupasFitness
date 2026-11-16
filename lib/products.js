// Catálogo de exemplo. No próximo passo estes dados virão do banco (painel de administração).
export const CATEGORIES = [
  { id: "all", label: "Tudo" },
  { id: "legging", label: "Leggings" },
  { id: "top", label: "Tops" },
  { id: "shorts", label: "Shorts" },
  { id: "regata", label: "Regatas" },
  { id: "camiseta", label: "Camisetas" },
  { id: "jaqueta", label: "Jaquetas" },
];

export const COLORS = {
  preto: { name: "Preto", hex: "#1c1c1f" },
  lima: { name: "Lima Neon", hex: "#c6ff00" },
  vinho: { name: "Vinho", hex: "#7a1f3d" },
  lilas: { name: "Lilás", hex: "#a78bfa" },
  oceano: { name: "Azul Oceano", hex: "#2563eb" },
  areia: { name: "Areia", hex: "#d6c3a5" },
  coral: { name: "Coral", hex: "#ff6b5b" },
  verde: { name: "Verde Militar", hex: "#4d5d3a" },
  cinza: { name: "Cinza Mescla", hex: "#8b8f97" },
  branco: { name: "Branco", hex: "#f4f4f5" },
};

const RAW_PRODUCTS = [
  { id: 1, name: "Legging Sculpt Cintura Alta", category: "legging", gender: "feminino", collections: ["musculacao", "crossfit"], price: 189.9, oldPrice: 229.9, rating: 4.9, reviews: 1284, colors: ["preto", "vinho", "verde"], sizes: ["PP", "P", "M", "G", "GG"], tag: "Mais vendido", isNew: false,
    description: "Compressão média, cós anatômico de 10 cm e tecido 100% opaco no agachamento. Ideal para treinos de força." },
  { id: 2, name: "Top Impact Alta Sustentação", category: "top", gender: "feminino", collections: ["crossfit", "corrida"], price: 129.9, rating: 4.8, reviews: 842, colors: ["lima", "preto", "coral"], sizes: ["P", "M", "G", "GG"], tag: "Novo", isNew: true,
    description: "Alças cruzadas reguláveis, bojo removível e sustentação para atividades de alto impacto." },
  { id: 3, name: "Shorts Runner 2 em 1", category: "shorts", gender: "masculino", collections: ["corrida"], price: 149.9, rating: 4.7, reviews: 516, colors: ["preto", "oceano", "cinza"], sizes: ["P", "M", "G", "GG", "XG"], isNew: false,
    description: "Bermuda interna de compressão, bolso para celular e detalhes refletivos para corridas noturnas." },
  { id: 4, name: "Regata Dry Muscle", category: "regata", gender: "masculino", collections: ["musculacao", "crossfit"], price: 89.9, oldPrice: 109.9, rating: 4.6, reviews: 398, colors: ["preto", "verde", "branco"], sizes: ["P", "M", "G", "GG", "XG"], isNew: false,
    description: "Cava profunda, tecido Dry‑Fit com secagem ultrarrápida e caimento atlético." },
  { id: 5, name: "Jaqueta Wind Shield", category: "jaqueta", gender: "unissex", collections: ["corrida"], price: 299.9, rating: 4.9, reviews: 211, colors: ["preto", "lilas", "oceano"], sizes: ["P", "M", "G", "GG"], tag: "Novo", isNew: true,
    description: "Corta‑vento ultraleve, repelente à água, dobra no próprio bolso. Perfeita para treinos ao ar livre." },
  { id: 6, name: "Legging Flow Yoga", category: "legging", gender: "feminino", collections: ["yoga"], price: 169.9, rating: 4.8, reviews: 927, colors: ["lilas", "areia", "preto"], sizes: ["PP", "P", "M", "G", "GG"], isNew: false,
    description: "Toque de segunda pele, sem costura frontal e elasticidade em 4 direções para posturas profundas." },
  { id: 7, name: "Camiseta Tech Seamless", category: "camiseta", gender: "masculino", collections: ["musculacao", "corrida"], price: 119.9, rating: 4.7, reviews: 634, colors: ["cinza", "preto", "oceano"], sizes: ["P", "M", "G", "GG", "XG"], isNew: true,
    description: "Malha sem costura com zonas de ventilação mapeadas. Leve, respirável e antiodor." },
  { id: 8, name: "Top Balance Cruzado", category: "top", gender: "feminino", collections: ["yoga"], price: 99.9, oldPrice: 129.9, rating: 4.8, reviews: 455, colors: ["areia", "lilas", "vinho"], sizes: ["P", "M", "G"], isNew: false,
    description: "Costas cruzadas, sustentação leve e tecido macio. Para yoga, pilates e o dia a dia." },
  { id: 9, name: "Shorts Power Feminino", category: "shorts", gender: "feminino", collections: ["musculacao", "crossfit"], price: 109.9, rating: 4.9, reviews: 1022, colors: ["preto", "coral", "vinho"], sizes: ["PP", "P", "M", "G", "GG"], tag: "Mais vendido", isNew: false,
    description: "Cintura alta, não enrola nas pernas e não fica transparente. O queridinho do leg day." },
  { id: 10, name: "Regata Breeze Feminina", category: "regata", gender: "feminino", collections: ["corrida", "yoga"], price: 79.9, rating: 4.6, reviews: 287, colors: ["branco", "lima", "lilas"], sizes: ["PP", "P", "M", "G"], isNew: true,
    description: "Costas nadador, modelagem soltinha e tecido furadinho que deixa o corpo respirar." },
  { id: 11, name: "Jaqueta Thermo Zip", category: "jaqueta", gender: "feminino", collections: ["yoga", "corrida"], price: 259.9, rating: 4.8, reviews: 176, colors: ["vinho", "preto", "areia"], sizes: ["P", "M", "G", "GG"], isNew: false,
    description: "Interior flanelado, abertura para polegar e bolsos com zíper. Aquece sem pesar." },
  { id: 12, name: "Camiseta Cross Oversized", category: "camiseta", gender: "unissex", collections: ["crossfit", "musculacao"], price: 99.9, rating: 4.7, reviews: 349, colors: ["preto", "lima", "verde"], sizes: ["P", "M", "G", "GG", "XG"], tag: "Novo", isNew: true,
    description: "Modelagem ampla, ombro caído e tecido encorpado que resiste a treinos intensos." },
];

// Silhuetas SVG de cada tipo de peça (substitua por fotos reais quando tiver).
export const SHAPES = {
  legging: '<path d="M62 28h76v20l10 172h-34L100 92l-14 128H52l10-172z"/><rect x="62" y="28" width="76" height="16" rx="3" class="shade"/>',
  top: '<path d="M62 62c6-26 14-30 20-30l10 40c4 8 12 8 16 0l10-40c6 0 14 4 20 30l6 62H56z"/><path d="M56 112h88v12H56z" class="shade"/>',
  shorts: '<path d="M54 64h92v18l12 74h-46l-12-44-12 44H42l12-74z"/><rect x="54" y="64" width="92" height="14" rx="3" class="shade"/>',
  regata: '<path d="M74 28h16c4 22 16 22 20 0h16l4 50 12 14v128H58V92l12-14z"/>',
  camiseta: '<path d="M70 34l20-6c4 18 16 18 20 0l20 6 36 30-16 26-14-10v132H64V80l-14 10-16-26z"/>',
  jaqueta: '<path d="M70 34l20-6c4 14 16 14 20 0l20 6 30 34 10 132h-22l-10-104v120H62V96L52 200H30l10-132z"/><path d="M99 40h2v176h-2z" class="zip"/>',
};

export const COLLECTIONS = {
  musculacao: "Musculação",
  corrida: "Corrida",
  yoga: "Yoga & Pilates",
  crossfit: "Cross",
};

export const LIGHT_COLORS = ["lima", "branco", "areia"];

export function slugify(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const PRODUCTS = RAW_PRODUCTS.map((p) => ({ ...p, slug: slugify(p.name) }));

export const getProductById = (id) => PRODUCTS.find((p) => p.id === id);
export const getProductBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export function relatedProducts(product, limit = 4) {
  return PRODUCTS.filter((x) => x.id !== product.id)
    .map((x) => ({
      x,
      score: (x.category === product.category ? 2 : 0) + x.collections.filter((c) => product.collections.includes(c)).length,
    }))
    .sort((a, b) => b.score - a.score || b.x.rating - a.x.rating)
    .slice(0, limit)
    .map((r) => r.x);
}
