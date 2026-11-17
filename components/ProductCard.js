"use client";

import Link from "next/link";
import { colorOf } from "@/lib/colors";
import { brl } from "@/lib/pricing";
import ProductImage from "./ProductImage";
import { useStore } from "./StoreProvider";
import Rating from "./Rating";
import { HeartIcon } from "./icons";

const MAX_SWATCHES = 6;

export default function ProductCard({ product: p }) {
  const { favs, toggleFav, addToCart } = useStore();
  const fav = favs.includes(p.id);
  const soldOut = p.stock <= 0;
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  const quickAdd = (e) => {
    e.preventDefault();
    addToCart(p.id, p.colors[0], p.sizes.includes("M") ? "M" : p.sizes[0]);
  };

  return (
    <article className={`card ${soldOut ? "sold-out" : ""}`}>
      <div className={`card-media ${p.images?.length ? "has-photo" : ""}`} data-bg={p.colors[0]}>
        <div className="tags">
          {soldOut && <span className="tag tag-out">Esgotado</span>}
          {!soldOut && p.tag && <span className="tag">{p.tag}</span>}
          {discount > 0 && <span className="tag tag-off">-{discount}%</span>}
        </div>
        <button
          className={`fav-btn ${fav ? "on" : ""}`}
          onClick={() => toggleFav(p.id)}
          aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
          aria-pressed={fav}
        >
          <HeartIcon />
        </button>
        <Link href={`/produto/${p.slug}`} className="card-link" aria-label={p.name}>
          <ProductImage product={p} />
        </Link>
        {!soldOut && <button className="quick-add" onClick={quickAdd}>+ Adicionar rápido</button>}
      </div>
      <Link href={`/produto/${p.slug}`} className="card-body">
        <div className="swatches">
          {p.colors.slice(0, MAX_SWATCHES).map((c) => <span key={c} style={{ background: colorOf(c).hex }} title={colorOf(c).name} />)}
          {p.colors.length > MAX_SWATCHES && <small className="more-colors">+{p.colors.length - MAX_SWATCHES}</small>}
        </div>
        <h3>{p.name}</h3>
        <Rating product={p} />
        <p className="price">{p.oldPrice && <s>{brl(p.oldPrice)}</s>}<strong>{brl(p.price)}</strong></p>
        <p className="installments">ou 6x de {brl(p.price / 6)}</p>
      </Link>
    </article>
  );
}
