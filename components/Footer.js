import Link from "next/link";
import { STORE } from "@/lib/store";
import SizeGuide from "./SizeGuide";

export default function Footer() {
  const docLabel = STORE.document.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF";
  return (
    <footer className="footer">
      <div>
        <Link href="/" className="logo">New<span>Fitness</span></Link>
        <p>Moda fitness de alta performance.</p>
      </div>
      <div>
        <h4>Loja</h4>
        <Link href="/?genero=feminino#loja">Feminino</Link>
        <Link href="/?genero=masculino#loja">Masculino</Link>
        <Link href="/#colecoes">Coleções</Link>
        <SizeGuide className="footer-link" />
      </div>
      <div>
        <h4>Ajuda</h4>
        <Link href="/trocas-e-devolucoes">Trocas e devoluções</Link>
        <Link href="/entrega">Entrega e frete</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/termos">Termos de uso</Link>
        <Link href="/contato">Fale conosco</Link>
      </div>
      <div className="copy">
        <p>© 2026 {STORE.legalName || "NewFitness"}. Todos os direitos reservados.</p>
        {(STORE.document || STORE.address) && (
          <p>
            {STORE.document && <>{docLabel} {STORE.document}</>}
            {STORE.document && STORE.address && " · "}
            {STORE.address}
          </p>
        )}
      </div>
    </footer>
  );
}
