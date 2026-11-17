import { redirect } from "next/navigation";
import { currentCustomer } from "@/lib/session";
import { LoginForm } from "../AuthForms";

export const metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage({ searchParams }) {
  const { next = "/conta" } = await searchParams;
  if (await currentCustomer()) redirect(next);
  return (
    <div className="auth-page">
      <h1>Entrar</h1>
      <p className="muted">Acompanhe seus pedidos e avalie os produtos que você recebeu.</p>
      <LoginForm next={next} />
    </div>
  );
}
