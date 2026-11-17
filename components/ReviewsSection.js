import Link from "next/link";
import { stars } from "./icons";

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Sao_Paulo" });

// Avaliações de clientes que receberam o produto.
export default function ReviewsSection({ product, reviews }) {
  const total = reviews.length;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  return (
    <section className="reviews-section" id="avaliacoes" aria-labelledby="reviews-title">
      <h2 className="section-title" id="reviews-title">Avaliações</h2>
      {total === 0 ? (
        <div className="reviews-empty">
          <p><b>Este produto ainda não tem avaliações.</b></p>
          <p className="muted">
            Comprou? Depois que o pedido for entregue, avalie em <Link href="/conta">Meus pedidos</Link>.
          </p>
        </div>
      ) : (
        <div className="reviews-grid">
          <div className="reviews-summary">
            <strong>{product.rating.toFixed(1)}</strong>
            <span className="stars" aria-hidden="true">{stars(product.rating)}</span>
            <span className="muted small">{total} {total === 1 ? "avaliação" : "avaliações"} de quem comprou</span>
            <ul className="dist">
              {dist.map(({ n, count }) => (
                <li key={n}>
                  <span>{n}★</span>
                  <span className="bar"><span className="fill" style={{ width: `${(count / total) * 100}%` }} /></span>
                  <span className="muted small">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="review-list">
            {reviews.map((r) => (
              <li key={r.id}>
                <div className="review-head">
                  <span className="stars" aria-label={`${r.rating} de 5 estrelas`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <b>{r.author}</b>
                  <span className="pill pill-ok">Compra verificada</span>
                  <span className="muted small">{dateFmt.format(new Date(r.created_at))}</span>
                </div>
                {r.comment && <p>{r.comment}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
