// Acesso aos dados da loja (produtos e pedidos). Use só no servidor.
//
// Com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY definidas, usa o banco Supabase pela API REST.
// Sem elas, roda em "modo demonstração": os dados ficam na memória do servidor, começam com os
// produtos de exemplo e se perdem quando o servidor reinicia.
import { SEED_PRODUCTS, slugify } from "./products.js";

const URL_ = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export const DB_MODE = URL_ && KEY ? "supabase" : "demo";

export class OutOfStockError extends Error {
  constructor(productId) {
    super("Produto sem estoque suficiente");
    this.productId = productId;
  }
}

// ---------- conversão entre o formato do app (camelCase) e o do banco (snake_case) ----------

const PRODUCT_FIELDS = ["name", "slug", "category", "gender", "collections", "price", "oldPrice", "rating", "reviews",
  "colors", "sizes", "tag", "isNew", "description", "stock", "active"];
const toSnake = (k) => k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
const toCamel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function productFromRow(row) {
  const p = {};
  for (const [k, v] of Object.entries(row)) p[toCamel(k)] = v;
  p.price = Number(p.price);
  p.oldPrice = p.oldPrice == null ? null : Number(p.oldPrice);
  p.rating = Number(p.rating);
  return p;
}
function productToRow(p) {
  const row = {};
  for (const k of PRODUCT_FIELDS) if (p[k] !== undefined) row[toSnake(k)] = p[k];
  return row;
}

// ---------- Supabase (PostgREST) ----------

async function rest(path, { method = "GET", body, prefer } = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      // Chave antiga (JWT "eyJ…") também vai no Authorization; a nova "sb_secret_…" vai só no apikey.
      ...(KEY.startsWith("eyJ") ? { Authorization: `Bearer ${KEY}` } : {}),
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.message || `Erro do banco (${res.status})`);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

const supabase = {
  async listProducts({ includeInactive = false } = {}) {
    const rows = await rest(`products?select=*&order=id.asc${includeInactive ? "" : "&active=is.true"}`);
    return rows.map(productFromRow);
  },
  async getProduct({ id, slug }) {
    const filter = id != null ? `id=eq.${Number(id)}` : `slug=eq.${encodeURIComponent(slug)}`;
    const rows = await rest(`products?select=*&${filter}&limit=1`);
    return rows[0] ? productFromRow(rows[0]) : null;
  },
  async saveProduct(p) {
    const row = productToRow(p);
    const rows = p.id
      ? await rest(`products?id=eq.${Number(p.id)}`, { method: "PATCH", body: row, prefer: "return=representation" })
      : await rest("products", { method: "POST", body: row, prefer: "return=representation" });
    return productFromRow(rows[0]);
  },
  async deleteProduct(id) {
    await rest(`products?id=eq.${Number(id)}`, { method: "DELETE" });
  },
  async seedProducts(list = SEED_PRODUCTS) {
    // Mantém os ids do catálogo de exemplo e acerta a sequência depois (ver supabase/schema.sql).
    await rest("products", { method: "POST", body: list.map((p) => ({ id: p.id, ...productToRow(p) })), prefer: "return=minimal" });
    await rest("rpc/sync_products_id_seq", { method: "POST", body: {} });
  },
  async reserveStock(items) {
    try {
      await rest("rpc/reserve_stock", { method: "POST", body: { items: items.map(({ id, qty }) => ({ id, qty })) } });
    } catch (e) {
      const m = /sem_estoque:(\d+)/.exec(e.message);
      if (m) throw new OutOfStockError(Number(m[1]));
      throw e;
    }
  },
  async createOrder(order) {
    const rows = await rest("orders", { method: "POST", body: order, prefer: "return=representation" });
    return rows[0];
  },
  async listOrders({ limit = 100 } = {}) {
    return rest(`orders?select=*&order=created_at.desc&limit=${limit}`);
  },
  async updateOrderStatus(number, status) {
    await rest(`orders?number=eq.${encodeURIComponent(number)}`, { method: "PATCH", body: { status } });
  },
};

// ---------- Modo demonstração (memória) ----------

function mem() {
  globalThis.__newfitnessMemory ??= { products: structuredClone(SEED_PRODUCTS), orders: [] };
  return globalThis.__newfitnessMemory;
}

const demo = {
  async listProducts({ includeInactive = false } = {}) {
    return structuredClone(mem().products.filter((p) => includeInactive || p.active)).sort((a, b) => a.id - b.id);
  },
  async getProduct({ id, slug }) {
    const p = mem().products.find((x) => (id != null ? x.id === Number(id) : x.slug === slug));
    return p ? structuredClone(p) : null;
  },
  async saveProduct(p) {
    const db = mem();
    if (p.id) {
      const i = db.products.findIndex((x) => x.id === Number(p.id));
      if (i < 0) throw new Error("Produto não encontrado");
      db.products[i] = { ...db.products[i], ...p, id: Number(p.id) };
      return structuredClone(db.products[i]);
    }
    if (db.products.some((x) => x.slug === p.slug)) {
      const err = new Error("duplicate key value violates unique constraint");
      err.details = { code: "23505" };
      throw err;
    }
    const created = { rating: 5, reviews: 0, ...p, id: Math.max(0, ...db.products.map((x) => x.id)) + 1 };
    db.products.push(created);
    return structuredClone(created);
  },
  async deleteProduct(id) {
    mem().products = mem().products.filter((x) => x.id !== Number(id));
  },
  async seedProducts() {
    mem().products = structuredClone(SEED_PRODUCTS);
  },
  async reserveStock(items) {
    const db = mem();
    const need = new Map();
    for (const { id, qty } of items) need.set(id, (need.get(id) ?? 0) + qty);
    for (const [id, qty] of need) {
      const p = db.products.find((x) => x.id === id);
      if (!p || !p.active || p.stock < qty) throw new OutOfStockError(id);
    }
    for (const [id, qty] of need) db.products.find((x) => x.id === id).stock -= qty;
  },
  async createOrder(order) {
    const row = { ...order, created_at: new Date().toISOString() };
    mem().orders.unshift(row);
    return structuredClone(row);
  },
  async listOrders({ limit = 100 } = {}) {
    return structuredClone(mem().orders.slice(0, limit));
  },
  async updateOrderStatus(number, status) {
    const o = mem().orders.find((x) => x.number === number);
    if (o) o.status = status;
  },
};

export const db = DB_MODE === "supabase" ? supabase : demo;

// ---------- Validação do formulário de produto (painel) ----------

export function normalizeProductInput(input) {
  const errors = {};
  const num = (v) => (v === "" || v == null ? null : Number(String(v).replace(",", ".")));
  const p = {
    name: String(input.name ?? "").trim(),
    description: String(input.description ?? "").trim(),
    category: input.category,
    gender: input.gender,
    collections: [].concat(input.collections ?? []),
    colors: [].concat(input.colors ?? []),
    sizes: [].concat(input.sizes ?? []),
    price: num(input.price),
    oldPrice: num(input.oldPrice),
    stock: num(input.stock),
    tag: String(input.tag ?? ""),
    isNew: input.isNew === true || input.isNew === "on",
    active: input.active === true || input.active === "on",
  };
  p.slug = slugify(input.slug?.trim() || p.name);

  if (p.name.length < 3) errors.name = "Informe o nome do produto";
  if (!p.slug) errors.slug = "Endereço inválido";
  if (!(p.price > 0)) errors.price = "Preço deve ser maior que zero";
  if (p.oldPrice != null && !(p.oldPrice > p.price)) errors.oldPrice = "O preço \"de\" deve ser maior que o preço atual (ou fique vazio)";
  if (!Number.isInteger(p.stock) || p.stock < 0) errors.stock = "Estoque deve ser um número inteiro (0 ou mais)";
  if (!p.category) errors.category = "Escolha a categoria";
  if (!p.gender) errors.gender = "Escolha o gênero";
  if (!p.colors.length) errors.colors = "Escolha pelo menos uma cor";
  if (!p.sizes.length) errors.sizes = "Escolha pelo menos um tamanho";
  if (p.description.length < 10) errors.description = "Escreva uma descrição (mínimo 10 letras)";
  return { product: p, errors };
}
