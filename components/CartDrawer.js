"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { COLORS } from "@/lib/products";
import { FREE_SHIPPING, brl, cartTotals } from "@/lib/pricing";
import ProductImage from "./ProductImage";
import { useStore } from "./StoreProvider";

export default function CartDrawer() {
  const { catalog, cart, coupon, cartOpen, closeCart, changeQty, removeItem, applyCoupon } = useStore();
  const [code, setCode] = useState("");
  const router = useRouter();
  const t = cartTotals(cart, coupon, {}, catalog);
  const missing = FREE_SHIPPING - t.base;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      <div className={`overlay ${cartOpen ? "show" : ""}`} onClick={closeCart} />
      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-label="Sacola de compras" aria-hidden={!cartOpen}>
        <div className="cart-head">
          <h3>Sua sacola</h3>
          <button className="icon-btn" onClick={closeCart} aria-label="Fechar sacola">✕</button>
        </div>
        <div className="ship-progress">
          <p>
            {t.subtotal === 0 ? <>Frete grátis acima de <b>{brl(FREE_SHIPPING)}</b></>
              : missing > 0 ? <>Faltam <b>{brl(missing)}</b> para o frete grátis 🚚</>
              : <>Você ganhou <b>frete grátis</b>! 🎉</>}
          </p>
          <div className="bar"><div className="fill" style={{ width: `${Math.min(100, (t.base / FREE_SHIPPING) * 100)}%` }} /></div>
        </div>

        <ul className="cart-items">
          {t.lines.length === 0 && (
            <li className="cart-empty">
              <p>Sua sacola está vazia.</p>
              <Link href="/#loja" className="btn btn-ghost small" onClick={closeCart}>Começar a comprar</Link>
            </li>
          )}
          {t.lines.map((l) => (
            <li className="cart-item" key={l.key}>
              <Link href={`/produto/${l.product.slug}`} className={`thumb ${l.product.images?.length ? "has-photo" : ""}`} data-bg={l.color} onClick={closeCart}>
                <ProductImage product={l.product} color={l.color} />
              </Link>
              <div className="ci-info">
                <p className="ci-name">{l.product.name}</p>
                <p className="ci-meta">{COLORS[l.color].name} · {l.size}</p>
                <div className="qty">
                  <button onClick={() => changeQty(l.key, -1)} aria-label="Diminuir">−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => changeQty(l.key, 1)} aria-label="Aumentar">+</button>
                </div>
              </div>
              <div className="ci-right">
                <strong>{brl(l.product.price * l.qty)}</strong>
                <button className="remove" onClick={() => removeItem(l.key)}>Remover</button>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-foot">
          <form className="coupon" onSubmit={(e) => { e.preventDefault(); if (applyCoupon(code)) setCode(""); }}>
            <input id="couponInput" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Cupom de desconto" />
            <button className="btn btn-ghost small" type="submit">Aplicar</button>
          </form>
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>{brl(t.subtotal)}</dd></div>
            {t.discount > 0 && <div className="disc"><dt>Cupom {coupon}</dt><dd>− {brl(t.discount)}</dd></div>}
            <div><dt>Frete</dt><dd>{t.shipping ? brl(t.shipping) : "Grátis"}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{brl(t.total)}</dd></div>
          </dl>
          <button
            className="btn btn-primary full"
            disabled={t.lines.length === 0}
            onClick={() => { closeCart(); router.push("/checkout"); }}
          >
            Finalizar compra
          </button>
        </div>
      </aside>
    </>
  );
}
