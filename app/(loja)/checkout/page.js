import Checkout from "@/components/Checkout";
import { currentCustomer } from "@/lib/session";

export const metadata = { title: "Finalizar compra", robots: { index: false } };

export default async function CheckoutPage() {
  return <Checkout customer={await currentCustomer()} />;
}
