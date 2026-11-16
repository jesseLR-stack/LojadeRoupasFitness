import Link from "next/link";
import ProductArt from "@/components/ProductArt";
import { db } from "@/lib/db";
import { brl } from "@/lib/pricing";
import { categoryLabel } from "@/lib/products";
import { seedProducts } from "../actions";

export default async function AdminProducts({ searchParams }) {
  const { salvo, excluido } = await searchParams;
  const products = await db.listProducts({ includeInactive: true });

  return (
    <>
      <div className="admin-head">
        <h1>Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn btn-primary small">+ Novo produto</Link>
      </div>
      {salvo && <p className="admin-notice" role="status">Produto salvo. A loja já foi atualizada.</p>}
      {excluido && <p className="admin-notice" role="status">Produto excluído.</p>}

      {products.length === 0 ? (
        <div className="admin-empty">
          <p><b>Nenhum produto cadastrado.</b></p>
          <p className="muted">Comece importando os 12 produtos de exemplo e depois edite do seu jeito, ou cadastre do zero.</p>
          <form action={seedProducts}><button className="btn btn-ghost small" type="submit">Importar produtos de exemplo</button></form>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th></th><th>Produto</th><th>Categoria</th><th className="num">Preço</th><th className="num">Estoque</th><th>Na loja</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.active ? "" : "inactive"}>
                  <td><div className="thumb xs" data-bg={p.colors[0]}><ProductArt product={p} /></div></td>
                  <td><b>{p.name}</b><br /><span className="muted small">/produto/{p.slug}</span></td>
                  <td>{categoryLabel(p.category)}</td>
                  <td className="num">{p.oldPrice && <s className="muted">{brl(p.oldPrice)}</s>} {brl(p.price)}</td>
                  <td className="num">
                    <span className={`pill ${p.stock === 0 ? "pill-bad" : p.stock <= 5 ? "pill-warn" : "pill-ok"}`}>
                      {p.stock === 0 ? "Esgotado" : `${p.stock} un.`}
                    </span>
                  </td>
                  <td>{p.active ? "Visível" : <span className="muted">Oculto</span>}</td>
                  <td><Link href={`/admin/produtos/${p.id}`} className="btn btn-ghost small">Editar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
