// Acesso aos dados da loja (produtos e pedidos). Use só no servidor.
//
// Com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY definidas, usa o banco Supabase pela API REST.
// Sem elas, roda em "modo demonstração": os dados ficam na memória do servidor, começam com os
// produtos de exemplo e se perdem quando o servidor reinicia.
import { SEED_PRODUCTS, slugify } from "./products.js";

// Aceita a URL com ou sem "/rest/v1" no final.
const URL_ = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
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
  "colors", "sizes", "tag", "isNew", "description", "stock", "active", "images"];

export const IMAGE_BUCKET = "product-images";
export const MAX_IMAGES = 6;
const toSnake = (k) => k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
const toCamel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function productFromRow(row) {
  const p = {};
  for (const [k, v] of Object.entries(row)) p[toCamel(k)] = v;
  p.price = Number(p.price);
  p.oldPrice = p.oldPrice == null ? null : Number(p.oldPrice);
  p.rating = Number(p.rating);
  p.images ??= []; // antes de rodar supabase/002_fotos_avaliacoes.sql a coluna não existe
  return p;
}
function productToRow(p) {
  const row = {};
  for (const k of PRODUCT_FIELDS) if (p[k] !== undefined) row[toSnake(k)] = p[k];
  return row;
}

// ---------- Supabase (PostgREST) ----------

function authHeaders() {
  // Chave antiga (JWT "eyJ…") também vai no Authorization; a nova "sb_secret_…" vai só no apikey.
  return { apikey: KEY, ...(KEY.startsWith("eyJ") ? { Authorization: `Bearer ${KEY}` } : {}) };
}

async function rest(path, { method = "GET", body, prefer } = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: {
      ...authHeaders(),
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
  async insertProducts(list) {
    // O banco escolhe os ids, então não conflita com produtos já cadastrados.
    if (list.length) await rest("products", { method: "POST", body: list.map(productToRow), prefer: "return=minimal" });
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
  async setProductImages(id, images) {
    await rest(`products?id=eq.${Number(id)}`, { method: "PATCH", body: { images } });
  },
  // Envia a foto ao Supabase Storage e devolve o endereço público.
  async uploadImage(path, bytes, contentType) {
    const res = await fetch(`${URL_}/storage/v1/object/${IMAGE_BUCKET}/${path}`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": contentType, "x-upsert": "false" },
      body: bytes,
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || data.error || `Erro ao enviar a foto (${res.status})`);
    }
    return `${URL_}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
  },
  async deleteImage(url) {
    const prefix = `${URL_}/storage/v1/object/public/${IMAGE_BUCKET}/`;
    if (!url.startsWith(prefix)) return;
    await fetch(`${URL_}/storage/v1/object/${IMAGE_BUCKET}`, {
      method: "DELETE",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [url.slice(prefix.length)] }),
      cache: "no-store",
    });
  },
};

// ---------- Modo demonstração (memória) ----------

function mem() {
  globalThis.__newfitnessMemory ??= { products: SEED_PRODUCTS.map((p) => ({ ...structuredClone(p), images: [] })), orders: [] };
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
    const created = { rating: 0, reviews: 0, images: [], ...p, id: Math.max(0, ...db.products.map((x) => x.id)) + 1 };
    db.products.push(created);
    return structuredClone(created);
  },
  async deleteProduct(id) {
    mem().products = mem().products.filter((x) => x.id !== Number(id));
  },
  async insertProducts(list) {
    for (const p of list) {
      const { id, ...rest } = structuredClone(p);
      await demo.saveProduct(rest);
    }
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
  async setProductImages(id, images) {
    const p = mem().products.find((x) => x.id === Number(id));
    if (p) p.images = images;
  },
  // Sem Storage no modo demonstração: guarda a foto como data URL na memória.
  async uploadImage(_path, bytes, contentType) {
    return `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
  },
  async deleteImage() {},
};

export const db = DB_MODE === "supabase" ? supabase : demo;

// Produtos de exemplo que ainda não estão no catálogo (compara pelo endereço da página).
export async function missingSeedProducts() {
  const slugs = new Set((await db.listProducts({ includeInactive: true })).map((p) => p.slug));
  return SEED_PRODUCTS.filter((p) => !slugs.has(p.slug));
}

// ---------- Validação do formulário de produto (painel) ----------

export function normalizeProductInput(input) {
  const errors = {};
  // Aceita "189,90", "1.299,90", "189.90" e números.
  const num = (v) => {
    if (v === "" || v == null) return null;
    const t = String(v).trim().replace(/\s|R\$/g, "");
    return Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  };
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
