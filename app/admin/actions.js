"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_HOURS, adminPassword, checkPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
import { MAX_IMAGES, db, missingSeedProducts, normalizeProductInput } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/orders";

async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/admin/login");
}

function refreshStore() {
  revalidatePath("/", "layout");
}

// Só aceita voltar para páginas do próprio painel.
function safeReturn(path) {
  return typeof path === "string" && /^\/admin(\/[\w\-/]*)?$/.test(path) ? path : "/admin";
}

export async function login(_prev, formData) {
  if (!adminPassword()) return { error: "O painel ainda não tem senha. Configure ADMIN_PASSWORD na Vercel." };
  if (!(await checkPassword(formData.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 700)); // atrasa tentativas de adivinhar a senha
    return { error: "Senha incorreta" };
  }
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  redirect(safeReturn(formData.get("voltar")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function saveProduct(_prev, formData) {
  await requireAdmin();
  const input = {
    ...Object.fromEntries(formData),
    collections: formData.getAll("collections"),
    colors: formData.getAll("colors"),
    sizes: formData.getAll("sizes"),
  };
  const { product, errors } = normalizeProductInput(input);
  if (Object.keys(errors).length) return { errors, values: input };

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  try {
    await db.saveProduct(id ? { ...product, id } : product);
  } catch (e) {
    if (e.details?.code === "23505") return { errors: { slug: "Já existe um produto com esse endereço" }, values: input };
    return { errors: { form: `Não foi possível salvar: ${e.message}` }, values: input };
  }
  refreshStore();
  redirect("/admin/produtos?salvo=1");
}

export async function deleteProduct(formData) {
  await requireAdmin();
  await db.deleteProduct(Number(formData.get("id")));
  refreshStore();
  redirect("/admin/produtos?excluido=1");
}

export async function seedProducts() {
  await requireAdmin();
  const missing = await missingSeedProducts();
  await db.insertProducts(missing);
  refreshStore();
  redirect(`/admin/produtos?importados=${missing.length}`);
}

export async function setOrderStatus(formData) {
  await requireAdmin();
  const status = formData.get("status");
  if (!ORDER_STATUSES[status]) return;
  await db.updateOrderStatus(String(formData.get("number")), status);
  revalidatePath("/admin");
}

// ---------- Fotos dos produtos ----------

const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function productOr404(id) {
  const product = await db.getProduct({ id: Number(id) });
  if (!product) throw new Error("Produto não encontrado");
  return product;
}

export async function addProductImage(formData) {
  await requireAdmin();
  const product = await productOr404(formData.get("id"));
  const file = formData.get("file");
  if (!file || typeof file === "string" || file.size === 0) return { error: "Escolha uma foto" };
  if (!IMAGE_TYPES[file.type]) return { error: "Use uma foto JPG, PNG ou WebP" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Foto muito grande (máximo 4 MB)" };
  if (product.images.length >= MAX_IMAGES) return { error: `Cada produto pode ter até ${MAX_IMAGES} fotos` };

  const path = `${product.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${IMAGE_TYPES[file.type]}`;
  try {
    const url = await db.uploadImage(path, new Uint8Array(await file.arrayBuffer()), file.type);
    const images = [...product.images, url];
    await db.setProductImages(product.id, images);
    refreshStore();
    return { images };
  } catch (e) {
    const hint = /bucket|not found/i.test(e.message) ? " Rode o arquivo supabase/002_fotos_avaliacoes.sql no Supabase." : "";
    return { error: `Não foi possível enviar a foto: ${e.message}.${hint}` };
  }
}

export async function removeProductImage(formData) {
  await requireAdmin();
  const product = await productOr404(formData.get("id"));
  const url = String(formData.get("url"));
  if (!product.images.includes(url)) return { images: product.images };
  const images = product.images.filter((u) => u !== url);
  await db.setProductImages(product.id, images);
  await db.deleteImage(url).catch(() => {}); // se falhar, a foto só fica sobrando no Storage
  refreshStore();
  return { images };
}

export async function makeMainImage(formData) {
  await requireAdmin();
  const product = await productOr404(formData.get("id"));
  const url = String(formData.get("url"));
  if (!product.images.includes(url)) return { images: product.images };
  const images = [url, ...product.images.filter((u) => u !== url)];
  await db.setProductImages(product.id, images);
  refreshStore();
  return { images };
}
