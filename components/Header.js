"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "./StoreProvider";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "./icons";

export default function Header() {
  const { cart, favs, openCart, bump } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="announce">
        <span>FRETE GRÁTIS acima de R$ 299</span>
        <span>•</span>
        <span>10% OFF na 1ª compra: <strong>NEW10</strong></span>
        <span>•</span>
        <span>Troca grátis em 30 dias</span>
      </div>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <Link href="/" className="logo">New<span>Fitness</span></Link>
        <nav className="nav">
          <Link href="/#loja">Loja</Link>
          <Link href="/?genero=feminino#loja">Feminino</Link>
          <Link href="/?genero=masculino#loja">Masculino</Link>
          <Link href="/#colecoes">Coleções</Link>
          <Link href="/sobre">Sobre</Link>
        </nav>
        <div className="header-actions">
          <Link className="icon-btn" href="/?busca=1#loja" aria-label="Buscar"><SearchIcon /></Link>
          <Link className="icon-btn" href="/?favoritos=1#loja" aria-label="Ver favoritos">
            <HeartIcon />
            <span className={`cart-count ${favs.length ? "show" : ""}`}>{favs.length}</span>
          </Link>
          <Link className="icon-btn" href="/conta" aria-label="Minha conta e pedidos"><UserIcon /></Link>
          <button key={bump} className={`icon-btn cart-btn ${bump ? "bump" : ""}`} onClick={openCart} aria-label="Abrir sacola">
            <BagIcon />
            <span className={`cart-count ${count ? "show" : ""}`}>{count}</span>
          </button>
        </div>
      </header>
    </>
  );
}
