import Link from "next/link";
import ProductArt from "@/components/ProductArt";
import { FREE_SHIPPING, MAX_INSTALLMENTS, PIX_DISCOUNT, brl } from "@/lib/pricing";
import { SEED_PRODUCTS } from "@/lib/products";

export const metadata = {
  title: "Sobre nós",
  description: "A NewFitness faz roupa só para quem treina: leggings, tops, shorts, regatas e jaquetas pensadas para o movimento.",
};

const PILLARS = [
  { title: "Só fitness", text: "Não fazemos moda casual com cara de academia. Cada peça é pensada para um tipo de treino: musculação, corrida, yoga e pilates ou cross." },
  { title: "Teste do agachamento", text: "Legging que fica transparente ou top que não segura não entra no catálogo. Tecido opaco, costura que não machuca e cós que não desce." },
  { title: "Tamanho sem susto", text: "Cada produto tem guia de medidas em centímetros. Se mesmo assim não servir, a primeira troca é por nossa conta." },
];

export default function AboutPage() {
  return (
    <div className="about">
      <section className="about-hero">
        <div>
          <p className="eyebrow">Sobre a NewFitness</p>
          <h1>Roupa de treino feita <span className="accent">para treinar.</span></h1>
          <p className="policy-intro">
            A NewFitness nasceu de uma frustração comum: peças bonitas na vitrine que não aguentam o primeiro treino de verdade.
            Por isso vendemos uma coisa só, roupa fitness, e escolhemos cada peça pelo que ela faz em movimento.
          </p>
        </div>
        <div className="about-art" aria-hidden="true">
          <div data-bg="lima"><ProductArt product={SEED_PRODUCTS[1]} color="lima" /></div>
          <div data-bg="vinho"><ProductArt product={SEED_PRODUCTS[0]} color="vinho" /></div>
        </div>
      </section>

      <section className="about-pillars">
        {PILLARS.map((p) => (
          <article key={p.title}>
            <h2>{p.title}</h2>
            <p>{p.text}</p>
          </article>
        ))}
      </section>

      <section className="about-promises">
        <h2 className="section-title">Nossos compromissos</h2>
        <ul>
          <li><b>Frete grátis</b> em compras a partir de {brl(FREE_SHIPPING)}.</li>
          <li><b>Até {MAX_INSTALLMENTS}x sem juros</b> no cartão ou {PIX_DISCOUNT * 100}% de desconto no Pix.</li>
          <li><b>Troca grátis em até 30 dias</b> e devolução em 7 dias. <Link href="/trocas-e-devolucoes">Veja como funciona</Link>.</li>
          <li><b>Avaliações reais:</b> só quem recebeu o produto pode avaliar, e nenhuma nota é inventada.</li>
          <li><b>Seus dados protegidos</b>, usados só para entregar seu pedido. <Link href="/privacidade">Política de privacidade</Link>.</li>
        </ul>
        <Link href="/#loja" className="btn btn-primary">Ver a coleção <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
