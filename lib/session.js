// Cliente logado na requisição atual (componentes e ações do servidor).
import { cookies } from "next/headers";
import { CUSTOMER_COOKIE, readCustomerToken } from "./customer-auth";
import { db } from "./db";

export async function currentCustomer() {
  const id = readCustomerToken((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (!id) return null;
  try {
    const c = await db.getCustomer({ id });
    return c ? { id: c.id, name: c.name, email: c.email } : null;
  } catch {
    return null; // tabela ainda não criada (rode supabase/003_…sql)
  }
}
