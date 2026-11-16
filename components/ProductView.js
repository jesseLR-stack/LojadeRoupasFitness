"use client";

import { useState } from "react";
import { COLORS, categoryLabel } from "@/lib/products";
import { PIX_DISCOUNT, brl } from "@/lib/pricing";
import ProductArt from "./ProductArt";
import SizeGuide from "./SizeGuide";
import { useStore } from "./StoreProvider";
import { HeartIcon, stars } from "./icons";

export default function ProductView({ product: p }) {
  const { addToCart, openCart, toast, favs, toggleFav } = useStore();
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState(null);
  const [shake, setShake] = useState(false);
  const fav = favs.includes(p.id);

  const add = () => {
    if (!size) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return toast("Escolha um tamanho 😉");
    }
    addToCart(p.id, color, size);
    openCart();
  };

  return (
    <div className="pdp">
      <div className="pdp-media" data-bg={color}>
        <ProductArt product={p} color={color} />
      </div>
      <div className="pdp-info">
        <p className="eyebrow">{categoryLabel(p.category)} · {p.gender}</p>
        <h1>{p.name}</h1>
        <p className="rating"><span>{stars(p.rating)}</span> {p.rating} · {p.reviews} avaliações</p>
        <p className="price big">{p.oldPrice && <s>{brl(p.oldPrice)}</s>}<strong>{brl(p.price)}</strong></p>
        <p className="installments">
          6x de {brl(p.price / 6)} sem juros · {brl(p.price * (1 - PIX_DISCOUNT))} no Pix
        </p>
        <p className="desc">{p.description}</p>

        <p className="opt-label">Cor: <b>{COLORS[color].name}</b></p>
        <div className="color-opts">
          {p.colors.map((c) => (
            <button
              key={c}
              className={`color-opt ${c === color ? "active" : ""}`}
              style={{ "--sw": COLORS[c].hex }}
              onClick={() => setColor(c)}
              aria-label={COLORS[c].name}
              aria-pressed={c === color}
            />
          ))}
        </div>

        <div className="opt-label">Tamanho: <b>{size || "selecione"}</b> <SizeGuide /></div>
        <div className={`size-opts ${shake ? "shake" : ""}`}>
          {p.sizes.map((s) => (
            <button key={s} className={`size-opt ${s === size ? "active" : ""}`} onClick={() => setSize(s)} aria-pressed={s === size}>
              {s}
            </button>
          ))}
        </div>

        <div className="pdp-actions">
          <button className="btn btn-primary" onClick={add}>Adicionar à sacola</button>
          <button
            className={`btn btn-ghost fav-inline ${fav ? "on" : ""}`}
            onClick={() => toggleFav(p.id)}
            aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
            aria-pressed={fav}
          >
            <HeartIcon />
          </button>
        </div>
        <ul className="perks">
          <li>✓ Tecido Dry‑Fit antissuor</li>
          <li>✓ Troca grátis em 30 dias</li>
          <li>✓ Envio em até 24h úteis</li>
        </ul>
      </div>
    </div>
  );
}
