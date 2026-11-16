import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { StoreProvider } from "@/components/StoreProvider";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "NewFitness | Moda fitness de alta performance", template: "%s | NewFitness" },
  description: "Leggings, tops, shorts, regatas e jaquetas fitness com tecido Dry-Fit, proteção UV e troca grátis em 30 dias.",
  openGraph: { siteName: "NewFitness", locale: "pt_BR", type: "website" },
};

export const viewport = { themeColor: "#0b0b0d" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
