import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { DB_MODE } from "@/lib/db";
import { missingStoreInfo } from "@/lib/store";
import { logout } from "./actions";

export const metadata = { title: "Painel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const logged = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  return (
    <div className="admin">
      <header className="admin-bar">
        <Link href="/admin" className="logo">New<span>Fitness</span> <small>painel</small></Link>
        {logged && (
          <nav>
            <Link href="/admin">Pedidos</Link>
            <Link href="/admin/produtos">Produtos</Link>
            <Link href="/" target="_blank">Ver loja ↗</Link>
            <form action={logout}><button type="submit">Sair</button></form>
          </nav>
        )}
      </header>
      {logged && DB_MODE === "demo" && (
        <p className="admin-banner">
          <b>Modo demonstração:</b> o banco de dados ainda não está conectado. Você pode testar tudo, mas as mudanças
          somem quando o servidor reinicia.
        </p>
      )}
      {logged && missingStoreInfo().length > 0 && (
        <p className="admin-banner">
          <b>Dados obrigatórios da loja:</b> a lei exige que a loja mostre nome, CPF/CNPJ, endereço e contato. Falta cadastrar
          na Vercel (Settings → Environment Variables): {missingStoreInfo().join(", ")}.
        </p>
      )}
      <div className="admin-body">{children}</div>
    </div>
  );
}
