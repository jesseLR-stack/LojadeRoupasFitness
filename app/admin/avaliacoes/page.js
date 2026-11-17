import Link from "next/link";
import { db } from "@/lib/db";
import { deleteReviewAction } from "../actions";
import DeleteReviewButton from "./DeleteReviewButton";

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function AdminReviews() {
  let reviews = [];
  let tableMissing = false;
  try {
    reviews = await db.listReviews({ limit: 200 });
  } catch {
    tableMissing = true;
  }
  const products = new Map((await db.listProducts({ includeInactive: true })).map((p) => [p.id, p]));

  return (
    <>
      <div className="admin-head"><h1>Avaliações</h1></div>
      {tableMissing && (
        <p className="form-error">A tabela de avaliações ainda não existe. Rode o arquivo supabase/003_clientes_avaliacoes_cupons.sql no Supabase.</p>
      )}
      <p className="muted small">Só clientes com pedido entregue podem avaliar. Remova avaliações ofensivas ou que não falem do produto.</p>
      {reviews.length === 0 ? (
        <div className="admin-empty"><p><b>Nenhuma avaliação ainda.</b></p><p className="muted">Elas aparecem aqui quando clientes avaliam produtos recebidos.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Nota</th><th>Comentário</th><th></th></tr></thead>
            <tbody>
              {reviews.map((r) => {
                const p = products.get(r.product_id);
                return (
                  <tr key={r.id}>
                    <td>{dateFmt.format(new Date(r.created_at))}</td>
                    <td>{p ? <Link href={`/produto/${p.slug}#avaliacoes`} target="_blank">{p.name}</Link> : "Produto excluído"}</td>
                    <td>{r.author}<br /><span className="muted small">{r.order_number}</span></td>
                    <td><span className="stars" aria-label={`${r.rating} de 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span></td>
                    <td>{r.comment || <span className="muted">Sem comentário</span>}</td>
                    <td><DeleteReviewButton id={r.id} action={deleteReviewAction} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
