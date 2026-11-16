import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { StoreProvider } from "@/components/StoreProvider";
import { db } from "@/lib/db";

// O catálogo é lido do banco e atualizado a cada 60 s (ou na hora, quando o painel salva).
export const revalidate = 60;

export default async function StoreLayout({ children }) {
  const catalog = await db.listProducts();
  return (
    <StoreProvider catalog={catalog}>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </StoreProvider>
  );
}
