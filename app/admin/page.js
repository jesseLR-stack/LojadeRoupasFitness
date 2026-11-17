import Link from "next/link";
import { LOW_STOCK, summarize } from "@/lib/analytics";
import { db } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/orders";
import { brl } from "@/lib/pricing";
import RevenueChart from "./RevenueChart";

export default async function AdminDashboard() {
  const [orders, products] = await Promise.all([db.listOrders({ limit: 1000 }), db.listProducts({ includeInactive: true })]);
  const s = summarize(orders, products);
  const topMax = Math.max(1, ...s.top.map((t) => t.qty));

  return (
    <>
      <div className="admin-head">
        <h1>Visão geral</h1>
        <Link href="/admin/pedidos" className="btn btn-ghost small">Ver pedidos</Link>
      </div>

      <section className="stat-row five" aria-label="Resumo">
        <div className="stat"><span>Faturamento</span><strong>{brl(s.revenue)}</strong><small>{s.sales} {s.sales === 1 ? "venda" : "vendas"}, sem cancelados</small></div>
        <div className="stat"><span>Ticket médio</span><strong>{brl(s.avgTicket)}</strong><small>valor médio por pedido</small></div>
        <div className="stat"><span>Últimos 14 dias</span><strong>{brl(s.periodRevenue)}</strong><small>{s.periodOrders} {s.periodOrders === 1 ? "pedido" : "pedidos"}</small></div>
        <Link href="/admin/pedidos" className={`stat ${s.toShip ? "attention" : ""}`}>
          <span>Para separar</span><strong>{s.toShip}</strong><small>novos ou pagos</small>
        </Link>
        <Link href="/admin/produtos" className={`stat ${s.lowStock.length ? "warn" : ""}`}>
          <span>Estoque baixo</span><strong>{s.lowStock.length}</strong><small>{LOW_STOCK} unidades ou menos</small>
        </Link>
      </section>

      <div className="dash-grid">
        <section className="panel wide">
          <h2>Faturamento por dia</h2>
          <p className="muted small">Últimos 14 dias, em reais. Pedidos cancelados não entram.</p>
          {s.periodOrders === 0 ? (
            <p className="chart-empty">Nenhuma venda nos últimos 14 dias. As barras aparecem conforme os pedidos chegam.</p>
          ) : (
            <RevenueChart daily={s.daily} />
          )}
        </section>

        <section className="panel">
          <h2>Mais vendidos</h2>
          <p className="muted small">Unidades vendidas, todos os pedidos.</p>
          {s.top.length === 0 ? (
            <p className="chart-empty">Sem vendas ainda.</p>
          ) : (
            <ul className="hbars">
              {s.top.map((t) => (
                <li key={t.id} title={`${t.name}: ${t.qty} unidade(s), ${brl(t.revenue)}`}>
                  <span className="hb-name">{t.name}</span>
                  <span className="hb-track"><span className="hb-bar" style={{ width: `${(t.qty / topMax) * 100}%` }} /></span>
                  <span className="hb-val">{t.qty} un.</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Pedidos por status</h2>
          <ul className="status-list">
            {Object.entries(ORDER_STATUSES).map(([k, label]) => (
              <li key={k}><span className={`status-dot st-${k}`} aria-hidden="true" />{label}<b>{s.byStatus[k] ?? 0}</b></li>
            ))}
          </ul>
          {s.lowStock.length > 0 && (
            <>
              <h3>Estoque baixo</h3>
              <ul className="low-list">
                {s.lowStock.map((p) => (
                  <li key={p.id}><Link href={`/admin/produtos/${p.id}`}>{p.name}</Link><span className={`pill ${p.stock === 0 ? "pill-bad" : "pill-warn"}`}>{p.stock === 0 ? "Esgotado" : `${p.stock} un.`}</span></li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </>
  );
}
