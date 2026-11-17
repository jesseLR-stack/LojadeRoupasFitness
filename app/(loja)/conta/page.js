import Link from "next/link";
import { redirect } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import { db } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/orders";
import { PAY_OPTIONS, SHIP_OPTIONS, brl } from "@/lib/pricing";
import { colorOf } from "@/lib/colors";
import { currentCustomer } from "@/lib/session";
import { logout } from "./actions";
import ReviewForm from "./ReviewForm";

export const metadata = { title: "Meus pedidos", robots: { index: false } };

const STEPS = ["novo", "pago", "enviado", "entregue"];
const STEP_HINT = {
  novo: "Aguardando a confirmação do pagamento.",
  pago: "Pagamento confirmado. Estamos separando seu pedido.",
  enviado: "Seu pedido está a caminho.",
  entregue: "Pedido entregue. Conta pra gente o que achou!",
  cancelado: "Pedido cancelado.",
};
const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "America/Sao_Paulo" });

function Timeline({ status }) {
  if (status === "cancelado") return <p className="pill pill-bad">Cancelado</p>;
  const current = STEPS.indexOf(status);
  return (
    <ol className="timeline" aria-label={`Status: ${ORDER_STATUSES[status]}`}>
      {STEPS.map((s, i) => (
        <li key={s} className={i < current ? "done" : i === current ? "current" : ""}>
          <span aria-hidden="true">{i < current ? "✓" : i + 1}</span>{ORDER_STATUSES[s]}
        </li>
      ))}
    </ol>
  );
}

export default async function AccountPage() {
  const customer = await currentCustomer();
  if (!customer) redirect("/conta/entrar");

  const [orders, catalog, myReviews] = await Promise.all([
    db.listCustomerOrders(customer.id),
    db.listProducts({ includeInactive: true }),
    db.listReviews({ customerId: customer.id, limit: 500 }),
  ]);
  const productById = new Map(catalog.map((p) => [p.id, p]));
  const reviewByProduct = new Map(myReviews.map((r) => [r.product_id, r]));

  return (
    <div className="account">
      <div className="account-head">
        <div>
          <p className="eyebrow">Minha conta</p>
          <h1>Olá, {customer.name.split(" ")[0]}!</h1>
          <p className="muted">{customer.email}</p>
        </div>
        <form action={logout}><button className="btn btn-ghost small">Sair</button></form>
      </div>

      <h2 className="section-title small">Meus pedidos</h2>
      {orders.length === 0 ? (
        <div className="admin-empty">
          <p><b>Você ainda não fez nenhum pedido com esta conta.</b></p>
          <Link href="/#loja" className="btn btn-primary small">Ver produtos</Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <article key={o.number} className="order-card">
              <header>
                <div>
                  <b>Pedido {o.number}</b>
                  <span className="muted small"> · {dateFmt.format(new Date(o.created_at))}</span>
                </div>
                <strong>{brl(Number(o.total))}</strong>
              </header>
              <Timeline status={o.status} />
              <p className="muted small">
                {STEP_HINT[o.status]} {SHIP_OPTIONS[o.ship]?.label} · {PAY_OPTIONS[o.pay]?.label}
                {o.installments > 1 ? ` em ${o.installments}x` : ""}
              </p>
              <ul className="order-lines">
                {o.items.map((i) => {
                  const p = productById.get(i.id);
                  return (
                    <li key={`${i.id}-${i.color}-${i.size}`}>
                      <div className={`thumb sm ${p?.images?.length ? "has-photo" : ""}`} data-bg={i.color}>
                        {p && <ProductImage product={p} color={i.color} />}
                      </div>
                      <div className="ol-info">
                        {p?.active ? <Link href={`/produto/${p.slug}`}>{i.name}</Link> : <span>{i.name}</span>}
                        <small className="muted">{i.qty}× · {colorOf(i.color).name} · {i.size} · {brl(i.price)}</small>
                        {o.status === "entregue" && p && (
                          <ReviewForm productId={i.id} orderNumber={o.number} existing={reviewByProduct.get(i.id) ?? null} />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
