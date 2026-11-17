import { redirect } from "next/navigation";
import { currentCustomer } from "@/lib/session";
import { SignupForm } from "../AuthForms";

export const metadata = { title: "Criar conta", robots: { index: false } };

export default async function SignupPage({ searchParams }) {
  const { next = "/conta" } = await searchParams;
  if (await currentCustomer()) redirect(next);
  return (
    <div className="auth-page">
      <h1>Criar conta</h1>
      <p className="muted">Com uma conta você acompanha o status dos pedidos e avalia o que comprou.</p>
      <SignupForm next={next} />
    </div>
  );
}
