"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveCouponAction } from "../actions";

function Err({ msg }) {
  return msg ? <small className="err">{msg}</small> : null;
}

export default function CouponForm({ coupon }) {
  const [state, action, pending] = useActionState(saveCouponAction, null);
  const v = state?.values ?? coupon ?? {};
  const e = state?.errors ?? {};
  return (
    <form action={action} className="admin-form">
      {coupon && <input type="hidden" name="original" value={coupon.code} />}
      <label className="field">
        <span>Código</span>
        <input id="coupon-code" name="code" defaultValue={v.code} placeholder="VERAO20" required style={{ textTransform: "uppercase" }} />
        <Err msg={e.code} />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Desconto (%)</span>
          <input id="coupon-percent" name="percent" inputMode="numeric" defaultValue={v.percent} placeholder="20" required />
          <Err msg={e.percent} />
        </label>
        <label className="field">
          <span>Limite de usos (opcional)</span>
          <input id="coupon-max" name="max_uses" inputMode="numeric" defaultValue={v.max_uses ?? ""} placeholder="Sem limite" />
          <Err msg={e.max_uses} />
        </label>
      </div>
      <label className="field">
        <span>Válido até (opcional)</span>
        <input id="coupon-expires" name="expires_at" type="date" defaultValue={v.expires_at ? String(v.expires_at).slice(0, 10) : ""} />
        <Err msg={e.expires_at} />
      </label>
      <label className="check">
        <input type="checkbox" name="active" defaultChecked={v.active ?? true} /> Ativo
      </label>
      <div className="row">
        {coupon && <Link href="/admin/cupons" className="btn btn-ghost small">Cancelar</Link>}
        <button className="btn btn-primary small" disabled={pending}>{pending ? "Salvando…" : coupon ? "Salvar cupom" : "Criar cupom"}</button>
      </div>
    </form>
  );
}
