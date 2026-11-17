import Link from "next/link";
import { Suspense } from "react";
import Newsletter from "@/components/Newsletter";
import ProductArt from "@/components/ProductArt";
import ShopSection from "@/components/ShopSection";
import { SEED_PRODUCTS } from "@/lib/products";

const MARQUEE = ["LEGGINGS", "TOPS", "SHORTS", "REGATAS", "JAQUETAS", "CAMISETAS"];

const COLLECTION_CARDS = [
  { id: "musculacao", cls: "c1", title: "Musculação", text: "Compressão e liberdade de movimento" },
  { id: "corrida", cls: "c2", title: "Corrida", text: "Leve, respirável e refletiva" },
  { id: "yoga", cls: "c3", title: "Yoga & Pilates", text: "Toque macio, cintura alta" },
  { id: "crossfit", cls: "c4", title: "Cross", text: "Resistência pra treino pesado" },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Coleção Verão 2027</p>
          <h1>Feita pra<br /><span className="outline">quem não</span><br /><span className="accent">para.</span></h1>
          <p className="hero-sub">
            Tecidos de compressão, secagem rápida e proteção UV. Roupas criadas para treino, corrida, yoga e o dia a dia ativo.
          </p>
          <div className="hero-cta">
            <Link href="#loja" className="btn btn-primary">Comprar agora</Link>
            <Link href="#colecoes" className="btn btn-ghost">Ver coleções</Link>
          </div>
          <ul className="hero-stats">
            <li><strong>Frete grátis</strong><span>acima de R$ 299</span></li>
            <li><strong>6x sem juros</strong><span>ou 5% off no Pix</span></li>
            <li><strong>Troca grátis</strong><span>em até 30 dias</span></li>
          </ul>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="blob" />
          <div className="hero-card hero-card-1" data-bg="vinho"><ProductArt product={SEED_PRODUCTS[0]} color="vinho" /></div>
          <div className="hero-card hero-card-2" data-bg="verde-limao"><ProductArt product={SEED_PRODUCTS[1]} color="verde-limao" /></div>
          <div className="badge-spin">
            <svg viewBox="0 0 100 100">
              <defs><path id="circ" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1 -76 0" /></defs>
              <text><textPath href="#circ">MOVE • SWEAT • REPEAT • MOVE • SWEAT • </textPath></text>
            </svg>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].flatMap((w, i) => [<span key={`w${i}`}>{w}</span>, <span key={`s${i}`}>✦</span>])}
        </div>
      </div>

      <section className="collections" id="colecoes">
        <h2 className="section-title">Treine do seu jeito</h2>
        <div className="collection-grid">
          {COLLECTION_CARDS.map((c) => (
            <Link key={c.id} href={`/?modalidade=${c.id}#loja`} className={`collection ${c.cls}`}>
              <span>{c.title}</span><small>{c.text}</small>
            </Link>
          ))}
        </div>
      </section>

      <Suspense fallback={<section className="shop" id="loja" />}>
        <ShopSection />
      </Suspense>

      <section className="benefits">
        <div><strong>Frete grátis</strong><span>em compras acima de R$ 299</span></div>
        <div><strong>Até 6x sem juros</strong><span>no cartão ou 5% off no Pix</span></div>
        <div><strong>Troca fácil</strong><span>30 dias pra trocar sem custo</span></div>
        <div><strong>Compra segura</strong><span>seus dados protegidos</span></div>
      </section>

      <Newsletter />
    </>
  );
}
