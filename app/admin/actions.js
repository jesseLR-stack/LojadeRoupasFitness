"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_HOURS, adminPassword, checkPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
import { db, normalizeProductInput } from "@/lib/db";
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
  const existing = await db.listProducts({ includeInactive: true });
  if (existing.length === 0) await db.seedProducts();
  refreshStore();
  redirect("/admin/produtos");
}

export async function setOrderStatus(formData) {
  await requireAdmin();
  const status = formData.get("status");
  if (!ORDER_STATUSES[status]) return;
  await db.updateOrderStatus(String(formData.get("number")), status);
  revalidatePath("/admin");
}
