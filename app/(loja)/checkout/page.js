import Checkout from "@/components/Checkout";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/lib/session";

export const metadata = { title: "Finalizar compra", robots: { index: false } };

export default async function CheckoutPage() {
  // Comprar exige conta: quem não entrou vai para o login e volta para cá depois.
  const customer = await currentCustomer();
  if (!customer) redirect("/conta/entrar?next=/checkout&motivo=compra");
  return <Checkout customer={customer} />;
}
