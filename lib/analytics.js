// Números do painel calculados a partir dos pedidos (cancelados não contam como venda).
export const LOW_STOCK = 5;

const dayKey = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(d));
const dayLabel = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" });

export function summarize(orders, products, { days = 14, now = new Date() } = {}) {
  const sales = orders.filter((o) => o.status !== "cancelado");
  const revenue = sales.reduce((s, o) => s + Number(o.total), 0);

  // Faturamento por dia nos últimos `days` dias (dias sem venda aparecem com zero).
  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    daily.push({ key: dayKey(d), label: dayLabel.format(d), weekday: weekday.format(d).replace(".", ""), total: 0, orders: 0 });
  }
  const byKey = new Map(daily.map((d) => [d.key, d]));
  for (const o of sales) {
    const d = byKey.get(dayKey(o.created_at));
    if (d) { d.total = Math.round((d.total + Number(o.total)) * 100) / 100; d.orders += 1; }
  }
  const periodRevenue = daily.reduce((s, d) => s + d.total, 0);
  const periodOrders = daily.reduce((s, d) => s + d.orders, 0);

  // Produtos mais vendidos (por unidades).
  const top = new Map();
  for (const o of sales) {
    for (const i of o.items) {
      const t = top.get(i.id) ?? { id: i.id, name: i.name, qty: 0, revenue: 0 };
      t.qty += i.qty;
      t.revenue += i.qty * Number(i.price);
      top.set(i.id, t);
    }
  }

  return {
    orders: orders.length,
    sales: sales.length,
    revenue,
    avgTicket: sales.length ? revenue / sales.length : 0,
    toShip: orders.filter((o) => o.status === "novo" || o.status === "pago").length,
    lowStock: products.filter((p) => p.active && p.stock <= LOW_STOCK),
    daily,
    periodRevenue,
    periodOrders,
    top: [...top.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, 5),
    byStatus: orders.reduce((m, o) => ({ ...m, [o.status]: (m[o.status] ?? 0) + 1 }), {}),
  };
}

// Valor "redondo" para o topo do eixo (ex.: 1.234 -> 1.500).
export function niceMax(v) {
  if (v <= 0) return 100;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}
