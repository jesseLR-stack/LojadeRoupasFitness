import { db } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/orders";
import { PAY_OPTIONS, SHIP_OPTIONS, brl } from "@/lib/pricing";
import { colorOf } from "@/lib/colors";
import StatusSelect from "./StatusSelect";

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function AdminOrders() {
  const orders = await db.listOrders({ limit: 200 });

  return (
    <>
      <div className="admin-head">
        <h1>Pedidos</h1>
      </div>


      {orders.length === 0 ? (
        <div className="admin-empty">
          <p><b>Nenhum pedido ainda.</b></p>
          <p className="muted">Quando alguém finalizar uma compra na loja, o pedido aparece aqui.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Pedido</th><th>Data</th><th>Cliente</th><th>Itens</th><th>Pagamento</th><th className="num">Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.number}>
                  <td><b>{o.number}</b></td>
                  <td>{dateFmt.format(new Date(o.created_at))}</td>
                  <td>
                    <details>
                      <summary>{o.customer.nome}</summary>
                      <p className="muted small">
                        {o.customer.email} · {o.customer.tel}<br />
                        CPF {o.customer.cpf}<br />
                        {o.customer.rua}, {o.customer.numero} {o.customer.compl} · {o.customer.bairro}<br />
                        {o.customer.cidade}/{o.customer.uf} · CEP {o.customer.cep}<br />
                        Envio: {SHIP_OPTIONS[o.ship]?.label ?? o.ship}
                      </p>
                    </details>
                  </td>
                  <td>
                    <ul className="order-items">
                      {o.items.map((i, k) => (
                        <li key={k}>{i.qty}× {i.name} <span className="muted">({colorOf(i.color).name}, {i.size})</span></li>
                      ))}
                    </ul>
                  </td>
                  <td>{PAY_OPTIONS[o.pay]?.label ?? o.pay}{o.installments > 1 ? ` ${o.installments}x` : ""}</td>
                  <td className="num"><b>{brl(Number(o.total))}</b></td>
                  <td><StatusSelect number={o.number} status={o.status} statuses={ORDER_STATUSES} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
