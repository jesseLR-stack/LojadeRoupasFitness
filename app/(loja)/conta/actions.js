"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CUSTOMER_COOKIE, CUSTOMER_SESSION_DAYS, createCustomerToken, hashPassword, normalizeEmail, publicName,
  validateSignup, verifyPassword,
} from "@/lib/customer-auth";
import { db, refreshProductRating } from "@/lib/db";
import { currentCustomer } from "@/lib/session";

// Só aceita voltar para páginas do próprio site (evita redirecionar para outro domínio).
const safeNext = (p) => (typeof p === "string" && /^\/(?!\/)[\w\-/?=&#%.]*$/.test(p) ? p : "/conta");

async function startSession(customerId) {
  (await cookies()).set(CUSTOMER_COOKIE, createCustomerToken(customerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_SESSION_DAYS * 86400,
  });
}

function tableHint(e) {
  return /customers|relation|schema cache/i.test(e.message)
    ? "As contas ainda não estão ativas no banco (rode supabase/003_clientes_avaliacoes_cupons.sql)."
    : "Tente de novo em instantes.";
}

export async function signup(_prev, formData) {
  const values = { name: String(formData.get("name") ?? "").trim(), email: normalizeEmail(formData.get("email")) };
  const errors = validateSignup({ ...values, password: formData.get("password") });
  if (Object.keys(errors).length) return { errors, values };
  try {
    const c = await db.createCustomer({ ...values, passwordHash: await hashPassword(formData.get("password")) });
    await startSession(c.id);
  } catch (e) {
    if (e.details?.code === "23505") return { errors: { email: "Já existe uma conta com este e-mail. Entre com sua senha." }, values };
    return { errors: { form: `Não foi possível criar a conta. ${tableHint(e)}` }, values };
  }
  redirect(safeNext(formData.get("next")));
}

export async function login(_prev, formData) {
  const email = normalizeEmail(formData.get("email"));
  let c = null;
  try {
    c = await db.getCustomer({ email });
  } catch (e) {
    return { error: `Não foi possível entrar. ${tableHint(e)}`, email };
  }
  if (!c || !(await verifyPassword(formData.get("password"), c.passwordHash))) {
    await new Promise((r) => setTimeout(r, 600)); // atrasa tentativas de adivinhar a senha
    return { error: "E-mail ou senha incorretos", email };
  }
  await startSession(c.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  (await cookies()).delete(CUSTOMER_COOKIE);
  redirect("/");
}

export async function submitReview(_prev, formData) {
  const customer = await currentCustomer();
  if (!customer) return { error: "Entre na sua conta para avaliar." };
  const productId = Number(formData.get("productId"));
  const orderNumber = String(formData.get("orderNumber"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 600);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Escolha de 1 a 5 estrelas." };

  // Só quem recebeu o produto pode avaliar.
  const orders = await db.listCustomerOrders(customer.id);
  const order = orders.find((o) => o.number === orderNumber);
  if (!order || order.status !== "entregue" || !order.items.some((i) => i.id === productId)) {
    return { error: "Você pode avaliar depois que o pedido for entregue." };
  }

  await db.upsertReview({
    product_id: productId, customer_id: customer.id, order_number: orderNumber,
    author: publicName(customer.name), rating, comment,
  });
  await refreshProductRating(productId);
  revalidatePath("/", "layout");
  return { ok: true, rating, comment };
}
