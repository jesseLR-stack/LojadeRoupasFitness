import { couponStatusLabel } from "@/lib/coupons";
import { db } from "@/lib/db";
import { deleteCouponAction, toggleCoupon } from "../actions";
import CouponForm from "./CouponForm";

const dateFmt = (d) => (d ? new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR") : "Sem validade");

export default async function AdminCoupons({ searchParams }) {
  const { salvo, editar } = await searchParams;
  let coupons = [];
  let tableMissing = false;
  try {
    coupons = await db.listCoupons();
  } catch {
    tableMissing = true;
  }
  const editing = editar ? coupons.find((c) => c.code === editar) : null;

  return (
    <>
      <div className="admin-head"><h1>Cupons</h1></div>
      {tableMissing && (
        <p className="form-error">A tabela de cupons ainda não existe. Rode o arquivo supabase/003_clientes_avaliacoes_cupons.sql no Supabase.</p>
      )}
      {salvo && <p className="admin-notice" role="status">Cupom salvo. Ele já vale na loja.</p>}

      <div className="coupon-layout">
        <section className="panel">
          <h2>{editing ? `Editar ${editing.code}` : "Novo cupom"}</h2>
          <CouponForm key={editing?.code ?? "novo"} coupon={editing} />
        </section>

        <section>
          {coupons.length === 0 ? (
            <div className="admin-empty"><p><b>Nenhum cupom cadastrado.</b></p></div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>Código</th><th className="num">Desconto</th><th>Validade</th><th className="num">Usos</th><th>Situação</th><th></th></tr></thead>
                <tbody>
                  {coupons.map((c) => {
                    const label = couponStatusLabel(c);
                    return (
                      <tr key={c.code} className={label !== "Valendo" ? "inactive" : ""}>
                        <td><b>{c.code}</b></td>
                        <td className="num">{c.percent}%</td>
                        <td>{dateFmt(c.expires_at)}</td>
                        <td className="num">{c.uses}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                        <td><span className={`pill ${label === "Valendo" ? "pill-ok" : "pill-warn"}`}>{label}</span></td>
                        <td className="row-actions">
                          <a className="btn btn-ghost small" href={`/admin/cupons?editar=${encodeURIComponent(c.code)}`}>Editar</a>
                          <form action={toggleCoupon}><input type="hidden" name="code" value={c.code} /><button className="btn btn-ghost small">{c.active ? "Desativar" : "Ativar"}</button></form>
                          <form action={deleteCouponAction}><input type="hidden" name="code" value={c.code} /><button className="btn btn-ghost small danger" aria-label={`Excluir cupom ${c.code}`}>Excluir</button></form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="muted small">O desconto vale sobre os produtos (não sobre o frete). Um cupom por pedido.</p>
        </section>
      </div>
    </>
  );
}
